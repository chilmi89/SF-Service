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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group rounded-xl border border-gray-300 bg-white p-3.5 sm:p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-black/5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div className={`h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-2xl bg-black/[0.03] flex items-center justify-center shrink-0 transition-colors group-hover:bg-black group-hover:text-white ${stat.color}`}>
                  <div className="scale-75 sm:scale-100">{stat.icon}</div>
                </div>
                <span className="rounded-md sm:rounded-lg border px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] uppercase tracking-tighter font-black bg-emerald-50 text-emerald-600 border-emerald-100">
                  Aktif
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-gray-500 mb-0.5 sm:mb-1 truncate" title={stat.label}>{stat.label}</p>
            </div>
            <div>
              <h3 className="text-sm sm:text-2xl font-bold tracking-tight text-black truncate" title={stat.value.toString()}>{stat.value}</h3>
            </div>
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
            <div className="relative w-full mt-6 sm:mt-8 aspect-[16/9] sm:aspect-[10/3]">
              <svg className="h-full w-full overflow-visible" viewBox="0 0 1000 300" preserveAspectRatio="none">
                {/* Y-Axis Labels */}
                {[0, 1, 2, 3].map((i) => {
                  const val = chartPaths ? Math.round(chartPaths.maxVal - (i / 3) * chartPaths.maxVal) : 0;
                  const y = 40 + i * 73.3;
                  return (
                    <text 
                      key={`y-label-${i}`}
                      x="25" 
                      y={y + 4} 
                      textAnchor="end"
                      className="select-none fill-[#a1a1a1] text-[9px] sm:text-xs font-bold"
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
                            textAnchor="middle"
                            className="select-none fill-[#a1a1a1] text-[9px] sm:text-xs font-bold"
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
                  className={`absolute rounded-xl bg-black p-3 text-white shadow-2xl pointer-events-none -translate-y-[120%] transition-all duration-150 ${
                    hoveredPoint.x < 150 
                      ? "translate-x-0" 
                      : hoveredPoint.x > 850 
                      ? "-translate-x-full" 
                      : "-translate-x-1/2"
                  }`}
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
    </div>
  );
}