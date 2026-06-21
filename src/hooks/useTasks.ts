import { useState, useCallback } from "react";
import { taskService } from "@/lib/api/(tenant)/task.service";
import { apiClient } from "@/lib/api/api-client";
import { ToastType } from "@/components/toast";

export interface TaskUI {
  id: string;
  orderId: string;
  customerName: string;
  serviceName: string;
  address: string;
  phone: string;
  status: "Menunggu" | "Perjalanan" | "Proses" | "Selesai" | "Dibatalkan";
  time: string;
  date: string;
  priority: "Tinggi" | "Sedang" | "Normal" | "Rendah";
  technicianName: string;
  rawDeadline?: string;
  deskripsi?: string;
}

export function useTasks() {
  const [tasks, setTasks] = useState<TaskUI[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: ToastType } | null>(null);

  const showToast = (title: string, message: string, type: ToastType) => {
    setToast({ show: true, title, message, type });
  };

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
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

      const userRole = localStorage.getItem("user_role")?.toLowerCase() || "";
      const isOwner = ["owner", "owner tunggal", "owner_tunggal", "admin tenant"].includes(userRole);

      const [res, ordersRes] = await Promise.all([
        taskService.getTasks(),
        apiClient(isOwner ? "/api/orders?as=tenant" : "/api/orders")
      ]);

      const rawData = res?.data?.data || res?.data || [];
      const dataArray = Array.isArray(rawData) ? rawData : [];

      const ordersList = ordersRes?.data?.data || ordersRes?.data || [];
      const ordersMap = new Map<string, any>();
      if (Array.isArray(ordersList)) {
        ordersList.forEach((o: any) => {
          ordersMap.set(o.id, o);
        });
      }
      
      const filteredDataArray = dataArray.filter((t: any) => {
        if (!isOwner || !myTenantId) return true; // Customer/Teknisi/Jika belum ter-load, skip filter
        return t.orders?.layanan?.tenant_id === myTenantId;
      });

      // Ambil profile customer secara parallel untuk mendapatkan nomor HP & alamat (hanya untuk task yang disaring)
      const customerIds = Array.from(
        new Set(filteredDataArray.map((t: any) => t.orders?.id_customer).filter(Boolean))
      ) as string[];

      const customerProfiles: Record<string, { phone: string; address: string; fullName: string }> = {};

      await Promise.all(
        customerIds.map(async (id) => {
          try {
            const profileRes = await apiClient(`/api/profiles/${id}`);
            const p = profileRes?.data?.data || profileRes?.data || profileRes;
            if (p) {
              customerProfiles[id] = {
                fullName: p.full_name || p.fullName || "-",
                phone: p.phone || "-",
                address: p.address || "-",
              };
            }
          } catch (err) {
            console.error(`Gagal memuat profil untuk customer ID: ${id}`, err);
          }
        })
      );

      const mapped: TaskUI[] = filteredDataArray.map((item: any) => {
        const customerId = item.orders?.id_customer;
        const customerInfo = customerProfiles[customerId] || { phone: "-", address: "-", fullName: "-" };
        
        // Mapping status_tugas dari DB ke UI (Dukungan integer bigint)
        let mappedStatus: "Menunggu" | "Perjalanan" | "Proses" | "Selesai" | "Dibatalkan" = "Menunggu";
        const dbStatus = String(item.status_tugas || "").toLowerCase();
        if (dbStatus === "perjalanan" || dbStatus === "dalam perjalanan" || dbStatus === "3") {
          mappedStatus = "Perjalanan";
        } else if (dbStatus === "proses" || dbStatus === "dikerjakan" || dbStatus === "2") {
          mappedStatus = "Proses";
        } else if (dbStatus === "selesai" || dbStatus === "4") {
          mappedStatus = "Selesai";
        } else if (dbStatus === "dibatalkan" || dbStatus === "6") {
          mappedStatus = "Dibatalkan";
        } else {
          mappedStatus = "Menunggu";
        }

        // Format waktu & tanggal deadline
        let timeStr = "12:00 WIB";
        let dateStr = "Hari Ini";
        if (item.deadline) {
          try {
            const deadlineDate = new Date(item.deadline);
            timeStr = deadlineDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
            dateStr = deadlineDate.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
          } catch (e) {
            console.error("Format tanggal salah:", item.deadline);
          }
        }

        // Penentuan prioritas (Contoh sederhana: random/berdasarkan tipe layanan jika ada)
        const priorities: Array<"Tinggi" | "Sedang" | "Normal" | "Rendah"> = ["Tinggi", "Sedang", "Normal", "Rendah"];
        const hash = item.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
        const priority = priorities[hash % priorities.length];

        const orderData = ordersMap.get(item.order_id);
        const actualServiceName = orderData?.layanan?.nama_layanan || "Layanan Servis";

        let displayTitle = actualServiceName;
        let displayDesc = item.deskripsi || "";

        if (item.deskripsi) {
          const parts = item.deskripsi.split(/ - | – /);
          if (parts.length > 1) {
            displayTitle = parts[0];
            displayDesc = parts.slice(1).join(" - ");
          }
        }

        return {
          id: item.id,
          orderId: item.order_id,
          customerName: customerInfo.fullName !== "-" ? customerInfo.fullName : (item.orders?.customer?.full_name || "Pelanggan"),
          serviceName: displayTitle,
          address: customerInfo.address,
          phone: customerInfo.phone !== "-" ? customerInfo.phone : (item.orders?.customer?.phone || "-"),
          status: mappedStatus,
          time: timeStr,
          date: dateStr,
          priority,
          technicianName: item.technician?.full_name || "Belum Ditugaskan",
          rawDeadline: item.deadline,
          deskripsi: displayDesc || item.deskripsi,
        };
      });

      setTasks(mapped);
    } catch (err: any) {
      console.error("Gagal mengambil data tugas:", err);
      showToast("Gagal", err.message || "Gagal memuat daftar tugas.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTaskStatus = async (id: string, statusUI: "Menunggu" | "Perjalanan" | "Proses" | "Selesai" | "Dibatalkan") => {
    setIsSubmitting(true);
    // Petakan status UI kembali ke DB (Menggunakan tipe integer/bigint)
    let dbStatus = 5; // Default Menunggu = Disetujui (5)
    if (statusUI === "Perjalanan") {
      dbStatus = 3;
    } else if (statusUI === "Proses") {
      dbStatus = 2;
    } else if (statusUI === "Selesai") {
      dbStatus = 4;
    } else if (statusUI === "Dibatalkan") {
      dbStatus = 6;
    }

    try {
      const res = await taskService.updateTaskStatus(id, String(dbStatus));
      if (res.error) {
        throw new Error(res.error);
      }

      // Sinkronkan status tugas dengan status pesanan (Order)
      // Hal ini memastikan baik dashboard owner maupun user memiliki status perjalanan yang sama
      const task = tasks.find((t) => t.id === id);
      if (task && task.orderId) {
        try {
          // Selesai = 7 (Menunggu Pembayaran)
          // Proses Perbaikan = 2 (Dikombinasikan dengan hasTask di frontend untuk menampilkan 'Proses')
          let orderSyncStatus = dbStatus;
          if (dbStatus === 4) orderSyncStatus = 7;
          if (dbStatus === 2) orderSyncStatus = 2;
          
          await apiClient(`/api/orders/${task.orderId}`, {
            method: 'PUT',
            body: { status: orderSyncStatus },
          });
        } catch (syncErr) {
          console.error("Gagal melakukan sinkronisasi status ke pesanan:", syncErr);
        }
      }
      
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: statusUI } : t))
      );
      showToast("Berhasil", `Status tugas berhasil diubah menjadi ${statusUI}.`, "success");
      return true;
    } catch (err: any) {
      console.error("Gagal mengupdate status tugas:", err);
      showToast("Gagal", err.message || "Gagal memperbarui status tugas.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const createTask = async (payload: {
    order_id: string;
    technician_id?: string;
    deskripsi: string;
    deadline?: string;
  }) => {
    setIsSubmitting(true);
    try {
      const res = await taskService.createTask(payload);
      if (res.error) {
        throw new Error(res.error);
      }
      showToast("Berhasil", "Penugasan tugas berhasil dibuat.", "success");
      await fetchTasks();
      return true;
    } catch (err: any) {
      console.error("Gagal membuat tugas:", err);
      showToast("Gagal", err.message || "Gagal membuat tugas baru.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteTask = async (id: string) => {
    setIsSubmitting(true);
    try {
      const res = await taskService.deleteTask(id);
      if (res.error) {
        throw new Error(res.error);
      }
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast("Tugas Dihapus", "Tugas berhasil dihapus secara permanen.", "success");
      return true;
    } catch (err: any) {
      console.error("Gagal menghapus tugas:", err);
      showToast("Gagal", err.message || "Gagal menghapus tugas.", "error");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    tasks,
    isLoading,
    isSubmitting,
    toast,
    setToast,
    fetchTasks,
    updateTaskStatus,
    createTask,
    deleteTask,
  };
}
