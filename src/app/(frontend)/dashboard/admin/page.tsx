"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  ChevronRight,
  ChevronDown,
  Calendar,
  Loader2
} from "lucide-react";
import { useAdminDashboard } from "@/hooks/admin/useAdminDashboard";
import Link from "next/link";

export default function AdminDashboard() {
  const {
    profile,
    stats,
    recentOrders,
    technicianStatus,
    isLoading,
    chartPaths,
    hoveredPoint,
    setHoveredPoint,
    filter,
    setFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen
  } = useAdminDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Loader2 className="h-10 w-10 animate-spin text-black mb-4" />
        <h3 className="text-sm font-bold text-black">Memuat data dashboard admin...</h3>
      </div>
    );
  }

  const statsList = [
    { label: "Pesanan Hari Ini", value: stats.todayOrdersCount.toString(), trend: "Hari ini", color: "text-blue-600", bg: "bg-blue-50", icon: <Briefcase size={20} /> },
    { label: "Teknisi On-Duty", value: stats.activeTechsRatio, trend: "Aktif", color: "text-emerald-600", bg: "bg-emerald-50", icon: <Users size={20} /> },
    { label: "Menunggu Konfirmasi", value: stats.waitingOrdersCount.toString(), trend: "Penting", color: "text-amber-600", bg: "bg-amber-50", icon: <AlertCircle size={20} /> },
    { label: "Penyelesaian", value: stats.completionRate, trend: "Semua", color: "text-purple-600", bg: "bg-purple-50", icon: <CheckCircle2 size={20} /> },
  ];

  const todayDateStr = new Date().toLocaleDateString("id-ID", {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="p-6 md:p-10 space-y-10 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-bold">
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
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold shadow-sm">
            <Calendar size={16} />
            {todayDateStr}
          </div>
          <Link href="/dashboard/admin/verifikasi-order">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-lg shadow-black/10">
              <Plus size={16} />
              Verifikasi Order
            </button>
          </Link>
        </motion.div>
      </section>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsList.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 rounded-xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-medium text-gray-400">{stat.label}</span>
                <h3 className="text-2xl font-bold text-black mt-1">{stat.value}</h3>
              </div>
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            {stat.trend && (
              <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase ${
                  stat.trend === 'Aktif' || stat.trend === 'Semua' || stat.trend === 'Hari ini'
                    ? 'bg-emerald-50/70 text-emerald-600' 
                    : 'bg-amber-50/70 text-amber-600'
                }`}>
                  {stat.trend}
                </span>
                <span className="text-[10px] font-medium text-gray-400">Status</span>
              </div>
            )}
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
          className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-lg font-bold text-black">Pesanan Terbaru</h2>
            <Link href="/dashboard/admin/verifikasi-order" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              Lihat Semua <ChevronRight size={14} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-16 text-center text-gray-500 text-xs font-bold">
              Belum ada pesanan terbaru.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-400 uppercase  text-center">
                    <th className="px-6 py-4">ID & Pelanggan</th>
                    <th className="px-6 py-4">Layanan</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Waktu</th>
                    <th className="px-6 py-4">Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((order, i) => (
                    <tr key={i} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-medium text-gray-400">{order.id}</p>
                          <p className="text-sm font-bold text-black">{order.customerName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-700 text-center">{order.serviceName}</p>
                        <p className="text-[10px] font-medium text-gray-400">Teknisi: {order.technicianName}</p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full uppercase ${
                          order.statusText === 'Selesai' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          order.statusText === 'Dalam Proses' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          order.statusText === 'Menunggu' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          'bg-gray-100 text-gray-500 border border-gray-100'
                        }`}>
                          {order.statusText}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-gray-400 text-center">
                        {order.timeText}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-black text-center">
                        {order.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
 
        {/* SIDE PANELS */}
        <div className="space-y-8">
          {/* TECHNICIANS STATUS */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-black">Status Teknisi</h2>
            </div>
            
            {technicianStatus.length === 0 ? (
              <p className="text-xs font-bold text-gray-400 text-center py-4">Tidak ada staf teknisi terdaftar.</p>
            ) : (
              <div className="space-y-4">
                {technicianStatus.map((tech, i) => (
                  <div key={tech.name} className="flex items-center gap-3 group cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-black text-gray-500 group-hover:bg-black group-hover:text-white transition-all">
                      {tech.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-black">{tech.name}</p>
                        <span className="text-[11px] font-medium text-gray-400">{tech.status}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className={`h-1.5 w-1.5 rounded-full ${tech.color}`} />
                        <p className="text-[10px] font-medium text-gray-400">{tech.task}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link href="/dashboard/admin/kelola-staf" className="block w-full">
              <button className="w-full py-3 rounded-xl border border-gray-100 border-gray-300 text-[10px] font-bold text-gray-400 uppercase hover:border-black hover:text-black transition-all">
                Kelola Semua Staf
              </button>
            </Link>
          </motion.div>
        </div>

      </div>
    </div>
  );
}