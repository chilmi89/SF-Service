import { useState, useCallback } from "react";
import { layananTenantService } from "@/lib/api/(tenant)/layanan-tenant.service";
import { ToastType } from "@/components/toast";

export interface Service {
  id: string;
  name: string;
  category: string;
  price: string;
  status: "Aktif" | "Nonaktif";
  image: string;
  description: string;
  rawPrice: number;
  id_kategori?: number;
}

export function useLayananTenant() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: ToastType } | null>(null);

  const fetchLayanan = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await layananTenantService.getLayananTenant();
      
      // Mengatasi struktur response API yang mungkin bersarang (misal: res.data.data)
      let rawData = res?.data;
      if (rawData && !Array.isArray(rawData)) {
        if (Array.isArray(rawData.data)) {
          rawData = rawData.data;
        } else if (Array.isArray(rawData.layanan)) {
          rawData = rawData.layanan;
        } else {
          rawData = [rawData]; // fallback aman
        }
      }
      
      const dataArray = Array.isArray(rawData) ? rawData : [];

      const mapped: Service[] = dataArray.map((item: any) => ({
        id: item.layanan_id || item.id,
        name: item.nama_layanan || "",
        category: item.kategori || "AC",
        price: `Rp ${(item.harga_dasar || 0).toLocaleString('id-ID')}`,
        status: (item.is_active === false ? "Nonaktif" : "Aktif") as "Aktif" | "Nonaktif",
        image: item.gambar || "https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=400",
        description: item.descripsi || "",
        rawPrice: item.harga_dasar || 0,
        id_kategori: item.id_kategori,
      }));
      setServices(mapped);
    } catch (err) {
      console.error("Gagal mengambil data layanan:", err);
      setToast({ show: true, title: "Error", message: "Gagal memuat data layanan.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createLayanan = async (payload: any) => {
    setIsSubmitting(true);
    try {
      await layananTenantService.createLayanan(payload);
      setToast({ show: true, title: "Berhasil", message: "Layanan baru berhasil dibuat.", type: "success" });
      await fetchLayanan();
      return true;
    } catch (err) {
      setToast({ show: true, title: "Error", message: "Gagal menyimpan layanan.", type: "error" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLayanan = async (id: string, payload: any) => {
    setIsSubmitting(true);
    try {
      await layananTenantService.updateLayanan(id, payload);
      setToast({ show: true, title: "Tersimpan", message: "Layanan berhasil diperbarui.", type: "success" });
      await fetchLayanan();
      return true;
    } catch (err) {
      setToast({ show: true, title: "Error", message: "Gagal memperbarui layanan.", type: "error" });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteLayanan = async (id: string) => {
    try {
      await layananTenantService.deleteLayanan(id);
      setToast({ show: true, title: "Layanan Dihapus", message: "Layanan telah dihapus.", type: "info" });
      await fetchLayanan();
    } catch (err) {
      setToast({ show: true, title: "Error", message: "Gagal menghapus layanan.", type: "error" });
    }
  };

  const toggleStatusLayanan = async (id: string) => {
    // Implementasi opsional jika endpoint toggle status ada
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, status: s.status === "Aktif" ? "Nonaktif" : "Aktif" } : s
    ));
    setToast({
      show: true,
      title: "Status Diperbarui",
      message: "Status layanan berhasil diubah lokal.",
      type: "success"
    });
  };

  return {
    services,
    isLoading,
    isSubmitting,
    toast,
    setToast,
    fetchLayanan,
    createLayanan,
    updateLayanan,
    deleteLayanan,
    toggleStatusLayanan
  };
}
