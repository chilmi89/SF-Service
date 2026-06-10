import { useEffect, useState } from "react";
import { authService } from "@/lib/api/auth.service";
import { tenantService } from "@/lib/api/(tenant)/tenant.service";

export const BANK_OPTIONS = [
  "BCA",
  "Mandiri",
  "BNI",
  "BRI",
  "CIMB Niaga",
  "BSI",
  "Permata",
  "Danamon",
  "Gopay",
  "OVO",
  "DANA",
  "LinkAja",
  "ShopeePay"
];

export const useTenantProfile = () => {
  const [tenant, setTenant] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "", slug: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({ show: false, title: "", message: "", type: "success" });

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [bankAccounts, setBankAccounts] = useState<{ bank: string; number: string }[]>([
    { bank: "", number: "" }
  ]);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        setIsLoading(true);
        const profileId = localStorage.getItem("profile_id");
        
        if (!profileId) {
          throw new Error("Sesi pengguna tidak valid.");
        }

        const profileResponse = await authService.getProfile(profileId);
        const userProfile = profileResponse?.data?.data || profileResponse?.data;

        if (!userProfile?.tenant_name) {
          throw new Error("Anda belum memiliki perusahaan/tenant yang terdaftar.");
        }

        const allTenantsResponse = await tenantService.getAllTenants();
        const allTenants = allTenantsResponse?.data?.data || allTenantsResponse?.data || [];
        
        const myTenantMatch = allTenants.find((t: any) => t.name === userProfile.tenant_name);

        if (!myTenantMatch?.id) {
          throw new Error("Data perusahaan Anda tidak ditemukan di sistem.");
        }

        const detailResponse = await tenantService.getTenantDetails(myTenantMatch.id);
        const tenantDetail = detailResponse?.data?.data || detailResponse?.data;
        
        if (tenantDetail) {
          const isNameChangedLocal = localStorage.getItem(`name_changed_${tenantDetail.id}`) === "true";
          
          setTenant({
            ...tenantDetail,
            is_name_changed: tenantDetail.is_name_changed || isNameChangedLocal
          });
          const rawNorek = tenantDetail.norek || "";
          const parsedAccounts = rawNorek
            .split(";")
            .filter(Boolean)
            .map((item: string) => {
              const [bank, number] = item.split(",");
              return { bank: bank?.trim() || "", number: number?.trim() || "" };
            });

          setFormData({
            name: tenantDetail.name || "",
            address: tenantDetail.address || "",
            phone: tenantDetail.phone || "",
            slug: tenantDetail.slug || "",
          });
          setBankAccounts(parsedAccounts.length > 0 ? parsedAccounts : [{ bank: "", number: "" }]);
        } else {
          throw new Error("Gagal memuat detail perusahaan.");
        }
        
      } catch (error: any) {
        console.error("Gagal mengambil profil tenant:", error);
        setToast({ show: true, title: "Peringatan", message: error.message || "Terjadi kesalahan saat memuat data.", type: "warning" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTenantData();
  }, []);

  const executeUpdate = async () => {
    try {
      setIsSaving(true);
      setShowConfirmModal(false);

      // Gabungkan bank name & account number dengan "," lalu gabungkan antar bank dengan ";"
      const norekString = bankAccounts
        .filter((acc) => acc.bank.trim() || acc.number.trim())
        .map((acc) => `${acc.bank.trim()},${acc.number.trim()}`)
        .join(";");

      const payload = {
        ...formData,
        norek: norekString,
      };

      await tenantService.updateTenant(tenant.id, payload);
      setToast({ show: true, title: "Berhasil", message: "Profil perusahaan berhasil diperbarui!", type: "success" });
      
      const isChangingName = formData.name !== tenant.name;
      
      // Simpan riwayat ganti nama ke local storage agar tidak hilang saat direfresh
      if (isChangingName) {
        localStorage.setItem(`name_changed_${tenant.id}`, "true");
      }

      // Jika nama berubah, kita anggap jatahnya habis (optimistic lock)
      setTenant({ 
        ...tenant, 
        ...formData, 
        norek: norekString,
        is_name_changed: isChangingName ? true : tenant.is_name_changed 
      });
    } catch (error: any) {
      console.error("Gagal memperbarui tenant:", error);
      setToast({ show: true, title: "Gagal", message: error.message || "Terjadi kesalahan saat menyimpan perubahan.", type: "error" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateClick = () => {
    if (!tenant?.id) return;
    
    const isChangingName = formData.name !== tenant.name;

    // Peringatan jika pengguna mencoba mengubah nama
    if (isChangingName) {
      if (tenant?.is_name_changed) {
        setToast({ show: true, title: "Ditolak", message: "Kesempatan ubah nama perusahaan sudah habis.", type: "error" });
        return;
      }
      
      // Tampilkan Custom Modal Dialog Box
      setShowConfirmModal(true);
      return;
    }

    // Jika tidak ubah nama, langsung simpan
    executeUpdate();
  };

  const handleCancel = () => {
    if (tenant) {
      setFormData({
        name: tenant.name || "",
        address: tenant.address || "",
        phone: tenant.phone || "",
        slug: tenant.slug || "",
      });
      const rawNorek = tenant.norek || "";
      const parsedAccounts = rawNorek
        .split(";")
        .filter(Boolean)
        .map((item: string) => {
          const [bank, number] = item.split(",");
          return { bank: bank?.trim() || "", number: number?.trim() || "" };
        });
      setBankAccounts(parsedAccounts.length > 0 ? parsedAccounts : [{ bank: "", number: "" }]);
    }
  };

  return {
    tenant,
    formData,
    setFormData,
    isLoading,
    isSaving,
    toast,
    setToast,
    showConfirmModal,
    setShowConfirmModal,
    bankAccounts,
    setBankAccounts,
    BANK_OPTIONS,
    handleUpdateClick,
    handleCancel,
    executeUpdate
  };
};
