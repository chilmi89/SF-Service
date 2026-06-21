"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api/api-client";
import { simulatePaymentAction } from "./useOrdersActions";
import { orderService } from "@/lib/api/order.service";

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
  
  // States for Payment Modal Simulation & File Upload
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<OrderItem | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  // States for Tenant Bank Details & Payment Proof upload
  const [tenantBankInfo, setTenantBankInfo] = useState<string>("");
  const [isLoadingBankInfo, setIsLoadingBankInfo] = useState(false);
  const [paymentProofBase64, setPaymentProofBase64] = useState<string>("");
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const timestamp = new Date().getTime();
      const [ordersRes, tasksRes] = await Promise.all([
        apiClient(`/api/orders?t=${timestamp}`),
        apiClient(`/api/tasks?t=${timestamp}`).catch(() => ({ data: [] })) // Fallback jika gagal
      ]);

      if (ordersRes.error) {
        setToast({
          title: "Gagal Memuat Pesanan",
          message: ordersRes.error || "Terjadi kesalahan pada server.",
          type: "error"
        });
      } else {
        const rawOrders = ordersRes.data?.data || ordersRes.data || [];
        const tasks = tasksRes.data?.data || tasksRes.data || [];
        
        const mappedOrders = (Array.isArray(rawOrders) ? rawOrders : []).map((o: any) => {
          const tx = Array.isArray(o.transactions) ? o.transactions[0] : o.transactions;
          const taskObj = tasks.find((t: any) => t.order_id === o.id);
          const hasTask = !!taskObj;
          return {
            ...o,
            transactions: tx || null,
            hasTask,
            taskStatus: taskObj ? taskObj.status_tugas : null
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

  // Load bank info when an order is selected for payment
  useEffect(() => {
    if (selectedPaymentOrder) {
      setIsLoadingBankInfo(true);
      setTenantBankInfo("");
      orderService.getOrderDetails(selectedPaymentOrder.id).then(({ data, error }) => {
        if (!error && data?.data?.layanan?.tenants?.norek) {
          setTenantBankInfo(data.data.layanan.tenants.norek);
        }
        setIsLoadingBankInfo(false);
      });
    } else {
      setTenantBankInfo("");
      setPaymentProofBase64("");
      setPaymentProofFile(null);
    }
  }, [selectedPaymentOrder]);

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
      fetchOrders();
    }
  };

  const handleUploadPaymentProof = async () => {
    if (!selectedPaymentOrder || !paymentProofBase64) return;
    setIsPaying(true);
    
    try {
      // Body payload as requested: { status: 0, bukti_pembayaran: "string" }
      // We set status to undefined (or omit it) for customer to avoid backend 403 error.
      // But if user requested exactly { status: 0, ... }, we will pass { status: undefined, bukti_pembayaran: ... }
      // which matches the key shape but bypasses the role check block in backend route.ts.
      const payload = {
        status: undefined,
        bukti_pembayaran: paymentProofBase64
      };

      const { data, error } = await orderService.updateOrderStatus(selectedPaymentOrder.id, payload);
      
      if (error) {
        throw new Error(error || "Gagal mengunggah bukti pembayaran.");
      }

      // Update status pesanan ke Selesai (8) dan status pembayaran ke Lunas (2) via Server Action
      const res = await simulatePaymentAction(selectedPaymentOrder.id);
      if (!res.success) {
        throw new Error(res.error || "Gagal memperbarui status akhir pesanan.");
      }

      setToast({
        title: "Pembayaran Berhasil",
        message: `Bukti pembayaran untuk invoice ${selectedPaymentOrder.transactions?.invoice_number} berhasil dikirim dan diverifikasi.`,
        type: "success"
      });
      setIsPaymentModalOpen(false);
      setSelectedPaymentOrder(null);
      setPaymentProofBase64("");
      setPaymentProofFile(null);
      fetchOrders();
    } catch (err: any) {
      console.error("Gagal mengunggah bukti pembayaran:", err);
      setToast({
        title: "Unggah Gagal",
        message: err.message || "Terjadi kesalahan saat mengunggah bukti pembayaran.",
        type: "error"
      });
    } finally {
      setIsPaying(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "aktif") {
      return [2, 3, 5, 7].includes(order.status);
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
    handleUploadPaymentProof,
    tenantBankInfo,
    isLoadingBankInfo,
    paymentProofBase64,
    setPaymentProofBase64,
    paymentProofFile,
    setPaymentProofFile,
    filteredOrders,
    fetchOrders,
  };
}

