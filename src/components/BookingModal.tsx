"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, AlignLeft, Shield, CheckCircle2, Loader2 } from "lucide-react";

export interface ServiceData {
  id: string;
  title: string;
  category: string;
  img: string;
  tech: string;
  avatar: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  service: ServiceData | null;
}

export default function BookingModal({ isOpen, onClose, service }: BookingModalProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Mencegah scroll pada body saat modal terbuka
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Reset state ketika modal dibuka kembali
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setDate("");
      setTime("");
      setAddress("");
      setNotes("");
    }
  }, [isOpen]);

  if (!service) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulasi proses API
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Tutup otomatis setelah sukses
      setTimeout(() => {
        onClose();
      }, 2500);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl flex flex-col"
          >
            {/* Header / Banner */}
            <div className="relative h-48 w-full shrink-0">
              <Image 
                src={service.img} 
                alt={service.title} 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
                <div>
                  <span className="inline-block rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white border border-white/20 mb-2">
                    {service.category}
                  </span>
                  <h2 className="text-2xl font-bold text-white">{service.title}</h2>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-white">{service.tech}</p>
                    <p className="text-[10px] text-white/70 flex items-center gap-1 justify-end">
                      <Shield size={10} /> Verified
                    </p>
                  </div>
                  <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white/20 bg-gray-100">
                    <Image src={service.avatar} alt={service.tech} width={40} height={40} className="object-cover h-full w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 p-10 flex flex-col items-center justify-center text-center h-[400px]"
              >
                <div className="h-20 w-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="text-2xl font-black text-black mb-2">Pesanan Berhasil!</h3>
                <p className="text-gray-500 text-sm max-w-sm">
                  Teknisi kami telah menerima pesanan Anda dan akan segera menghubungi nomor Anda untuk konfirmasi lebih lanjut.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex-1 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-black border-b border-gray-100 pb-2">Detail Pemesanan</h3>
                  
                  {/* Date & Time Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                        <Calendar size={14} /> Tanggal Servis
                      </label>
                      <input 
                        type="date" 
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-black focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                        <Clock size={14} /> Jam Servis
                      </label>
                      <input 
                        type="time" 
                        required
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-black focus:bg-white focus:outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <MapPin size={14} /> Alamat Lengkap
                    </label>
                    <textarea 
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Contoh: Jl. Sudirman No. 123, RT 01/RW 02 (Patokan: Depan Masjid)"
                      rows={3}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-black focus:bg-white focus:outline-none transition-all"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5">
                      <AlignLeft size={14} /> Keluhan / Catatan (Opsional)
                    </label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Jelaskan detail masalah atau merk barang yang akan diservis..."
                      rows={2}
                      className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:border-black focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-4">
                  <div className="hidden sm:block">
                    <p className="text-xs text-gray-400">Pastikan data yang Anda isi sudah benar.</p>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-black px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-black/90 active:scale-95 disabled:bg-gray-400 shadow-xl shadow-black/10"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        MEMPROSES...
                      </>
                    ) : (
                      "KONFIRMASI PESANAN"
                    )}
                  </button>
                </div>
              </form>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
