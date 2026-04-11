"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut, 
  Search, 
  Bell, 
  Calendar, 
  MoreVertical, 
  ArrowUpRight, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  User,
  ChevronDown,
  Plus,
  Star
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    router.push("/home");
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-black selection:bg-black selection:text-white">
      
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-black/[0.05] bg-white lg:flex lg:flex-col">
        {/* Branding */}
        <div className="flex h-24 items-center px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white font-black text-lg">
              F
            </div>
            <span className="text-xl font-black tracking-tight">FixIt Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-4 py-8">
          {[
            { name: "Dashboard", icon: <LayoutDashboard size={20} /> },
            { name: "Layanan", icon: <Briefcase size={20} /> },
            { name: "Pengguna", icon: <Users size={20} /> },
            { name: "Transaksi", icon: <CreditCard size={20} /> },
            { name: "Laporan", icon: <FileText size={20} /> },
            { name: "Pengaturan", icon: <Settings size={20} /> },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${
                activeTab === item.name 
                ? "bg-black text-white shadow-xl shadow-black/10" 
                : "text-[#666] hover:bg-black/[0.03] hover:text-black"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-black/[0.05]">
          <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] p-4 transition-all hover:bg-black/[0.06] cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border border-black/10 bg-white overflow-hidden">
                <Image src="/images/budi.png" alt="Admin" width={40} height={40} className="object-cover" />
              </div>
              <div>
                <p className="text-xs font-black">Rizky Admin</p>
                <p className="text-[10px] font-bold text-[#666]">Super Admin</p>
              </div>
            </div>
            <LogOut 
              size={16} 
              className="text-[#a1a1a1] hover:text-black transition-colors cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-72 lg:mr-80">
        
        {/* TOP HEADER */}
        <header className="flex h-24 items-center justify-between px-8 md:px-12 bg-white/80 backdrop-blur-md border-b border-black/[0.05] sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black">{activeTab}</h1>
            <span className="h-1 w-1 rounded-full bg-black/20" />
            <p className="text-sm font-bold text-[#666]">Sabtu, 11 April 2026</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
              <input 
                type="text" 
                placeholder="Cari data..." 
                className="h-12 w-64 rounded-2xl border border-black/[0.05] bg-black/[0.03] pl-11 pr-4 text-xs font-bold transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <button className="relative h-12 w-12 rounded-2xl border border-black/[0.05] bg-white shadow-sm flex items-center justify-center transition-all hover:bg-black/[0.03] active:scale-95">
              <Bell size={20} className="text-[#666]" />
              <span className="absolute top-3.5 right-3.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
            </button>
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="p-8 md:p-12 space-y-12">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { label: "Total Pendapatan", value: "Rp 128.4M", trend: "+12.5%", color: "text-emerald-500", icon: <TrendingUp size={24} /> },
              { label: "Permintaan Aktif", value: "842", trend: "+5.2%", color: "text-blue-500", icon: <Briefcase size={24} /> },
              { label: "Tingkat Kepuasan", value: "98.4%", trend: "+1.2%", color: "text-amber-500", icon: <Star size={24} className="fill-current" /> },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-3xl border border-black/[0.05] bg-white p-8 shadow-sm transition-all hover:shadow-xl hover:shadow-black/5"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`h-14 w-14 rounded-2xl bg-black/[0.03] flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white`}>
                    {stat.icon}
                  </div>
                  <span className={`text-xs font-black px-3 py-1.5 rounded-full bg-black/[0.03] ${stat.trend.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-sm font-bold text-[#666] mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black tracking-tight">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* PERFORMANCE CHART SECTION */}
          <section className="rounded-3xl border border-black/[0.05] bg-white p-10 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-xl font-black mb-1">Performa Layanan</h2>
                <p className="text-xs font-bold text-[#a1a1a1]">Tren permintaan layanan dalam 30 hari terakhir</p>
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
            <div className="relative h-[300px] w-full mt-8">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
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
              <div className="absolute top-[120px] left-[380px] rounded-xl bg-black p-3 text-white shadow-2xl">
                <p className="text-[10px] font-bold opacity-50">12 Apr</p>
                <p className="text-xs font-black">1.2k Permintaan</p>
              </div>
            </div>
          </section>

          {/* RECENT TRANSACTIONS TABLE */}
          <section className="rounded-3xl border border-black/[0.05] bg-white shadow-sm overflow-hidden">
            <div className="p-8 border-b border-black/[0.05] flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black mb-1">Permintaan Layanan Baru</h2>
                <p className="text-xs font-bold text-[#a1a1a1]">Monitor status terkini pesanan dari pelanggan</p>
              </div>
              <button className="text-xs font-black text-black hover:opacity-50">Lihat Semua</button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-black/[0.02] text-[10px] font-black uppercase tracking-widest text-[#a1a1a1]">
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
                      <td className="px-8 py-6 text-[#a1a1a1]">{row.date}</td>
                      <td className="px-8 py-6 text-right font-black">{row.amount}</td>
                      <td className="px-8 py-6 text-center">
                        <span className={`rounded-lg border px-2.5 py-1 text-[10px] uppercase tracking-tighter font-black ${row.sc}`}>
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
      </main>

      {/* RIGHT PANEL SUMMARY */}
      <aside className="fixed right-0 top-0 hidden h-screen w-80 border-l border-black/[0.05] bg-white lg:flex lg:flex-col">
        <div className="p-8 space-y-10 overflow-y-auto">
          
          {/* Admin Profile Details */}
          <div className="text-center pt-8">
            <div className="relative mx-auto mb-6 h-24 w-24 rounded-3xl border-2 border-black/5 p-1">
              <div className="h-full w-full rounded-2xl overflow-hidden bg-black/[0.03]">
                <Image src="/images/budi.png" alt="Admin" width={96} height={96} className="object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-xl bg-black border-4 border-white flex items-center justify-center">
                <CheckCircle size={14} className="text-white" />
              </div>
            </div>
            <h4 className="text-lg font-black tracking-tight">Rizky Ramadhan</h4>
            <p className="text-xs font-bold text-[#a1a1a1]">Senior Manager FixIt</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl bg-black/[0.03] p-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] mb-1">PROYEK</p>
              <p className="text-sm font-black">1.4k</p>
            </div>
            <div className="rounded-2xl bg-black/[0.03] p-4 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#a1a1a1] mb-1">RATING</p>
              <p className="text-sm font-black">4.9/5</p>
            </div>
          </div>

          {/* Activity Logs */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-black uppercase tracking-widest">Aktivitas Tim</h5>
              <button className="text-[10px] font-black text-[#a1a1a1] hover:text-black">LIHAT SEMUA</button>
            </div>
            <div className="space-y-6">
              {[
                { name: "Maya", act: "Menyelesaikan pesanan #FIX-9011", time: "2m yang lalu", icon: <CheckCircle size={14} className="text-emerald-500" /> },
                { name: "Hendra", act: "Menambahkan teknisi baru", time: "15m yang lalu", icon: <Plus size={14} className="text-blue-500" /> },
                { name: "Budi", act: "Memperbarui jadwal layanan", time: "1h yang lalu", icon: <Clock size={14} className="text-amber-500" /> },
              ].map((log, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-2 w-2 rounded-full bg-black/5 mt-1.5 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold leading-relaxed">
                      <span className="font-black">{log.name}</span> {log.act}
                    </p>
                    <p className="text-[10px] font-bold text-[#a1a1a1]">{log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* High-CTA Card */}
          <div className="rounded-3xl bg-black p-8 text-white relative overflow-hidden group">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-700" />
            <h6 className="text-lg font-black leading-tight mb-4 relative z-10">Unduh Laporan Bulanan Sekarang.</h6>
            <button className="w-full rounded-xl bg-white/20 py-3 text-xs font-black backdrop-blur-md transition-all hover:bg-white hover:text-black">
              Download .PDF
            </button>
          </div>

        </div>
      </aside>

    </div>
  );
}