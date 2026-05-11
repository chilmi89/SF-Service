"use client";

import React from "react";
import { Sparkles, Users, Briefcase, CreditCard } from "lucide-react";

export default function OwnerDashboardPage() {
  return (
    <div className="p-6 md:p-10 space-y-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-black">Dashboard Owner</h1>
        <p className="text-sm font-medium text-gray-500">
          Kelola operasional tenant dan pantau performa teknisi Anda di sini.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Teknisi", value: "0", icon: <Users size={20} />, color: "bg-blue-50 text-blue-500" },
          { label: "Layanan Aktif", value: "0", icon: <Briefcase size={20} />, color: "bg-emerald-50 text-emerald-500" },
          { label: "Pesanan Masuk", value: "0", icon: <Sparkles size={20} />, color: "bg-amber-50 text-amber-500" },
          { label: "Status Langganan", value: "Free", icon: <CreditCard size={20} />, color: "bg-purple-50 text-purple-500" },
        ].map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className={`h-10 w-10 rounded-xl ${stat.color} flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
              <p className="text-2xl font-black text-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}