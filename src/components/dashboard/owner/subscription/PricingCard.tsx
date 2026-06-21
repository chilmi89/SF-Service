"use client";

import React from "react";
import { Check, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface PricingCardProps {
  plan: {
    id: string | number;
    nama_paket?: string;
    harga: number;
    durasi: number;
    deskripsi?: string;
  };
  isPopular?: boolean;
  onSubscribe: (id: string | number) => void;
  isLoading?: boolean;
}

export const PricingCard: React.FC<PricingCardProps> = ({ 
  plan, 
  isPopular = false, 
  onSubscribe,
  isLoading = false 
}) => {
  const formattedHarga = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(plan.harga);

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className={`relative flex flex-col p-6 bg-white rounded-2xl border ${
        isPopular ? "border-black shadow-xl shadow-black/5" : "border-gray-200 shadow-sm"
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-6 -translate-y-1/2 bg-black text-white px-3 py-1 rounded-full text-[9px] font-bold tracking-widest flex items-center gap-2">
          <Zap size={10} className="fill-current" />
          Populer
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-black mb-1">{plan.nama_paket || "Paket Langganan"}</h3>
        <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
          {plan.deskripsi || "Buka semua fitur manajemen tim dan kelola teknisi tanpa batas."}
        </p>
      </div>

      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-black">{formattedHarga}</span>
        <span className="text-[11px] font-bold text-gray-400">/{plan.durasi} Hari</span>
      </div>

      <div className="flex-1 space-y-3 mb-8">
        {[
          "Manajemen Tim & Karyawan",
          "Penugasan Teknisi Otomatis",
          "Laporan Performa Lengkap",
          "Dukungan Prioritas 24/7",
        ].map((feature, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center ${isPopular ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}>
              <Check size={10} />
            </div>
            <span className="text-[11px] font-bold text-gray-600">{feature}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSubscribe(plan.id)}
        disabled={isLoading}
        className={`w-full h-11 rounded-xl font-b text-sm transition-all ${
          isPopular 
            ? "bg-black text-white hover:bg-zinc-800 shadow-lg shadow-black/10" 
            : "bg-gray-50 text-gray-400 hover:bg-black hover:text-white"
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isLoading ? "Memproses..." : "Pilih Paket"}
      </button>
    </motion.div>
  );
};
