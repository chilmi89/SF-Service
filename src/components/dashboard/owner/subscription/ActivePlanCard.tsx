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
}

export const ActivePlanCard: React.FC<ActivePlanCardProps> = ({ subscription }) => {
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
              <span className="text-[9px] font-black uppercase tracking-widest">Langganan Aktif</span>
            </div>
            <h2 className="text-2xl font-black">{subscription.langganan?.nama_paket || "Paket Premium"}</h2>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <ShieldCheck className="text-blue-400" />, title: "Fitur Terbuka", desc: "Akses penuh manajemen tim" },
            { icon: <CheckCircle2 className="text-emerald-400" />, title: "Tanpa Batas", desc: "Input teknisi sepuasnya" },
            { icon: <Calendar className="text-amber-400" />, title: "Otomatis", desc: "Penugasan cerdas aktif" },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
              {item.icon}
              <h4 className="text-xs font-black">{item.title}</h4>
              <p className="text-[10px] text-white/40 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] font-medium text-white/60">
            Ingin menambah durasi atau upgrade paket?
          </p>
          <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-5 h-11 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-gray-100 transition-all">
            Kelola Langganan
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
