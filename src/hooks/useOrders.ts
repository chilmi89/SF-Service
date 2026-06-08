"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api/api-client";
import { simulatePaymentAction } from "./useOrdersActions";

export interface OrderItem {
  id: string;
  tanggal_order: string;
  jam: string;
  status: number;
  catatan: string;
  layanan: {
    nama_layanan: string;
    harga_dasar: number;
    tenant_id: string;
  };
  transactions: {
    invoice_number: string;
    total_bayar: number;
    status_pembayaran: number;
  } | null;
}

export function useOrders() {
  const { isLoggedIn, userRole, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"semua" | "aktif" | "riwayat">("semua");
  const [toast, setToast] = useState<{ title: string; message: string; type: "success" | "error" | "warning" } | null>(null);
  
  // States for Payment Modal Simulation
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<OrderItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await apiClient("/api/orders");
      if (error) {
        setToast({
          title: "Gagal Memuat Pesanan",
          message: error || "Terjadi kesalahan pada server.",
          type: "error"
        });
      } else {
        const rawOrders = data?.data || data || [];
        const mappedOrders = (Array.isArray(rawOrders) ? rawOrders : []).map((o: any) => {
          const tx = Array.isArray(o.transactions) ? o.transactions[0] : o.transactions;
          return {
            ...o,
            transactions: tx || null,
          };
        });
        setOrders(mappedOrders);
      }
    } catch (err) {
      console.error("Gagal mengambil data pesanan:", err);
      setToast({
        title: "Kesalahan Koneksi",
        message: "Tidak dapat terhubung ke server.",
        type: "error"
      });
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!isLoggedIn) {
        setToast({
          title: "Login Diperlukan",
          message: "Silakan login terlebih dahulu untuk melihat pesanan Anda.",
          type: "warning"
        });
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else if (userRole?.toLowerCase() !== "user biasa") {
        setToast({
          title: "Akses Dibatasi",
          message: "Halaman ini hanya untuk pelanggan biasa.",
          type: "error"
        });
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      } else {
        fetchOrders();
      }
    }
  }, [isLoggedIn, userRole, authLoading, router, fetchOrders]);

  const handleSimulatePayment = async () => {
    if (!selectedPaymentOrder) return;
    setIsPaying(true);
    
    try {
      // 1. Panggil Server Action untuk mengupdate data di DB (bypassing RLS)
      const res = await simulatePaymentAction(selectedPaymentOrder.id);
      
      if (!res.success) {
        throw new Error(res.error || "Gagal memperbarui status pembayaran di database.");
      }

      setToast({
        title: "Pembayaran Berhasil",
        message: `Tagihan untuk invoice ${selectedPaymentOrder.transactions?.invoice_number} berhasil dibayar secara simulasi.`,
        type: "success"
      });
    } catch (err: any) {
      console.error("Gagal melakukan simulasi pembayaran:", err);
      setToast({
        title: "Pembayaran Gagal",
        message: err.message || "Gagal memperbarui status pembayaran.",
        type: "error"
      });
    } finally {
      setIsPaying(false);
      setIsPaymentModalOpen(false);
      setSelectedPaymentOrder(null);
      // Panggil fetchOrders() agar state lokal tersinkronisasi sepenuhnya dengan DB
      fetchOrders();
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "aktif") {
      return [2, 5, 7].includes(order.status);
    }
    if (activeTab === "riwayat") {
      return [6, 8].includes(order.status);
    }
    return true;
  });

  return {
    orders,
    loadingOrders: authLoading || (loadingOrders && orders.length === 0),
    activeTab,
    setActiveTab,
    toast,
    setToast,
    selectedPaymentOrder,
    setSelectedPaymentOrder,
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    isPaying,
    handleSimulatePayment,
    filteredOrders,
    fetchOrders,
  };
}
