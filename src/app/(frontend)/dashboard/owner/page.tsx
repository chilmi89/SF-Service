"use client";

import { motion } from "framer-motion";
import { 
  Briefcase, 
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Loader2,
  Wallet,
  ChevronDown
} from "lucide-react";
import { Toast } from "@/components/toast";
import { useOwnerDashboard } from "@/hooks/owner/useOwnerDashboard";

export default function TenantDashboard() {
  const {
    tasks,
    isLoadingTasks,
    updateTaskStatus,
    toast,
    setToast,
    isOwnerTunggal,
    acceptedOrdersCount,
    formattedRevenue,
    layananCount,
    staffCount,
    chartPaths,
    hoveredPoint,
    setHoveredPoint,
    filter,
    setFilter,
    isFilterDropdownOpen,
    setIsFilterDropdownOpen
  } = useOwnerDashboard();

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Dalam Perjalanan': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Menunggu': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Selesai': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Dibatalkan': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const stats = [
    { label: "Pendapatan Diterima", value: formattedRevenue, trend: `${acceptedOrdersCount} Order`, color: "text-emerald-500", icon: <Wallet size={20} /> },
    { label: "Jumlah Layanan", value: layananCount.toString(), trend: "Layanan Pembelian", color: "text-blue-500", icon: <Briefcase size={20} /> },
    { label: "Jumlah Karyawan / Staff", value: staffCount.toString(), trend: "Staff Terdaftar", color: "text-amber-500", icon: <Users size={20} /> },
    { label: "Role Anda", value: isOwnerTunggal ? "Owner Tunggal" : "Owner Tenant", trend: "Sistem", color: "text-purple-500", icon: <Users size={20} /> },
  ];

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
            className="group rounded-xl border border-gray-300 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-black/5 flex flex-col sm:block"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2 sm:gap-0">
              <div className={`h-8 w-8 sm:h-11 sm:w-11 rounded-lg sm:rounded-2xl bg-black/[0.03] flex items-center justify-center shrink-0 transition-colors group-hover:bg-black group-hover:text-white ${stat.color}`}>
                <div className="scale-75 sm:scale-100">{stat.icon}</div>
              </div>
              <span className={`w-fit rounded-md sm:rounded-lg border px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[8px] sm:text-[10px] uppercase tracking-tighter font-black bg-gray-50 text-gray-600 border-gray-100`}>
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
      {chartPaths && chartPaths.points.length > 0 && (
        <section className="rounded-xl border border-gray-300 bg-white p-5 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-4 sm:gap-0">
            <div>
              <h2 className="text-xl font-bold mb-1">Pertumbuhan Order Diterima</h2>
              <p className="text-xs font-medium text-gray-600">Statistik pesanan masuk harian yang disetujui (diterima) oleh tenant Anda.</p>
            </div>
            <div className="flex items-center gap-3">
              {/* HOVER DETAIL */}
              {hoveredPoint && (
                <div className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold flex items-center gap-3 w-fit shadow-md animate-fade-in">
                  <span className="opacity-75">{new Date(hoveredPoint.date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{hoveredPoint.value} Pesanan</span>
                </div>
              )}

              {/* FILTER DROPDOWN */}
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
                <p className="text-xs font-black whitespace-nowrap">{hoveredPoint.value} Pesanan</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CONDITIONAL CONTENT BASED ON OWNER TUNGGAL OR REGULAR OWNER */}
      {isOwnerTunggal ? (
        /* OWNER TUNGGAL VIEW: MY PERSONAL TASKS CARD GRID */
        <section className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-black text-black">Tugas Mandiri Saya</h2>
              <p className="text-xs font-medium text-gray-500">Kelola dan kerjakan pesanan pelanggan Anda secara langsung.</p>
            </div>
          </div>

          {isLoadingTasks ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
              <Loader2 className="h-10 w-10 animate-spin text-black mb-4" />
              <h3 className="text-sm font-bold text-black">Memuat data tugas Anda...</h3>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-3xl bg-gray-50/50">
              <AlertCircle size={32} className="text-gray-400 mb-3" />
              <h3 className="text-sm font-bold text-black mb-1">Belum Ada Tugas</h3>
              <p className="text-xs font-medium text-gray-500 max-w-sm">
                Silakan terima pesanan baru di halaman verifikasi order untuk membuat tugas otomatis.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col shadow-sm"
                >
                  <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black tracking-widest text-gray-400 uppercase">Tugas Mandiri</span>
                        <div className={`px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${getStatusColor(task.status)}`}>
                          {task.status === 'Dalam Perjalanan' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                          {task.status}
                        </div>
                      </div>
                      <h3 className="text-base font-black text-black leading-tight group-hover:text-blue-600 transition-colors">{task.serviceName}</h3>
                    </div>
                  </div>

                  <div className="p-5 space-y-3 flex-grow text-xs font-semibold text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-gray-400" />
                      <span className="text-black font-bold">{task.customerName}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                      <span className="leading-snug">{task.address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{task.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-gray-400" />
                      <span>{task.time}</span>
                    </div>

                    {task.deskripsi && (
                      <div className="p-3 bg-gray-50 rounded-xl border border-black/[0.03] space-y-1 mt-2 text-[11px]">
                        <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 block">Detail Tugas</span>
                        <p className="font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{task.deskripsi}</p>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-end gap-2">
                    {task.status !== 'Selesai' && task.status !== 'Dibatalkan' && (
                      <button
                        onClick={() =>
                          updateTaskStatus(
                            task.id,
                            task.status === 'Menunggu' ? 'Dalam Perjalanan' : 'Selesai'
                          )
                        }
                        className="w-full py-2 rounded-xl bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all active:scale-95 shadow-sm text-center"
                      >
                        {task.status === 'Menunggu' ? 'Mulai Tugas' : 'Selesaikan Pekerjaan'}
                      </button>
                    )}
                    {task.status === 'Selesai' && (
                      <div className="w-full py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider text-center cursor-not-allowed">
                        Selesai
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* REGULAR OWNER VIEW: STAFF TASK MONITORING TABLE */
        <section className="rounded-xl border border-gray-300 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-300">
            <h2 className="text-lg font-bold mb-1">Monitoring Tugas Teknisi</h2>
            <p className="text-xs font-medium text-gray-500">Pantau progres pekerjaan yang sedang ditangani oleh staf teknisi Anda.</p>
          </div>
          
          {isLoadingTasks ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-black mb-3" />
              <p className="text-xs font-bold text-gray-500">Memuat data monitoring tugas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center text-gray-500">
              <AlertCircle size={28} className="mb-2" />
              <p className="text-xs font-bold">Belum ada tugas pengerjaan yang dibuat di tenant ini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <table className="w-full text-left min-w-[800px]">
                <thead>
                  <tr className="bg-black/[0.02] text-[10px] font-medium uppercase tracking-widest text-gray-400">
                    <th className="px-4 sm:px-8 py-4 whitespace-nowrap">NAMA TUGAS</th>
                    <th className="px-4 sm:px-8 py-4 whitespace-nowrap">PELANGGAN</th>
                    <th className="px-4 sm:px-8 py-4 whitespace-nowrap">TEKNISI</th>
                    <th className="px-4 sm:px-8 py-4 whitespace-nowrap">DEADLINE</th>
                    <th className="px-4 sm:px-8 py-4 text-center whitespace-nowrap">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.03]">
                  {tasks.map((task) => (
                    <tr key={task.id} className="text-xs font-bold transition-all hover:bg-black/[0.01]">
                      <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                        <span className="block text-black">{task.serviceName}</span>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">{task.customerName}</td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black shrink-0 border border-gray-200">
                            {task.technicianName.charAt(0)}
                          </div>
                          {task.technicianName}
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock size={12} className="shrink-0" />
                          <span>{task.date} {task.time}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-8 py-4 sm:py-6 text-center whitespace-nowrap">
                        <span className={`rounded-lg border px-2.5 py-1 text-[9px] uppercase tracking-wider font-black ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {toast && (
        <Toast
          show={toast.show}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}