"use client";

import { motion } from "framer-motion";
import { 
  Wrench, 
  Star, 
  CheckCircle2, 
  Clock, 
  MapPin,
  MessageSquare,
  ChevronRight,
  MoreVertical,
  Calendar,
  Filter,
  Wallet
} from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { authService } from "@/lib/api/auth.service";

export default function TeknisiDashboard() {
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
    { label: "Tugas Hari Ini", value: "4", trend: "2 Selesai", color: "text-blue-600", bg: "bg-blue-50", icon: <Wrench size={18} /> },
    { label: "Pendapatan Bulan Ini", value: "Rp 3.5M", trend: "+15%", color: "text-emerald-600", bg: "bg-emerald-50", icon: <Wallet size={18} /> },
    { label: "Rating Teknisi", value: "4.9", trend: "Sangat Baik", color: "text-amber-600", bg: "bg-amber-50", icon: <Star size={18} /> },
    { label: "Total Selesai", value: "128", trend: "Bulan Ini", color: "text-purple-600", bg: "bg-purple-50", icon: <CheckCircle2 size={18} /> },
  ];

  const assignedOrders = [
    { id: "ORD-9921", customer: "Budi Santoso", service: "Service AC Split", address: "Jl. Sudirman No. 12", status: "Dalam Perjalanan", time: "10:00 WIB", priority: "Tinggi" },
    { id: "ORD-9922", customer: "Siska Amelia", service: "Perbaikan Pipa Bocor", address: "Komp. Mawar Blok B4", status: "Menunggu", time: "13:30 WIB", priority: "Sedang" },
    { id: "ORD-9923", customer: "Anwar Jaya", service: "Instalasi Listrik", address: "Jl. Melati No. 8", status: "Menunggu", time: "15:00 WIB", priority: "Normal" },
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
          <h1 className="text-2xl font-black tracking-tight text-black">
            Siap Bertugas, {profile?.full_name?.split(' ')[0] || "Teknisi"} 
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Berikut adalah jadwal dan tugas layanan Anda hari ini.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3"
        >
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
            <Calendar size={16} />
            Hari Ini
          </button>
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold transition-all shadow-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Status: Tersedia
          </div>
        </motion.div>
      </section>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                {stat.icon}
              </div>
              <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${
                stat.trend.startsWith('+') || stat.trend === 'Sangat Baik' 
                ? 'bg-emerald-50 text-emerald-600' 
                : 'bg-gray-100 text-gray-600'
              }`}>
                {stat.trend}
              </span>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-black text-black">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* TASKS TABLE */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-black text-black">Jadwal Tugas Anda</h2>
            <button className="p-2 hover:bg-gray-50 rounded-lg">
              <Filter size={14} className="text-gray-400" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-widest text-left">
                  <th className="px-6 py-4">Pelanggan & ID</th>
                  <th className="px-6 py-4">Layanan & Lokasi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Waktu</th>
                  <th className="px-6 py-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {assignedOrders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-black text-gray-400">{order.id}</p>
                        <p className="text-sm font-bold text-black">{order.customer}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-700">{order.service}</p>
                      <div className="flex items-center gap-1 mt-1 text-gray-400">
                        <MapPin size={12} />
                        <p className="text-[10px] font-bold">{order.address}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter ${
                        order.status === 'Dalam Perjalanan' ? 'bg-blue-50 text-blue-600' :
                        order.status === 'Menunggu' ? 'bg-amber-50 text-amber-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Clock size={12} />
                      {order.time}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <MessageSquare size={14} />
                        </button>
                        <button className="px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-colors">
                          {order.status === 'Menunggu' ? 'Mulai' : 'Selesai'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* SIDE PANELS */}
        <div className="space-y-8">
          {/* UPCOMING SCHEDULE */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-black">Peralatan Dibutuhkan</h2>
            </div>
            
            <div className="space-y-3">
              {[
                { item: "Freon R32", qty: "2 Tabung", desc: "Untuk service AC Bpk. Budi" },
                { item: "Pipa PVC 1/2", qty: "5 Meter", desc: "Instalasi pipa air Ibu Siska" },
                { item: "Kabel NYM", qty: "10 Meter", desc: "Instalasi listrik Bpk. Anwar" },
              ].map((tool, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50">
                  <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-black">
                    <Wrench size={16} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-black">{tool.item}</p>
                      <span className="text-[10px] font-black text-gray-500">{tool.qty}</span>
                    </div>
                    <p className="text-[10px] font-medium text-gray-400 mt-0.5">{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3 rounded-xl border border-dashed border-gray-300 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:border-black hover:text-black transition-all">
              Cek Gudang
            </button>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
