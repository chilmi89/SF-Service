"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import { 
  MoreVertical, 
  ChevronDown,
  Loader2
} from "lucide-react";
import { useSuperAdminDashboard } from "@/hooks/superadmin/useSuperAdminDashboard";

export default function SuperAdminDashboard() {
  const { 
    isLoading, 
    error,
    stats,
    filter,
    setFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen,
    chartPaths,
    hoveredPoint,
    setHoveredPoint
  } = useSuperAdminDashboard();

  return (
    <div className="p-4 sm:p-8 md:p-12 space-y-8 md:space-y-12 w-full overflow-hidden">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group rounded-xl border border-gray-300 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-black/5"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`h-11 w-11 rounded-2xl bg-black/[0.03] flex items-center justify-center transition-colors group-hover:bg-black group-hover:text-white ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <span className="rounded-lg border px-2.5 py-1 text-[10px] uppercase tracking-tighter font-black bg-emerald-50 text-emerald-600 border-emerald-100">
                    Aktif
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
                <h2 className="text-xl font-bold mb-1">Pertumbuhan User</h2>
                <p className="text-xs font-medium text-gray-600">Jumlah pendaftar baru per hari dari waktu ke waktu</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <button 
                    onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                    className="h-10 px-4 rounded-xl border border-black/[0.05] text-xs font-black flex items-center gap-2 hover:bg-black/[0.03] transition-all"
                  >
                    {filter === "7days" ? "7 Hari Terakhir" : filter === "30days" ? "30 Hari Terakhir" : "Semua"} 
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isFilterDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  {isFilterDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setIsFilterDropdownOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl z-20">
                        {[
                          { id: "7days", label: "7 Hari Terakhir" },
                          { id: "30days", label: "30 Hari Terakhir" },
                          { id: "all", label: "Semua" }
                        ].map((item) => (
                          <button
                            key={item.id}
                            onClick={() => {
                              setFilter(item.id as any);
                              setIsFilterDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                              filter === item.id 
                                ? "bg-black text-white" 
                                : "text-gray-700 hover:bg-black/[0.03]"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Dynamic SVG Chart */}
            <div className="relative w-full mt-6 sm:mt-8 aspect-[10/3] min-h-[150px]">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 300">
                {/* Y-Axis Labels */}
                {[0, 1, 2, 3].map((i) => {
                  const val = chartPaths ? Math.round(chartPaths.maxVal - (i / 3) * chartPaths.maxVal) : 0;
                  const y = 40 + i * 73.3;
                  return (
                    <text 
                      key={`y-label-${i}`}
                      x="30" 
                      y={y + 4} 
                      fill="#a1a1a1" 
                      fontSize="10" 
                      fontWeight="black" 
                      textAnchor="end"
                      className="select-none"
                    >
                      {val}
                    </text>
                  );
                })}

                {/* Grid Lines */}
                {[0, 1, 2, 3].map((i) => (
                  <line key={i} x1="40" y1={40 + i * 73.3} x2="960" y2={40 + i * 73.3} stroke="#f0f0f0" strokeWidth="1" />
                ))}
                
                {/* Area Gradient Defs */}
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.05" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0" />
                  </linearGradient>
                </defs>

                {chartPaths && (
                  <>
                    {/* Area Gradient */}
                    <path 
                      d={chartPaths.areaD} 
                      fill="url(#chartGradient)"
                    />

                    {/* Line Path with motion */}
                    <motion.path 
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                      d={chartPaths.pathD} 
                      fill="none" 
                      stroke="black" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {chartPaths.points.map((p, idx) => (
                      <circle 
                        key={idx} 
                        cx={p.x} 
                        cy={p.y} 
                        r={hoveredPoint && hoveredPoint.x === p.x ? "6" : "4"} 
                        fill="black" 
                        stroke="white" 
                        strokeWidth="2"
                        className="transition-all duration-150"
                      />
                    ))}

                    {/* X-Axis Ticks & Labels */}
                    {chartPaths.points.map((p, idx) => {
                      const showLabel = 
                        idx === 0 || 
                        idx === chartPaths.points.length - 1 || 
                        (chartPaths.points.length > 2 && idx === Math.floor(chartPaths.points.length / 2)) ||
                        (chartPaths.points.length > 4 && (idx === Math.floor(chartPaths.points.length / 4) || idx === Math.floor(chartPaths.points.length * 3 / 4)));
                      
                      if (!showLabel) return null;

                      let formattedDate = p.date;
                      try {
                        const d = new Date(p.date);
                        formattedDate = d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
                      } catch (e) {}

                      return (
                        <g key={`x-tick-${idx}`}>
                          <line x1={p.x} y1="260" x2={p.x} y2="265" stroke="#e0e0e0" strokeWidth="1" />
                          <text 
                            x={p.x} 
                            y="280" 
                            fill="#a1a1a1" 
                            fontSize="10" 
                            fontWeight="black" 
                            textAnchor="middle"
                            className="select-none"
                          >
                            {formattedDate}
                          </text>
                        </g>
                      );
                    })}

                    {/* Interactive Hov-zones */}
                    {chartPaths.points.map((p, idx) => (
                      <circle
                        key={`hover-${idx}`}
                        cx={p.x}
                        cy={p.y}
                        r="24"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint(p)}
                      />
                    ))}
                  </>
                )}
              </svg>
              
              {/* Tooltip Overlay */}
              {hoveredPoint && (
                <div 
                  className="absolute rounded-xl bg-black p-3 text-white shadow-2xl pointer-events-none transform -translate-x-1/2 -translate-y-[120%] transition-all duration-150"
                  style={{ 
                    top: `${(hoveredPoint.y / 300) * 100}%`, 
                    left: `${(hoveredPoint.x / 1000) * 100}%` 
                  }}
                >
                  <p className="text-[10px] font-bold opacity-50">{hoveredPoint.date}</p>
                  <p className="text-xs font-black whitespace-nowrap">{hoveredPoint.value} User Baru</p>
                </div>
              )}
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