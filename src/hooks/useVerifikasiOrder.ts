import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api/api-client";
import { tenantService } from "@/lib/api/(tenant)/tenant.service";
import { taskService } from "@/lib/api/(tenant)/task.service";
import { ToastType } from "@/components/toast";

export interface Order {
  id: string;
  customer_name: string;
  status_order: "Menunggu Konfirmasi" | "Diterima" | "Ditolak" | "Verifikasi Pembayaran";
  catatan: string;
  created_at: string;
  layanan: {
    nama_layanan: string;
    harga_dasar: number;
  };
  transactions: {
    invoice_number: string;
    total_bayar: number;
    status_pembayaran: string | number;
    "bukti pembayaran"?: string; // Menambahkan support bukti pembayaran
  };
  status?: number;
  tanggal_order: string;
  jam: string;
  id_customer: string;
  hasTask?: boolean;
}

export function useVerifikasiOrder() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: ToastType } | null>(null);

  const showToast = (title: string, message: string, type: ToastType) => {
    setToast({ show: true, title, message, type });
  };

  const mapStatusToOrder = (status: number, order: any): "Menunggu Konfirmasi" | "Diterima" | "Ditolak" | "Verifikasi Pembayaran" => {
    if (status === 6) return "Ditolak";
    
    // Cek apakah ini pembayaran (Verifikasi Pembayaran)
    const hasBukti = order?.transactions && (order.transactions['bukti pembayaran'] || order.transactions.status_pembayaran === 3 || order.transactions.status_pembayaran === 'menunggu_verifikasi');
    if (status === 2 && hasBukti) return "Verifikasi Pembayaran";
    
    // Jika status 2 tapi belum ada task, ini adalah pesanan baru (backend default ke 2)
    if ((status === 1 || status === 2) && !order?.hasTask) return "Menunggu Konfirmasi";
    
    // Jika status 2 tapi SUDAH ada task, berarti ini sedang "Mulai Perbaikan" (Legacy fallback)
    if (status === 2 && order?.hasTask) return "Diterima";
    
    if (status === 5 || status === 7 || status === 8 || status === 3 || status === 4) return "Diterima";
    return "Menunggu Konfirmasi";
  };

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);

      // Resolve tenant ID dari owner yang sedang login
      let myTenantId = localStorage.getItem("my_tenant_id");
      if (!myTenantId) {
        const profileId = localStorage.getItem("profile_id");
        if (profileId) {
          try {
            const profileRes = await apiClient(`/api/profiles/${profileId}`);
            const p = profileRes?.data?.data || profileRes?.data || profileRes;
            if (p && p.kode_tenant) {
              const tenantsRes = await apiClient('/api/tenants');
              const tenants = tenantsRes?.data?.data || tenantsRes?.data || [];
              const myTenant = tenants.find((t: any) => t.kode_tenant === p.kode_tenant);
              if (myTenant) {
                myTenantId = myTenant.id;
                localStorage.setItem("my_tenant_id", myTenant.id);
              }
            }
          } catch (e) {
            console.error("Gagal mendeteksi tenant ID:", e);
          }
        }
      }

      const timestamp = new Date().getTime();
      const res = await apiClient(`/api/orders?as=tenant&t=${timestamp}`);
      if (res.error) {
        throw new Error(res.error);
      }

      // Fetch tasks to check if they exist for each order
      let tasks: any[] = [];
      try {
        const resTasks = await apiClient(`/api/tasks?t=${timestamp}`);
        tasks = resTasks?.data?.data || resTasks?.data || [];
      } catch (err) {
        console.error("Gagal memuat daftar tugas untuk pengecekan:", err);
      }
      
      const rawOrders = res.data?.data || res.data || [];
      const mappedOrders = (Array.isArray(rawOrders) ? rawOrders : []).map((o: any) => {
        const tx = Array.isArray(o.transactions) ? o.transactions[0] : o.transactions;
        const hasTask = tasks.some((t: any) => t.order_id === o.id);
        return {
          ...o,
          transactions: tx || null,
          status_order: mapStatusToOrder(o.status, { ...o, transactions: tx || null, hasTask }),
          hasTask,
        };
      });

      // Filter order hanya yang milik tenant dari owner yang sedang login
      const filteredOrders = mappedOrders.filter((o: any) => {
        if (!myTenantId) return true; // Fallback jika tidak terdeteksi
        const oTenantId = o.layanan?.tenant_id || o.transactions?.tenant_id;
        return oTenantId === myTenantId;
      });

      // Ambil profile customer secara parallel (hanya untuk order yang relevan)
      const customerIds = Array.from(new Set(filteredOrders.map((o: any) => o.id_customer).filter(Boolean))) as string[];
      const profilesMap: Record<string, string> = {};
      
      await Promise.all(
        customerIds.map(async (id) => {
          try {
            const profileRes = await apiClient(`/api/profiles/${id}`);
            const p = profileRes?.data?.data || profileRes?.data || profileRes;
            if (p && p.full_name) {
              profilesMap[id] = p.full_name;
            }
          } catch (err) {
            console.error("Gagal memuat profil untuk customer ID:", id, err);
          }
        })
      );

      const finalOrders = filteredOrders.map((o: any) => ({
        ...o,
        customer_name: profilesMap[o.id_customer] || "Pelanggan",
      }));

      setOrders(finalOrders);
    } catch (err: any) {
      console.error(err);
      showToast("Gagal", err.message || "Gagal memuat data pesanan.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchTechnicians = useCallback(async () => {
    try {
      const response = await tenantService.getStaff();
      const allStaff = response?.data?.data || response?.data || [];
      const techsOnly = allStaff.filter((s: any) => s.role?.toLowerCase() === "teknisi");
      setTechnicians(techsOnly);
    } catch (err) {
      console.error("Gagal mengambil data staf teknisi:", err);
    }
  }, []);

  const acceptOrderWithTask = async (
    orderId: string,
    technicianId?: string,
    deadline?: string,
    namaTugas?: string,
    deskripsi?: string
  ) => {
    setIsSubmitting(true);
    try {
      // 1. Buat tugas baru terlebih dahulu
      const combinedDescription = namaTugas 
        ? `${namaTugas}${deskripsi ? ` - ${deskripsi}` : ""}` 
        : (deskripsi || "Tugas Pekerjaan Servis");

      const payload: any = {
        order_id: orderId,
        deskripsi: combinedDescription,
        status_tugas: 5, // 5 = Menunggu / Disetujui (agar muncul tombol Mulai Tugas terlebih dahulu)
      };
      
      if (technicianId) {
        payload.technician_id = technicianId;
      }
      
      if (deadline) {
        payload.deadline = new Date(deadline).toISOString();
      }

      const resTask = await taskService.createTask(payload);
      if (resTask.error) {
        throw new Error(resTask.error);
      }

      // 2. Update status order ke 5 (Diterima)
      const resOrder = await apiClient(`/api/orders/${orderId}`, {
        method: "PUT",
        body: { status: 5 },
      });

      if (resOrder.error) {
        // Rollback task jika update order gagal
        try {
          const taskId = resTask.data?.data?.id || resTask.data?.id;
          if (taskId) {
            await taskService.deleteTask(taskId);
          }
        } catch (rollbackErr) {
          console.error("Gagal menghapus tugas rollback:", rollbackErr);
        }
        throw new Error(resOrder.error);
      }

      // Update state lokal
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status_order: "Diterima", status: 5, hasTask: true } : o
        )
      );

      showToast("Berhasil", "Pesanan telah diterima dan tugas pengerjaan berhasil dibuat.", "success");
      return true;
    } catch (err: any) {
      console.error(err);
      showToast("Gagal", err.message || "Gagal memproses penerimaan pesanan.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectOrder = async (orderId: string) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient(`/api/orders/${orderId}`, {
        method: "PUT",
        body: { status: 6 },
      });

      if (res.error) {
        throw new Error(res.error);
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status_order: "Ditolak", status: 6 } : o
        )
      );

      showToast("Berhasil", "Pesanan telah berhasil ditolak.", "success");
      return true;
    } catch (err: any) {
      console.error(err);
      showToast("Gagal", err.message || "Gagal memproses penolakan pesanan.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const approvePayment = async (orderId: string) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient(`/api/orders/${orderId}`, {
        method: "PUT",
        body: { status: 8 },
      });

      if (res.error) {
        throw new Error(res.error);
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status_order: "Diterima", status: 8 } : o
        )
      );

      showToast("Berhasil", "Pembayaran disetujui, pesanan selesai.", "success");
      return true;
    } catch (err: any) {
      console.error(err);
      showToast("Gagal", err.message || "Gagal menyetujui pembayaran.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const rejectPayment = async (orderId: string) => {
    setIsSubmitting(true);
    try {
      const res = await apiClient(`/api/orders/${orderId}`, {
        method: "PUT",
        body: { status: 7 }, // Kembali ke Menunggu Pembayaran
      });

      if (res.error) {
        throw new Error(res.error);
      }

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status_order: "Diterima", status: 7 } : o
        )
      );

      showToast("Berhasil", "Pembayaran ditolak. Pelanggan harus mengunggah ulang.", "success");
      return true;
    } catch (err: any) {
      console.error(err);
      showToast("Gagal", err.message || "Gagal menolak pembayaran.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    orders,
    technicians,
    isLoading,
    isSubmitting,
    toast,
    setToast,
    fetchOrders,
    fetchTechnicians,
    acceptOrderWithTask,
    rejectOrder,
    approvePayment,
    rejectPayment,
  };
}
