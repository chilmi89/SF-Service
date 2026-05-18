"use client";

import { useState } from "react";
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
  MoreVertical
} from "lucide-react";

// Mock Data
const allTasks = [
  { id: "ORD-9921", customer: "Budi Santoso", service: "Service AC Split", address: "Jl. Sudirman No. 12, Jakarta", status: "Dalam Perjalanan", time: "10:00 WIB", date: "Hari Ini", priority: "Tinggi", phone: "0812-3456-7890" },
  { id: "ORD-9922", customer: "Siska Amelia", service: "Perbaikan Pipa Bocor", address: "Komp. Mawar Blok B4, Jakarta", status: "Menunggu", time: "13:30 WIB", date: "Hari Ini", priority: "Sedang", phone: "0812-9876-5432" },
  { id: "ORD-9923", customer: "Anwar Jaya", service: "Instalasi Listrik", address: "Jl. Melati No. 8, Jakarta", status: "Menunggu", time: "15:00 WIB", date: "Hari Ini", priority: "Normal", phone: "0855-1234-5678" },
  { id: "ORD-9920", customer: "Dewi Lestari", service: "Cuci AC (2 Unit)", address: "Apartemen Sudirman Park, Tower A", status: "Selesai", time: "09:00 WIB", date: "Kemarin", priority: "Normal", phone: "0822-3344-5566" },
  { id: "ORD-9919", customer: "Rizky Firmansyah", service: "Pemasangan Tandon", address: "Jl. Kebon Kacang No. 45", status: "Dibatalkan", time: "14:00 WIB", date: "Kemarin", priority: "Rendah", phone: "0811-2233-4455" },
  { id: "ORD-9924", customer: "Hendra Wijaya", service: "Service Kulkas", address: "Komp. Permata Hijau", status: "Menunggu", time: "10:00 WIB", date: "Besok", priority: "Tinggi", phone: "0899-8877-6655" },
];

const tabs = ["Semua", "Menunggu", "Dalam Perjalanan", "Selesai", "Dibatalkan"];

export default function TeknisiTugasPage() {
  const [activeTab, setActiveTab] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTasks = allTasks.filter(task => {
    const matchesTab = activeTab === "Semua" || task.status === activeTab;
    const matchesSearch = task.customer.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          task.service.toLowerCase().includes(searchQuery.toLowerCase());
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
            {tab === "Semua" && <span className="ml-2 px-1.5 py-0.5 rounded-md bg-white/20 text-[10px]">{allTasks.length}</span>}
          </button>
        ))}
      </div>

      {/* TASK LIST (CARD GRID FOR RESPONSIVENESS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTasks.map((task, i) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all group flex flex-col"
          >
            {/* Card Header */}
            <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-black tracking-widest text-gray-400 uppercase">{task.id}</span>
                  <div className={`px-2 py-0.5 border rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 ${getStatusColor(task.status)}`}>
                    {task.status === 'Dalam Perjalanan' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />}
                    {task.status}
                  </div>
                </div>
                <h3 className="text-lg font-black text-black leading-tight group-hover:text-blue-600 transition-colors">{task.service}</h3>
              </div>
              <button className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>

            {/* Card Body */}
            <div className="p-5 space-y-4 flex-grow">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-600 shrink-0 border border-gray-200">
                  {task.customer.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-black">{task.customer}</p>
                  <p className="text-xs font-medium text-gray-500">{task.phone}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2 text-sm">
                  <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                  <p className="font-medium text-gray-600 leading-snug">{task.address}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-gray-400 shrink-0" />
                  <p className="font-medium text-gray-600">{task.date}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-gray-400 shrink-0" />
                  <p className="font-medium text-gray-600">{task.time}</p>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="p-5 border-t border-gray-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                {getPriorityIcon(task.priority)}
                Prioritas {task.priority}
              </div>

              <div className="flex items-center gap-2">
                <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black transition-colors shadow-sm">
                  <MessageSquare size={14} />
                </button>
                {task.status !== 'Selesai' && task.status !== 'Dibatalkan' && (
                  <button className="px-4 py-2 rounded-xl bg-black text-white text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-800 transition-all active:scale-95 shadow-sm">
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
    </div>
  );
}