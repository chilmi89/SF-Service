"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import { 
  Briefcase, 
  Search, 
  Bell, 
  MoreVertical, 
  CheckCircle, 
  Plus,
  Star,
  ChevronDown,
  TrendingUp,
  LogOut
} from "lucide-react";

export default function SuperAdminDashboard() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 md:space-y-12 w-full overflow-hidden">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[
              { label: "Total Pendapatan", value: "Rp 128.4M", trend: "+12.5%", color: "text-emerald-500", icon: <TrendingUp size={20} /> },
              { label: "Permintaan Aktif", value: "842", trend: "+5.2%", color: "text-blue-500", icon: <Briefcase size={20} /> },
              { label: "Tingkat Kepuasan", value: "98.4%", trend: "+1.2%", color: "text-amber-500", icon: <Star size={20} className="fill-current" /> },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-gray-300 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-black/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-11 w-11 rounded-2xl bg-black/[0.03] flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white`}>
                    {stat.icon}
                  </div>
                  <span className={`rounded-lg border px-2.5 py-1 text-[10px] uppercase tracking-tighter font-black ${
                    stat.trend.startsWith('+') 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-red-50 text-red-600 border-red-100'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xs font-medium text-gray-600 mb-1">{stat.label}</p>
                <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* PERFORMANCE CHART SECTION */}
          <section className="rounded-xl border border-gray-300 bg-white p-5 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4 sm:gap-0">
              <div>
                <h2 className="text-xl font-bold mb-1">Performa Layanan</h2>
                <p className="text-xs font-medium text-gray-600">Tren permintaan layanan dalam 30 hari terakhir</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="h-10 px-4 rounded-xl border border-black/[0.05] text-xs font-black flex items-center gap-2 hover:bg-black/[0.03]">
                  Harian <ChevronDown size={14} />
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-black text-white shadow-lg transition-all hover:scale-105 active:scale-95">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Simulated High-End SVG Chart */}
            <div className="relative w-full mt-6 sm:mt-8 aspect-[10/3] min-h-[150px]">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 300">
                {/* Grid Lines */}
                {[0, 1, 2, 3].map((i) => (
                  <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#f0f0f0" strokeWidth="1" />
                ))}
                {/* Area Gradient */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,250 Q100,220 200,240 T400,180 T600,220 T800,140 T1000,160 V300 H0 Z" 
                  fill="url(#chartGradient)"
                />
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  d="M0,250 Q100,220 200,240 T400,180 T600,220 T800,140 T1000,160" 
                  fill="none" 
                  stroke="black" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                {/* Data Points */}
                <circle cx="400" cy="180" r="6" fill="black" stroke="white" strokeWidth="2" />
                <circle cx="800" cy="140" r="6" fill="black" stroke="white" strokeWidth="2" />
              </svg>
              
              {/* Tooltip Overlay (Mockup) */}
              <div 
                className="absolute rounded-xl bg-black p-3 text-white shadow-2xl transform -translate-x-1/2 -translate-y-[120%]"
                style={{ top: '60%', left: '40%' }}
              >
                <p className="text-[10px] font-bold opacity-50">12 Apr</p>
                <p className="text-xs font-black whitespace-nowrap">1.2k Permintaan</p>
              </div>
            </div>
          </section>

          {/* RECENT TRANSACTIONS TABLE */}
          <section className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-300 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Permintaan Layanan Baru</h2>
                <p className="text-xs font-medium text-[#a1a1a1]">Monitor status terkini pesanan dari pelanggan</p>
              </div>
              <button className="h-9 px-4 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-black shadow-sm transition-all hover:bg-black/[0.03] active:scale-95">
                Lihat Semua
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/[0.02] text-[10px] font-medium uppercase tracking-widest text-[#a1a1a1]">
                    <th className="px-8 py-4">ID PESANAN</th>
                    <th className="px-8 py-4">PELANGGAN</th>
                    <th className="px-8 py-4">LAYANAN</th>
                    <th className="px-8 py-4">TANGGAL</th>
                    <th className="px-8 py-4 text-right">JUMLAH</th>
                    <th className="px-8 py-4 text-center">STATUS</th>
                    <th className="px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03]">
                  {[
                    { id: "#FIX-9021", user: "Andi Saputra", service: "Reparasi AC", date: "11 Apr, 09:30", amount: "Rp 450.000", status: "Selesai", sc: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                    { id: "#FIX-9022", user: "Sari Pertiwi", service: "Pipa Bocor", date: "11 Apr, 10:15", amount: "Rp 120.000", status: "Proses", sc: "bg-blue-50 text-blue-600 border-blue-100" },
                    { id: "#FIX-9023", user: "Bambang J.", service: "Pasang Lampu", date: "11 Apr, 11:00", amount: "Rp 85.000", status: "Menunggu", sc: "bg-amber-50 text-amber-600 border-amber-100" },
                    { id: "#FIX-9024", user: "Diana Rose", service: "Cuci AC x2", date: "10 Apr, 16:45", amount: "Rp 200.000", status: "Dibatalkan", sc: "bg-red-50 text-red-600 border-red-100" },
                  ].map((row, i) => (
                    <tr key={i} className="text-xs font-bold transition-all hover:bg-black/[0.01]">
                      <td className="px-8 py-6 text-black/40 text-[10px] font-black">{row.id}</td>
                      <td className="px-8 py-6">{row.user}</td>
                      <td className="px-8 py-6">{row.service}</td>
                      <td className="px-8 py-6 text-black font-bold">{row.date}</td>
                      <td className="px-8 py-6 text-right font-bold">{row.amount}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`rounded-lg border px-2.5 py-1 text-[10px] uppercase tracking-tighter font-bold ${row.sc}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-black/[0.05] transition-colors">
                          <MoreVertical size={14} className="text-[#a1a1a1]" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
    </div>
  );
}