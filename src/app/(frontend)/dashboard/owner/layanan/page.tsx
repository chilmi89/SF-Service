"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Briefcase,
  DollarSign,
  Tag,
  Loader2,
  Image as ImageIcon,
  X,
  Star
} from "lucide-react";
import Image from "next/image";
import { Toast, ToastType } from "@/components/toast";
import { useLayananTenant, Service } from "@/hooks/useLayananTenant";
import { layananService } from "@/lib/api/layanan.service";

export default function LayananOwnerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [categories, setCategories] = useState<{ id: number; nama: string }[]>([]);

  const {
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
  } = useLayananTenant();

  useEffect(() => {
    fetchLayanan();
  }, [fetchLayanan]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await layananService.getAllKategori();
        const rawData = res?.data || res;
        const dataArray = Array.isArray(rawData) ? rawData : (Array.isArray(rawData.data) ? rawData.data : []);
        setCategories(dataArray);
      } catch (err) {
        console.error("Gagal mengambil data kategori:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleToggleStatus = (id: string) => toggleStatusLayanan(id);

  const handleDelete = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus layanan ini?")) {
      deleteLayanan(id);
    }
  };

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-0.5"
        >
          <h1 className="text-3xl font-black tracking-tight text-black">Layanan Saya</h1>
          <p className="text-[13px] font-small text-gray-500">Kelola semua jenis layanan perbaikan yang Anda tawarkan kepada pelanggan.</p>
        </motion.div>
      </section>

      {/* STATS SUMMARY */}
      <div className="max-w-5xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[
            { label: "Total Layanan", value: services.length, icon: <Briefcase size={16} />, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Layanan Aktif", value: services.filter(s => s.status === "Aktif").length, icon: <CheckCircle2 size={16} />, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Layanan Nonaktif", value: services.filter(s => s.status === "Nonaktif").length, icon: <XCircle size={16} />, color: "text-gray-400", bg: "bg-gray-50" },
            { label: "Rating Layanan", value: "4.9", icon: <Star size={16} />, color: "text-amber-500", bg: "bg-amber-50" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-3 sm:p-4 rounded-2xl bg-white border border-gray-100 shadow-sm flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
            >
              <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-xl ${stat.bg} ${stat.color} flex shrink-0 items-center justify-center`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-[8px] sm:text-[9px] font-medium uppercase text-gray-400 truncate">{stat.label}</p>
                <h3 className="text-lg sm:text-xl font-black text-black leading-none mt-1 sm:mt-0">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <section className="flex flex-row justify-between items-center gap-2 sm:gap-4 w-full">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
          <input 
            type="text" 
            placeholder="Cari layanan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-9 sm:pl-11 pr-3 sm:pr-4 bg-white border border-gray-100 rounded-xl text-xs font-medium focus:ring-4 focus:ring-black/5 focus:border-black outline-none transition-all shadow-sm"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-row items-center gap-2 sm:gap-3 flex-none">
          <button className="h-11 px-3 sm:px-5 rounded-xl border border-gray-100 bg-white text-gray-400 hover:text-black hover:border-black transition-all flex items-center justify-center gap-2 font-bold text-[11px] shadow-sm">
            <Filter size={16} />
            <span className="hidden sm:inline">Filter Kategori</span>
          </button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingService(null);
              setImagePreview("");
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 bg-black text-white h-11 px-3 sm:px-6 rounded-xl font-black text-xs shadow-lg shadow-black/10 transition-all hover:bg-zinc-800"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah Layanan Baru</span>
          </motion.button>
        </div>
      </section>

      {/* SERVICE LIST */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-gray-400 gap-4">
              <Loader2 size={40} className="animate-spin text-black" />
              <p className="text-sm font-bold">Memuat daftar layanan...</p>
            </div>
          ) : filteredServices.length > 0 ? (
            filteredServices.map((service, i) => (
                <motion.div
                  key={service.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden hover:shadow-md transition-all flex flex-col"
                >
                {/* Image */}
                <div className="relative h-24 sm:h-32 overflow-hidden bg-gray-100 shrink-0">
                  <Image 
                    src={service.image} 
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-wider shadow-sm ${
                      service.status === 'Aktif' 
                      ? 'bg-emerald-500 text-white' 
                      : 'bg-gray-500 text-white'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-5 flex-1 flex flex-col">
                  <div className="space-y-2 sm:space-y-3 flex-1">
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <h3 className="text-[11px] sm:text-sm font-bold text-black leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{service.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                        <p className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase truncate">
                          ID: {service.id.length > 8 ? service.id.slice(0, 8) : service.id}
                        </p>
                        <p className="text-[11px] sm:text-sm font-black text-black shrink-0">{service.price}</p>
                      </div>
                    </div>

                    <p className="text-[9px] sm:text-[11px] font-medium text-gray-500 line-clamp-2 leading-relaxed hidden sm:block">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-3 sm:pt-4 flex flex-col xl:flex-row xl:items-center gap-2">
                     <div className="flex gap-2 w-full xl:w-auto">
                        <button 
                          onClick={() => {
                            setEditingService(service);
                            setImagePreview("");
                            setIsModalOpen(true);
                          }}
                          className="flex-1 xl:flex-none h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-black hover:bg-gray-50 transition-all"
                        >
                          <Edit3 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="flex-1 xl:flex-none h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl border border-gray-100 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={14} className="sm:w-4 sm:h-4" />
                        </button>
                     </div>
                     <button 
                       onClick={() => handleToggleStatus(service.id)}
                       className={`w-full xl:flex-1 h-8 sm:h-9 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transition-all ${
                         service.status === 'Aktif' 
                         ? 'border border-gray-100 text-gray-400 hover:bg-gray-50' 
                         : 'bg-black text-white shadow-lg shadow-black/10'
                       }`}
                     >
                       {service.status === 'Aktif' ? 'Matikan' : 'Aktifkan'}
                     </button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto text-gray-300">
                <Search size={32} />
              </div>
              <div>
                <h3 className="text-lg font-black text-black">Layanan tidak ditemukan</h3>
                <p className="text-sm font-medium text-gray-500">Coba kata kunci lain atau tambah layanan baru.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL - TAMBAH/EDIT LAYANAN */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 md:p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h2 className="text-xl font-bold text-black">
                      {editingService ? "Edit Layanan" : "Layanan Baru"}
                    </h2>
                    <p className="text-[11px] font-medium text-gray-500">
                      Lengkapi data layanan untuk ditampilkan kepada pelanggan.
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                <form className="space-y-4" onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  const payload = {
                    nama_layanan: formData.get("nama_layanan") as string,
                    harga_dasar: Number(formData.get("harga_dasar")),
                    id_kategori: Number(formData.get("id_kategori")),
                    gambar: imagePreview || editingService?.image || "https://images.unsplash.com/photo-1581094288338-2314dddb7ec3?auto=format&fit=crop&q=80&w=400",
                    descripsi: formData.get("descripsi") as string,
                  };

                  let success = false;
                  if (editingService) {
                    success = await updateLayanan(editingService.id, payload);
                  } else {
                    success = await createLayanan(payload);
                  }
                  
                  if (success) {
                    setIsModalOpen(false);
                  }
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Nama Layanan</label>
                      <div className="relative group">
                        <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={14} />
                        <input name="nama_layanan" required defaultValue={editingService?.name} type="text" placeholder="Nama layanan..." className="w-full h-11 bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 text-xs font-bold outline-none focus:bg-white focus:border-black transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Kategori</label>
                      <select name="id_kategori" required defaultValue={editingService?.id_kategori} className="w-full h-11 bg-gray-50 border border-gray-300 rounded-xl px-4 text-xs font-bold outline-none focus:bg-white focus:border-black transition-all appearance-none">
                        <option value="">Pilih Kategori</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.nama}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Harga Dasar</label>
                      <div className="relative group">
                        <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={14} />
                        <input name="harga_dasar" required defaultValue={editingService?.rawPrice || ""} type="number" placeholder="Harga..." className="w-full h-11 bg-gray-50 border border-gray-300 rounded-xl pl-10 pr-4 text-xs font-bold outline-none focus:bg-white focus:border-black transition-all" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Foto Layanan</label>
                      <div className="relative">
                        <input 
                          type="file" 
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <div className={`w-full h-11 bg-gray-50 border ${imagePreview ? 'border-emerald-500 text-emerald-600' : 'border-dashed border-gray-300 text-gray-400 hover:border-black hover:text-black'} rounded-xl flex items-center justify-center gap-2 text-[10px] font-bold uppercase transition-all overflow-hidden relative`}>
                          {imagePreview ? (
                            <>
                              <CheckCircle2 size={14} />
                              Foto Dipilih
                            </>
                          ) : (
                            <>
                              <ImageIcon size={14} />
                              Pilih Gambar
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase text-gray-400 ml-1">Deskripsi Layanan</label>
                    <textarea name="descripsi" required defaultValue={editingService?.description} rows={3} placeholder="Deskripsi layanan..." className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-xs font-bold outline-none focus:bg-white focus:border-black transition-all resize-none" />
                  </div>

                  <div className="pt-4 flex gap-3">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 h-11 rounded-xl border border-gray-300 text-[10px] font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 transition-all">
                      Batal
                    </button>
                    <button disabled={isSubmitting} type="submit" className="flex-[2] h-11 rounded-xl bg-black text-white text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-black/10 hover:bg-zinc-800 transition-all flex justify-center items-center gap-2 disabled:bg-gray-400">
                      {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                      {editingService ? "Simpan Perubahan" : "Simpan Layanan"}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <Toast
          show={toast.show}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}