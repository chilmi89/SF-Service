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

      {/* TASK LIST TABLE */}
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-pulse">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Product/Service</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Schedule</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[1, 2, 3].map((n) => (
                  <tr key={n}>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                        <div className="space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-28"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="py-4 px-6"><div className="h-5 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-5 bg-gray-200 rounded-full w-16"></div></td>
                    <td className="py-4 px-6"><div className="h-8 bg-gray-200 rounded-xl w-24 mx-auto"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-sm font-bold text-black mb-1">Tidak Ada Tugas</h3>
          <p className="text-xs font-medium text-gray-500 max-w-sm">
            Tidak ada tugas yang sesuai dengan pencarian atau filter Anda saat ini.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-[10px] font-black uppercase tracking-wider text-gray-400">
                  <th className="py-4 px-6">ID</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Product/Service</th>
                  <th className="py-4 px-6">Location</th>
                  <th className="py-4 px-6">Schedule</th>
                  <th className="py-4 px-6">Priority</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredTasks.map((task) => {
                  const initials = task.customerName
                    ? task.customerName.trim().split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
                    : "P";

                  // Background color options for avatar based on name letters (like Google Contacts)
                  const colors = [
                    "bg-rose-100 text-rose-700",
                    "bg-blue-100 text-blue-700",
                    "bg-amber-100 text-amber-700",
                    "bg-purple-100 text-purple-700",
                    "bg-emerald-100 text-emerald-700",
                    "bg-indigo-100 text-indigo-700"
                  ];
                  const charCode = task.customerName ? task.customerName.charCodeAt(0) : 65;
                  const avatarColorClass = colors[charCode % colors.length];

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-4 px-6 font-bold text-xs text-gray-950">
                        #{task.id.slice(0, 8).toUpperCase()}
                      </td>

                      {/* Customer */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${avatarColorClass}`}>
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-black leading-tight">
                              {task.customerName}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold leading-normal">
                              {task.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Product/Service */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-gray-900">
                            {formatServiceName(task.serviceName)}
                          </span>
                          {task.deskripsi && (
                            <span className="text-[10px] font-medium text-gray-400 italic mt-0.5 truncate max-w-[200px]" title={task.deskripsi}>
                              "{task.deskripsi}"
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-4 px-6 text-xs font-medium text-gray-600 max-w-[180px] truncate" title={task.address}>
                        {task.address}
                      </td>

                      {/* Schedule */}
                      <td className="py-4 px-6 text-xs font-semibold text-gray-500">
                        <div className="flex flex-col">
                          <span>{task.date}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{task.time}</span>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          {getPriorityIcon(task.priority)}
                          {task.priority}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase border tracking-wider ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6">
                        <div className="flex gap-2 justify-center items-center">
                          <button className="h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black transition-colors shadow-sm shrink-0">
                            <MessageSquare size={13} />
                          </button>
                          {task.status !== 'Selesai' && task.status !== 'Dibatalkan' ? (
                            <button
                              onClick={() =>
                                updateTaskStatus(
                                  task.id,
                                  task.status === 'Menunggu' ? 'Dalam Perjalanan' : 'Selesai'
                                )
                              }
                              className="px-3 py-1.5 rounded-lg bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
                            >
                              {task.status === 'Menunggu' ? 'Mulai' : 'Selesaikan'}
                            </button>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {task.status === 'Selesai' ? 'Selesai' : 'Batal'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
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