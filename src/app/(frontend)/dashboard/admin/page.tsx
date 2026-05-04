"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ChevronRight,
  MoreVertical,
  Calendar,
  Filter
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { authService } from "@/lib/api/auth.service";

export default function AdminDashboard() {
  const { userRole } = useAuth();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profileId = localStorage.getItem("profile_id");
      if (profileId) {
        try {
          const res = await authService.getProfile(profileId);
          const data = res.data.data || res.data;
          setProfile(data);
        } catch (err) {
          console.error("Failed to load profile:", err);
        }
      }
    };
    loadProfile();
  }, []);

  const stats = [
    { label: "Pesanan Hari Ini", value: "24", trend: "+12%", color: "text-blue-600", bg: "bg-blue-50", icon: <Briefcase size={20} /> },
    { label: "Teknisi On-Duty", value: "8/12", trend: "Aktif", color: "text-emerald-600", bg: "bg-emerald-50", icon: <Users size={20} /> },
    { label: "Menunggu Konfirmasi", value: "5", trend: "Penting", color: "text-amber-600", bg: "bg-amber-50", icon: <AlertCircle size={20} /> },
    { label: "Penyelesaian", value: "98%", trend: "+2.4%", color: "text-purple-600", bg: "bg-purple-50", icon: <CheckCircle2 size={20} /> },
  ];

  const recentOrders = [
    { id: "ORD-9921", customer: "Budi Santoso", service: "Service AC Split", tech: "Rian H.", status: "Dalam Proses", time: "10 Menit lalu", amount: "Rp 150.000" },
    { id: "ORD-9920", customer: "Siska Amelia", service: "Cuci AC (3 Unit)", tech: "Dedi K.", status: "Selesai", time: "1 Jam lalu", amount: "Rp 300.000" },
    { id: "ORD-9919", customer: "Anwar Jaya", service: "Isi Freon R32", tech: "Budi S.", status: "Menunggu", time: "2 Jam lalu", amount: "Rp 350.000" },
    { id: "ORD-9918", customer: "Mega Pratama", service: "Perbaikan PCB", tech: "Rian H.", status: "Terjadwal", time: "3 Jam lalu", amount: "Rp 450.000" },
  ];

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-3xl font-black tracking-tight text-black">
            Halo, {profile?.full_name?.split(' ')[0] || "Admin"} 👋
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Berikut adalah ringkasan operasional tenant Anda hari ini.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Calendar size={16} />
            2 Mei 2026
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10">
            <Plus size={16} />
            Buat Pesanan
          </button>
        </motion.div>
      </section>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter ${
                stat.trend.startsWith('+') || stat.trend === 'Aktif' 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-amber-50 text-amber-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-black text-black">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* RECENT ORDERS TABLE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-black text-black">Pesanan Terbaru</h2>
            <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight size={14} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">
                  <th className="px-6 py-4">ID & Pelanggan</th>
                  <th className="px-6 py-4">Layanan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-gray-400">{order.id}</p>
                        <p className="text-sm font-bold text-black">{order.customer}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-700">{order.service}</p>
                      <p className="text-[10px] font-bold text-gray-400">Teknisi: {order.tech}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${
                        order.status === 'Selesai' ? 'bg-emerald-50 text-emerald-600' :
                        order.status === 'Dalam Proses' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'Menunggu' ? 'bg-amber-50 text-amber-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400">
                      {order.time}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical size={16} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* SIDE PANELS */}
        <div className="space-y-8">
          {/* PERFORMANCE CARD */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-black rounded-3xl p-8 text-white relative overflow-hidden group"
          >
            <div className="relative z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                  <TrendingUp size={20} className="text-emerald-400" />
                </div>
                <button className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-colors">
                  Detail
                </button>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimasi Pendapatan</p>
                <h2 className="text-3xl font-black">Rp 12.450.000</h2>
              </div>
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px] font-bold">
                <span className="text-emerald-400">+14.2% dari kemarin</span>
                <span className="text-gray-500">Target: 15jt</span>
              </div>
            </div>
            {/* Background Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/20 transition-all duration-700" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700" />
          </motion.div>

          {/* TECHNICIANS STATUS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-black">Status Teknisi</h2>
              <button className="p-2 hover:bg-gray-50 rounded-lg">
                <Filter size={14} className="text-gray-400" />
              </button>
            </div>
            
            <div className="space-y-4">
              {[
                { name: "Rian Hidayat", status: "Sibuk", color: "bg-amber-500", task: "ORD-9921" },
                { name: "Budi Santoso", status: "Tersedia", color: "bg-emerald-500", task: "Siap Sedia" },
                { name: "Dedi Kusuma", status: "Sibuk", color: "bg-amber-500", task: "ORD-9920" },
              ].map((tech, i) => (
                <div key={tech.name} className="flex items-center gap-3 group cursor-pointer">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 group-hover:bg-black group-hover:text-white transition-all">
                    {tech.name[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-black">{tech.name}</p>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{tech.status}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-1.5 w-1.5 rounded-full ${tech.color}`} />
                      <p className="text-[10px] font-bold text-gray-400">{tech.task}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-black hover:text-black transition-all">
              Kelola Semua Teknisi
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
}