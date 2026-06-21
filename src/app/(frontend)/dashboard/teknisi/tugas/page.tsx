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
import { useTasks, TaskUI } from "@/hooks/useTasks";
import { Toast } from "@/components/toast";
import { PremiumTableTemplate, Column } from "@/components/PremiumTableTemplate";

const tabs = ["Semua", "Menunggu", "Perjalanan", "Proses", "Selesai", "Dibatalkan"];

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
      case 'Perjalanan': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'Proses': return 'bg-indigo-50 text-indigo-600 border-indigo-200';
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

  const columns: Column<TaskUI>[] = [
    {
      key: "id",
      label: "ID",
      align: "left",
      render: (task) => (
        <span className="font-medium text-xs text-gray-950">
          #{task.id.slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Customer",
      align: "left",
      render: (task) => {
        const initials = task.customerName
          ? task.customerName.trim().split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
          : "P";
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
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${avatarColorClass}`}>
              {initials}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-medium">
                {task.customerName}
              </span>
              <span className="text-[10px] text-gray-400 font-semibold leading-normal">
                {task.phone}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "serviceName",
      label: "Product/Service",
      align: "left",
      render: (task) => (
        <div className="flex flex-col text-left">
          <span className="text-xs font-medium text-gray-900">
            {formatServiceName(task.serviceName)}
          </span>
          {task.deskripsi && (
            <span className="text-[10px] font-medium text-gray-400 italic mt-0.5 truncate max-w-[200px]" title={task.deskripsi}>
              "{task.deskripsi}"
            </span>
          )}
        </div>
      ),
    },
    {
      key: "address",
      label: "Location",
      align: "left",
      render: (task) => (
        <span className="text-xs font-medium text-gray-600 max-w-[180px] truncate block" title={task.address}>
          {task.address}
        </span>
      ),
    },
    {
      key: "schedule",
      label: "Schedule",
      align: "left",
      render: (task) => (
        <div className="flex flex-col text-left text-xs font-semibold text-gray-500">
          <span>{task.date}</span>
          <span className="text-[10px] text-gray-400 font-medium">{task.time}</span>
        </div>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      align: "left",
      render: (task) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
          {getPriorityIcon(task.priority)}
          {task.priority}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      align: "left",
      render: (task) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-medium border ${getStatusColor(task.status)}`}>
          {task.status}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      align: "center",
      render: (task) => (
        <div className="flex gap-2 justify-center items-center">
          <button className="h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-black transition-colors shadow-sm shrink-0">
            <MessageSquare size={13} />
          </button>
          {task.status !== 'Selesai' && task.status !== 'Dibatalkan' ? (
            <button
              onClick={() => {
                let nextStatus: any = "Selesai";
                if (task.status === "Menunggu") nextStatus = "Perjalanan";
                else if (task.status === "Perjalanan") nextStatus = "Proses";
                updateTaskStatus(task.id, nextStatus);
              }}
              className="px-3 py-1.5 rounded-lg bg-black text-white text-[12px] font-medium hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
            >
              {task.status === 'Menunggu' ? 'Mulai' : 
               task.status === 'Perjalanan' ? 'Perbaikan' : 'Selesaikan'}
            </button>
          ) : (
            <span className="text-[12px] font-medium text-gray-400">
              {task.status === 'Selesai' ? 'Selesai' : 'Batal'}
            </span>
          )}
        </div>
      ),
    },
  ];

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
      <PremiumTableTemplate<TaskUI>
        columns={columns}
        data={filteredTasks}
        isLoading={isLoading}
        rowKey={(task) => task.id}
        emptyStateTitle="Tidak Ada Tugas"
        emptyStateDescription="Tidak ada tugas yang sesuai dengan pencarian atau filter Anda saat ini."
      />

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