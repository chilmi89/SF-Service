"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  Calendar,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Loader2
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { Toast } from "@/components/toast";

const tabs = ["Semua", "Menunggu", "Dalam Perjalanan", "Selesai", "Dibatalkan"];

const formatServiceName = (name: string) => {
  const clean = name.replace(/^(pekerjaan:\s*|pekerjaan\s*-\s*)/i, "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

const getPriorityBorderColor = (priority: string) => {
  switch(priority) {
    case 'Tinggi': return 'border-l-4 border-l-red-500';
    case 'Sedang': return 'border-l-4 border-l-amber-500';
    default: return 'border-l-4 border-l-emerald-500';
  }
};

export default function TeknisiTugasPage() {
  const {
    tasks,
    isLoading,
    fetchTasks,
    updateTaskStatus,
    toast,
    setToast,
  } = useTasks();

  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === "Semua" || task.status === activeTab;
    const matchesSearch = task.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Dalam Perjalanan': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Menunggu': return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Selesai': return 'bg-emerald-50 text-emerald-600 border-emerald-200';
      case 'Dibatalkan': return 'bg-red-50 text-red-600 border-red-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'Tinggi') return <AlertCircle size={14} className="text-red-500" />;
    if (priority === 'Sedang') return <AlertCircle size={14} className="text-amber-500" />;
    return <CheckCircle2 size={14} className="text-emerald-500" />;
  };

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-7xl mx-auto">
      {/* HEADER */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-black tracking-tight text-black">
            Daftar Tugas
          </h1>
          <p className="text-sm font-medium text-gray-500">
            Kelola dan pantau seluruh pekerjaan Anda di sini.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Cari ID, Pelanggan, Layanan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-medium outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
            />
          </div>
          <button className="flex items-center justify-center h-10 w-10 shrink-0 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm">
            <Filter size={16} />
          </button>
        </div>
      </section>

      {/* TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab 
                ? "bg-black text-white shadow-md" 
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-black"
            }`}
          >
            {tab}
            {tab === "Semua" && <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">{tasks.length}</span>}
          </button>
        ))}
      </div>

      {/* TASK LIST (CARD GRID FOR RESPONSIVENESS) */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm text-center">
          <Loader2 className="h-10 w-10 animate-spin text-black mb-4" />
          <h3 className="text-sm font-bold text-black">Memuat Daftar Tugas...</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTasks.map((task, i) => (
             <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col ${getPriorityBorderColor(task.priority)}`}
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 border-b border-gray-100 bg-gray-50/20 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-bold tracking-wider text-gray-400 uppercase">
                      ID: #{task.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-gray-300">•</span>
                    <div className={`px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${getStatusColor(task.status)}`}>
                      {task.status === 'Dalam Perjalanan' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                      {task.status}
                    </div>
                  </div>
                  <h3 className="text-base font-black text-black leading-tight group-hover:text-black/85 transition-colors">
                    {formatServiceName(task.serviceName)}
                  </h3>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors shrink-0">
                  <MoreVertical size={16} />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-3 sm:space-y-4 flex-grow">
                <div className="flex items-start gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-600 shrink-0 border border-gray-200 text-xs">
                    {task.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black">{task.customerName}</p>
                    <p className="text-[11px] font-medium text-gray-500">{task.phone}</p>
                  </div>
                </div>

                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-start gap-2 text-xs sm:text-sm">
                    <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="font-medium text-gray-600 leading-snug">{task.address}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Calendar size={15} className="text-gray-400 shrink-0" />
                    <p className="font-medium text-gray-600">{task.date}</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <Clock size={15} className="text-gray-400 shrink-0" />
                    <p className="font-medium text-gray-600">{task.time}</p>
                  </div>
                </div>

                {task.deskripsi && (
                  <div className="p-3 bg-gray-50 rounded-xl border border-black/[0.03] space-y-1 mt-1 sm:mt-2">
                    <span className="text-[8px] font-black uppercase tracking-wider text-gray-400 block">Detail Tugas</span>
                    <p className="text-[11px] font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">{task.deskripsi}</p>
                  </div>
                )}
              </div>

              {/* Card Footer */}
              <div className="p-4 sm:p-5 border-t border-gray-100 flex items-center justify-between bg-white">
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                  {getPriorityIcon(task.priority)}
                  Prioritas {task.priority}
                </div>

                <div className="flex items-center gap-2">
                  <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black transition-colors shadow-sm">
                    <MessageSquare size={14} />
                  </button>
                  {task.status !== 'Selesai' && task.status !== 'Dibatalkan' && (
                    <button
                      onClick={() =>
                        updateTaskStatus(
                          task.id,
                          task.status === 'Menunggu' ? 'Dalam Perjalanan' : 'Selesai'
                        )
                      }
                      className="px-4 py-2 rounded-xl bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
                    >
                      {task.status === 'Menunggu' ? 'Mulai Tugas' : 'Selesaikan'}
                    </button>
                  )}
                  {task.status === 'Selesai' && (
                    <button className="px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-wider cursor-not-allowed">
                      Tugas Selesai
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {filteredTasks.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-sm font-bold text-black mb-1">Tidak Ada Tugas</h3>
              <p className="text-xs font-medium text-gray-500 max-w-sm">
                Tidak ada tugas yang sesuai dengan pencarian atau filter Anda saat ini.
              </p>
            </div>
          )}
        </div>
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