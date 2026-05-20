"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, 
  TrendingUp, 
  Star, 
  Plus, 
  ChevronDown, 
  MoreVertical,
  Users,
  Clock
} from "lucide-react";

export default function TenantDashboard() {
  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 md:space-y-12 w-full overflow-hidden">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {[
              { label: "Pendapatan Tenant", value: "Rp 42.8M", trend: "+8.2%", color: "text-emerald-500", icon: <TrendingUp size={20} /> },
              { label: "Pesanan Masuk", value: "156", trend: "+12.5%", color: "text-blue-500", icon: <Briefcase size={20} /> },
              { label: "Rating Tenant", value: "4.9", trend: "+0.3", color: "text-amber-500", icon: <Star size={20} className="fill-current" /> },
              { label: "Teknisi Aktif", value: "12", trend: "Tetap", color: "text-purple-500", icon: <Users size={20} /> },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-gray-300 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-black/5 flex flex-col sm:block"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
                  <div className={`h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-2xl bg-black/[0.03] flex items-center justify-center shrink-0 transition-colors group-hover:bg-black group-hover:text-white`}>
                    <div className="scale-75 sm:scale-100">{stat.icon}</div>
                  </div>
                  <span className={`w-fit rounded-md sm:rounded-lg border px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] uppercase tracking-tighter font-black ${
                    stat.trend.startsWith('+') 
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                      : 'bg-gray-50 text-gray-600 border-gray-100'
                  }`}>
                    {stat.trend}
                  </span>
                </div>
                <div className="mt-auto sm:mt-0">
                  <p className="text-[9px] sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1 line-clamp-1">{stat.label}</p>
                  <h3 className="text-lg sm:text-2xl font-bold tracking-tight leading-none">{stat.value}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* PERFORMANCE CHART SECTION */}
          <section className="rounded-xl border border-gray-300 bg-white p-5 sm:p-10 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4 sm:gap-0">
              <div>
                <h2 className="text-xl font-bold mb-1">Statistik Pesanan</h2>
                <p className="text-xs font-medium text-gray-600">Grafik permintaan servis pada tenant Anda</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="h-10 px-4 rounded-xl border border-black/[0.05] text-xs font-black flex items-center gap-2 hover:bg-black/[0.03]">
                  Mingguan <ChevronDown size={14} />
                </button>
                <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-black text-white shadow-lg transition-all hover:scale-105 active:scale-95">
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Simulated SVG Chart */}
            <div className="relative w-full mt-6 sm:mt-8 aspect-[10/3] min-h-[150px]">
              <svg className="h-full w-full overflow-visible" viewBox="-60 -20 1080 380">
                {/* Grid Lines and Y-Axis */}
                {[0, 1, 2, 3].map((i) => (
                  <g key={`y-${i}`}>
                    <text x="-20" y={i * 100 + 8} fill="#a1a1aa" fontSize="24" fontWeight="600" textAnchor="end">
                      {30 - i * 10}
                    </text>
                    <line x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#f0f0f0" strokeWidth="1" />
                  </g>
                ))}
                
                {/* X-Axis Labels */}
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((day, i) => (
                  <text key={day} x={i * (1000 / 6)} y="350" fill="#a1a1aa" fontSize="24" fontWeight="600" textAnchor="middle">
                    {day}
                  </text>
                ))}
                <defs>
                  <linearGradient id="tenantChartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,280 Q150,200 300,220 T600,100 T1000,150 V300 H0 Z" 
                  fill="url(#tenantChartGradient)"
                />
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  d="M0,280 Q150,200 300,220 T600,100 T1000,150" 
                  fill="none" 
                  stroke="#f97316" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                <circle cx="600" cy="100" r="6" fill="#f97316" stroke="white" strokeWidth="2" />
              </svg>
              
              <div 
                className="absolute rounded-xl bg-black p-3 text-white shadow-2xl transform -translate-x-1/2 -translate-y-[calc(100%+12px)]"
                style={{ top: '33%', left: '60%' }}
              >
                <p className="text-[10px] font-bold opacity-50">Hari Ini</p>
                <p className="text-xs font-black whitespace-nowrap">24 Pesanan</p>
              </div>
            </div>
          </section>

          {/* RECENT ORDERS TABLE */}
          <section className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden mt-6 sm:mt-0">
            <div className="p-4 sm:p-6 border-b border-gray-300 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold mb-1">Pesanan Terbaru</h2>
                <p className="text-xs font-medium text-[#a1a1a1]">Daftar permintaan servis yang masuk ke tenant Anda</p>
              </div>
              <button className="h-9 px-4 rounded-lg border border-gray-300 bg-white text-xs font-semibold text-black shadow-sm transition-all hover:bg-black/[0.03] active:scale-95">
                Kelola Semua
              </button>
            </div>
            
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-black/[0.02] text-[10px] font-medium uppercase tracking-widest text-[#a1a1a1]">
                    <th className="px-4 sm:px-8 py-4 whitespace-nowrap">ID</th>
                    <th className="px-4 sm:px-8 py-4 whitespace-nowrap">LAYANAN</th>
                    <th className="px-4 sm:px-8 py-4 whitespace-nowrap">TEKNISI</th>
                    <th className="px-4 sm:px-8 py-4 whitespace-nowrap">WAKTU</th>
                    <th className="px-4 sm:px-8 py-4 text-right whitespace-nowrap">BIAYA</th>
                    <th className="px-4 sm:px-8 py-4 text-center whitespace-nowrap">STATUS</th>
                    <th className="px-4 sm:px-8 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03]">
                  {[
                    { id: "#T-701", service: "Service AC Split", tech: "Rian H.", time: "14:00 WIB", amount: "Rp 150.000", status: "Terjadwal", sc: "bg-blue-50 text-blue-600 border-blue-100" },
                    { id: "#T-702", service: "Cuci AC (2 Unit)", tech: "Budi S.", time: "15:30 WIB", amount: "Rp 200.000", status: "Selesai", sc: "bg-emerald-50 text-emerald-600 border-emerald-100" },
                    { id: "#T-703", service: "Perbaikan Kompresor", tech: "Dedi K.", time: "16:15 WIB", amount: "Rp 850.000", status: "Proses", sc: "bg-amber-50 text-amber-600 border-amber-100" },
                    { id: "#T-704", service: "Isi Freon R32", tech: "Rian H.", time: "Besok, 09:00", amount: "Rp 350.000", status: "Menunggu", sc: "bg-gray-50 text-gray-600 border-gray-100" },
                  ].map((row, i) => (
                    <tr key={i} className="text-xs font-bold transition-all hover:bg-black/[0.01]">
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-black/40 text-[10px] font-black whitespace-nowrap">{row.id}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">{row.service}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black shrink-0">{row.tech[0]}</div>
                          {row.tech}
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 flex items-center gap-2 whitespace-nowrap">
                        <Clock size={12} className="text-[#a1a1a1] shrink-0" />
                        {row.time}
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-right font-bold whitespace-nowrap">{row.amount}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-center whitespace-nowrap">
                        <span className={`rounded-lg border px-2.5 py-1 text-[10px] uppercase tracking-tighter font-bold ${row.sc}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-right whitespace-nowrap">
                        <button className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-black/[0.05] transition-colors ml-auto">
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