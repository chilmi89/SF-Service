"use client";

import { motion } from "framer-motion";
import { Building2, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Toast } from "@/components/toast";
import { useTenantProfile } from "@/hooks/useTenantProfile";

export default function ProfileTenantPage() {
  const {
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
  } = useTenantProfile();

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
        <h1 className="text-2xl font-bold text-bold">Profil Perusahaan</h1>
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
               <h3 className="text-lg font-bold text-black">Logo Bisnis</h3>
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
            <h3 className="text-md font-bold text-black mb-2">Informasi Dasar</h3>
            
            <div className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-center">
              <label className="text-sm font-medium text-gray-700">Nama Perusahaan</label>
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
              <label className="text-sm font-medium text-gray-700">ID Registrasi</label>
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
              <label className="text-sm font-medium text-gray-700 pt-3">Alamat Operasional</label>
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
              <label className="text-sm font-medium text-gray-700">Nomor Telepon</label>
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
            <h3 className="text-lg font-bold text-black mb-2">Publikasi & Tautan</h3>
            
            <div className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-center">
              <label className="text-sm font-medium text-gray-700">Tautan Bisnis (Slug)</label>
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
              <label className="text-sm font-medium text-gray-700">Status Verifikasi</label>
              <div className="w-full flex items-center gap-2 text-emerald-600 bg-emerald-50 w-max px-4 py-2 rounded-lg font-bold text-xs border border-emerald-100">
                <ShieldCheck size={16} /> Owner Terverifikasi
              </div>
            </div>
          </div>

          {/* Bank Accounts Section */}
          <div className="space-y-6 pb-8 border-b border-black/[0.08]">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="text-lg font-bold text-black">Rekening Pembayaran</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">
                  Tambahkan hingga maksimal 3 rekening bank untuk menerima pembayaran dari pelanggan.
                </p>
              </div>
              {bankAccounts.length < 3 && (
                <button
                  type="button"
                  onClick={() => setBankAccounts([...bankAccounts, { bank: "", number: "" }])}
                  className="text-xs font-bold bg-black text-white px-4 py-2.5 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  + Tambah Rekening
                </button>
              )}
            </div>

            {bankAccounts.map((account, index) => (
              <div key={index} className="grid sm:grid-cols-[200px_1fr] gap-2 sm:gap-6 items-start">
                <label className="text-sm font-medium text-gray-700 pt-3">Rekening #{index + 1}</label>
                <div className="w-full flex flex-col sm:flex-row gap-3 items-stretch">
                  <select
                    value={account.bank}
                    onChange={(e) => {
                      const newAccs = [...bankAccounts];
                      newAccs[index].bank = e.target.value;
                      setBankAccounts(newAccs);
                    }}
                    className="w-full sm:w-1/3 bg-white border border-gray-200 text-black font-semibold rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  >
                    <option value="">-- Pilih Bank --</option>
                    {BANK_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={account.number}
                    onChange={(e) => {
                      const newAccs = [...bankAccounts];
                      newAccs[index].number = e.target.value.replace(/[^0-9]/g, ""); // Hanya angka
                      setBankAccounts(newAccs);
                    }}
                    placeholder="Nomor Rekening / Nomor Telepon E-Wallet"
                    className="w-full sm:flex-1 bg-white border border-gray-200 text-black font-semibold rounded-lg px-4 py-3 outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                  />
                  {bankAccounts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newAccs = bankAccounts.filter((_, idx) => idx !== index);
                        setBankAccounts(newAccs);
                      }}
                      className="text-red-600 hover:text-red-800 font-bold text-sm px-4 flex items-center justify-center border border-red-100 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
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