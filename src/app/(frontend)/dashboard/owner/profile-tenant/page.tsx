"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Phone, ShieldCheck, Camera, Mail } from "lucide-react";
import Image from "next/image";
import { authService } from "@/lib/api/auth.service";
import { tenantService } from "@/lib/api/(tenant)/tenant.service";
import { Toast } from "@/components/toast";

export default function ProfileTenantPage() {
  const [tenant, setTenant] = useState<any>(null);
  const [formData, setFormData] = useState({ name: "", address: "", phone: "", slug: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: "success" | "error" | "warning" }>({ show: false, title: "", message: "", type: "success" });

  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
          // Cek apakah ada riwayat ganti nama di penyimpanan lokal browser
          const isNameChangedLocal = localStorage.getItem(`name_changed_${tenantDetail.id}`) === "true";
          
          setTenant({
            ...tenantDetail,
            is_name_changed: tenantDetail.is_name_changed || isNameChangedLocal
          });
          setFormData({
            name: tenantDetail.name || "",
            address: tenantDetail.address || "",
            phone: tenantDetail.phone || "",
            slug: tenantDetail.slug || "",
          });
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
      await tenantService.updateTenant(tenant.id, formData);
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
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col pt-24 sm:pt-28 pb-10 px-4 sm:px-8 max-w-7xl mx-auto w-full items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">Memuat identitas perusahaan...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col pt-8 pb-10 px-6 sm:px-8 w-full">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">Profil Perusahaan</h1>
        <p className="text-sm font-medium text-gray-500 mt-1">Identitas bisnis atau CV yang Anda daftarkan di platform kami.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="flex flex-col gap-10">
          
          {/* Logo Section without card */}
          <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center pb-8 border-b border-black/[0.08]">
            <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden bg-black/5 flex-shrink-0">
              {tenant?.image_url ? (
                <Image 
                  src={tenant.image_url} 
                  alt="Logo Perusahaan" 
                  fill 
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Building2 size={32} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="space-y-2">
               <h3 className="text-lg font-black text-black">Logo Bisnis</h3>
               <p className="text-sm text-gray-500 font-medium max-w-md leading-relaxed">
                 Gambar ini digunakan sebagai logo atau foto profil bisnis Anda. Format yang disarankan adalah persegi (1:1).
               </p>
               <div className="pt-2">
                 <button className="text-xs font-bold bg-black text-white px-5 py-2.5 rounded-lg hover:bg-gray-800 transition-colors">
                   Ubah Foto
                 </button>
               </div>
            </div>
          </div>

          {/* Form-like Data Display */}
          <div className="space-y-6 pb-8 border-b border-black/[0.08]">
            <h3 className="text-lg font-black text-black mb-2">Informasi Dasar</h3>
            
            <div className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-center">
              <label className="text-sm font-bold text-gray-700">Nama Perusahaan</label>
              <div className="w-full">
                <input 
                  type="text" 
                  value={formData.name} 
                  readOnly={tenant?.is_name_changed}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Masukkan nama perusahaan"
                  className={`w-full bg-white border text-black font-semibold rounded-lg px-4 py-3 outline-none transition-colors ${tenant?.is_name_changed ? 'border-transparent bg-black/[0.04] cursor-not-allowed text-gray-500' : 'border-gray-200 focus:border-black focus:ring-1 focus:ring-black'}`}
                />
                {tenant?.is_name_changed ? (
                  <p className="text-xs text-red-500 mt-1.5 ml-1 font-bold">*Batas ubah nama sudah habis. Nama tidak dapat diubah lagi.</p>
                ) : (
                  <p className="text-xs text-amber-600 mt-1.5 ml-1 font-bold">*Perhatian: Nama perusahaan hanya dapat diubah 1 kali.</p>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-center">
              <label className="text-sm font-bold text-gray-700">ID Registrasi</label>
              <div className="w-full">
                <input 
                  readOnly 
                  type="text" 
                  value={tenant?.id || ""} 
                  placeholder="Memuat..."
                  className="w-full bg-black/[0.02] border-none text-gray-500 font-mono text-sm rounded-lg px-4 py-3 outline-none cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1.5 ml-1">*ID bersifat unik dan tidak dapat diubah</p>
              </div>
            </div>
            
            <div className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-start">
              <label className="text-sm font-bold text-gray-700 pt-3">Alamat Operasional</label>
              <div className="w-full">
                <textarea 
                  rows={3}
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="Belum ada alamat operasional."
                  className="w-full bg-white border border-gray-200 text-black font-semibold rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-center">
              <label className="text-sm font-bold text-gray-700">Nomor Telepon</label>
              <div className="w-full">
                <input 
                  type="text" 
                  value={formData.phone} 
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Contoh: 62812..."
                  className="w-full bg-white border border-gray-200 text-black font-semibold rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6 pb-8 border-b border-black/[0.08]">
            <h3 className="text-lg font-black text-black mb-2">Publikasi & Tautan</h3>
            
            <div className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-center">
              <label className="text-sm font-bold text-gray-700">Tautan Bisnis (Slug)</label>
              <div className="w-full flex items-stretch">
                <span className="bg-black/5 text-gray-500 font-semibold px-4 py-3 rounded-l-lg border border-gray-200 border-r-0 shrink-0 text-sm flex items-center">
                  /tenant/
                </span>
                <input 
                  type="text" 
                  value={formData.slug} 
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  placeholder="belum-diatur"
                  className="w-full bg-white border border-gray-200 text-black font-semibold rounded-r-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors text-sm"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-center">
              <label className="text-sm font-bold text-gray-700">Status Verifikasi</label>
              <div className="w-full flex items-center gap-2 text-emerald-600 bg-emerald-50 w-max px-4 py-2 rounded-lg font-bold text-xs border border-emerald-100">
                <ShieldCheck size={16} /> Owner Terverifikasi
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2 pb-6">
             <button 
               onClick={handleCancel}
               disabled={isSaving}
               className="px-6 py-2.5 font-bold text-sm text-gray-500 hover:text-black transition-colors rounded-xl disabled:opacity-50"
             >
               Batal
             </button>
             <button 
               onClick={handleUpdateClick}
               disabled={isSaving}
               className="px-6 py-2.5 flex items-center gap-2 font-bold text-sm bg-black text-white rounded-xl shadow-lg shadow-black/10 hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100"
             >
               {isSaving ? (
                 <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/20 border-t-white"></div>
                  Menyimpan...
                 </>
               ) : (
                 "Simpan Perubahan"
               )}
             </button>
          </div>

        </div>
      </motion.div>
      
      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-amber-500"></div>
            <h3 className="text-xl font-black text-black mb-3">Konfirmasi Ganti Nama</h3>
            <p className="text-sm font-medium text-gray-600 mb-6 leading-relaxed">
              Anda akan mengubah nama perusahaan dari <span className="font-bold text-black px-1.5 py-0.5 bg-gray-100 rounded">"{tenant?.name}"</span> menjadi <span className="font-bold text-black px-1.5 py-0.5 bg-gray-100 rounded">"{formData.name}"</span>. 
              <br/><br/>
              <span className="text-amber-600 font-bold block bg-amber-50 p-3 rounded-xl border border-amber-100 mt-1">
                Perhatian: Anda hanya dapat mengubah nama ini 1 kali!
              </span>
            </p>
            <div className="flex justify-end gap-3 mt-8">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button 
                onClick={executeUpdate}
                className="px-5 py-2.5 text-sm font-bold text-white bg-black hover:bg-gray-800 rounded-xl transition-colors shadow-lg"
              >
                Ya, Ubah Sekarang
              </button>
            </div>
          </motion.div>
        </div>
      )}
      
      <Toast 
        show={toast.show} 
        title={toast.title} 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </div>
  );
}