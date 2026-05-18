"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isLoading: boolean;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    nama_paket: "",
    harga: 0,
    durasi: 30,
    deskripsi: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nama_paket: initialData.nama_paket || "",
        harga: initialData.harga || 0,
        durasi: initialData.durasi || 30,
        deskripsi: initialData.deskripsi || "",
      });
    } else {
      setFormData({
        nama_paket: "",
        harga: 0,
        durasi: 30,
        deskripsi: "",
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-sm font-bold text-black">
                {initialData ? "Edit Paket" : "Tambah Paket Baru"}
              </h3>
              <button
                onClick={onClose}
                className="h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-black ml-1">Nama Paket</label>
                  <input
                    type="text"
                    required
                    value={formData.nama_paket}
                    onChange={(e) => setFormData({ ...formData, nama_paket: e.target.value })}
                    placeholder="Contoh: Paket Premium"
                    className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl shadow-sm text-xs font-medium focus:bg-white focus:ring-2 focus:ring-black/5 transition-all outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-black ml-1">Harga (IDR)</label>
                    <input
                      type="number"
                      required
                      value={formData.harga}
                      onChange={(e) => setFormData({ ...formData, harga: parseInt(e.target.value) || 0 })}
                      className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold text-black ml-1">Durasi (Hari)</label>
                    <input
                      type="number"
                      required
                      value={formData.durasi}
                      onChange={(e) => setFormData({ ...formData, durasi: parseInt(e.target.value) || 0 })}
                      className="w-full h-12 px-5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[12px] font-bold text-black ml-1">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    placeholder="Jelaskan keuntungan paket ini..."
                    className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-black/5 transition-all outline-none resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 rounded-xl border border-gray-400 text-xs font-bold uppercase tracking-widest shadow-sm text-gray-400 hover:bg-gray-50 transition-all"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-[2] h-12 rounded-xl bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-black/10"
                >
                  {isLoading && <Loader2 size={16} className="animate-spin" />}
                  {initialData ? "Simpan Perubahan" : "Buat Paket"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
