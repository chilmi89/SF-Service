"use client";

import React from "react";
import { CheckCircle2, Calendar, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface ActivePlanCardProps {
  subscription: {
    id: string | number;
    id_langganan: string | number;
    created_at: string;
    langganan?: {
      nama_paket?: string;
      durasi: number;
    }
  };
  onCancel?: () => void;
  isCancelling?: boolean;
}

export const ActivePlanCard: React.FC<ActivePlanCardProps> = ({ 
  subscription, 
  onCancel, 
  isCancelling = false 
}) => {
  const startDate = new Date(subscription.created_at);
  const durasi = subscription.langganan?.durasi || 30;
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + durasi);

  const formattedEndDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(endDate);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-black rounded-2xl p-6 text-white relative overflow-hidden"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 size={14} />
              <span className="text-[9px] font-bold uppercase tracking-widest">Langganan Aktif</span>
            </div>
            <h2 className="text-2xl font-bold">{subscription.langganan?.nama_paket || "Paket Premium"}</h2>
          </div>
          
          <div className="px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Calendar size={16} className="text-white" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-white/50 uppercase">Berakhir Pada</p>
              <p className="text-xs font-black">{formattedEndDate}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          {[
            { icon: <ShieldCheck className="text-blue-400 shrink-0" size={18} />, title: "Fitur Terbuka", desc: "Akses penuh manajemen tim" },
            { icon: <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />, title: "Tanpa Batas", desc: "Input teknisi sepuasnya" },
            { icon: <Calendar className="text-amber-400 shrink-0" size={18} />, title: "Otomatis", desc: "Penugasan cerdas aktif" },
          ].map((item, i) => (
            <div key={i} className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/5 border border-white/5 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-bold sm:font-black text-white">{item.title}</h4>
                <p className="text-[10px] text-white/50 font-medium mt-0.5 sm:mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-medium text-white/60">
            Ingin menambah durasi atau upgrade paket?
          </p>
          <div className="flex flex-row w-full sm:w-auto gap-2 sm:gap-3">
            {onCancel && (
              <button 
                onClick={onCancel}
                disabled={isCancelling}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-5 h-11 rounded-lg font-bold text-[9px] sm:text-[10px] uppercase transition-all disabled:opacity-50"
              >
                {isCancelling ? "Membatalkan..." : "Batalkan Langganan"}
              </button>
            )}
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white text-black px-3 sm:px-5 h-11 rounded-lg font-bold text-[9px] sm:text-[10px] uppercase hover:bg-gray-100 transition-all">
              Kelola Langganan
              <ArrowRight size={14} className="shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
