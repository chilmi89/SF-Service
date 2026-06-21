"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  MoreHorizontal,
  ChevronRight,
  Trash2
} from "lucide-react";
import { useUserManagement, UserData } from "@/hooks/useUserManagement";
import { Toast } from "@/components/toast";
import { PremiumTableTemplate, Column } from "@/components/PremiumTableTemplate";

export default function SuperAdminUsersPage() {
  const { users, isLoading, toast, hideToast, deleteUser } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);

  const triggerDeleteConfirm = (id: string, name: string) => {
    setDeleteConfirm({ id, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    setIsDeleting(id);
    await deleteUser(id);
    setIsDeleting(null);
  };

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: Column<UserData>[] = [
    {
      key: "user",
      label: "User",
      align: "left",
      render: (user) => {
        const initials = user.full_name?.charAt(0) || user.email.charAt(0) || "U";
        
        // Background color options for avatar based on name letters (like Google Contacts)
        const colors = [
          "bg-rose-100 text-rose-700",
          "bg-blue-100 text-blue-700",
          "bg-amber-100 text-amber-700",
          "bg-purple-100 text-purple-700",
          "bg-emerald-100 text-emerald-700",
          "bg-indigo-100 text-indigo-700"
        ];
        const charCode = user.full_name ? user.full_name.charCodeAt(0) : (user.email ? user.email.charCodeAt(0) : 65);
        const avatarColorClass = colors[charCode % colors.length];

        return (
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 bg-gray-50">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
              ) : (
                <span className={`h-full w-full flex items-center justify-center text-sm font-black ${avatarColorClass}`}>{initials.toUpperCase()}</span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-black leading-tight">
                {user.full_name || "Tanpa Nama"}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400 font-medium mt-1">
                <Mail size={12} className="text-gray-400" />
                {user.email}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: "role",
      label: "Role",
      align: "left",
      render: (user) => (
        <div className="flex items-center gap-2">
          <div className={`h-2 w-2 rounded-full ${
            user.role_name?.toLowerCase() === 'superadmin' ? 'bg-purple-500' :
            user.role_name?.toLowerCase() === 'admin' ? 'bg-blue-500' : 'bg-emerald-500'
          }`} />
          <span className="text-xs font-semibold capitalize text-gray-700">{user.role_name}</span>
        </div>
      )
    },
    {
      key: "created_at",
      label: "Tanggal Daftar",
      align: "left",
      render: (user) => (
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <Calendar size={14} className="text-gray-400" />
          {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      )
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "right",
      render: (user) => (
        <div className="flex items-center justify-end gap-2">
          <button 
            onClick={() => triggerDeleteConfirm(user.id, user.full_name)}
            disabled={isDeleting !== null}
            className={`h-9 w-9 inline-flex items-center justify-center rounded-xl hover:bg-red-50 hover:text-red-600 text-gray-400 transition-all active:scale-90 ${
              isDeleting === user.id ? "animate-pulse text-red-600 bg-red-50" : ""
            }`}
            title="Hapus User"
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-8 md:p-12 space-y-10 max-w-[1600px] mx-auto pb-32">
      <Toast 
        show={!!toast?.show}
        title={toast?.title || ""}
        message={toast?.message || ""}
        type={toast?.type || "success"}
        onClose={hideToast}
      />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Data Pengguna Terdaftar</h1>
          <p className="text-sm font-medium text-[#a1a1a1]">Lihat dan kelola seluruh akun yang terdaftar di dalam sistem FixIt.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100">
          <Users size={18} />
          <span className="text-sm font-bold">{users.length} Total User</span>
        </div>
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1a1]" />
          <input 
            type="text" 
            placeholder="Cari nama, email, atau role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-sm"
          />
        </div>
      </div>

      {/* USER TABLE/LIST */}
      <PremiumTableTemplate
        columns={columns}
        data={filteredUsers}
        isLoading={isLoading}
        rowKey={(user) => user.id}
        emptyStateTitle="Tidak ada pengguna"
        emptyStateDescription={searchTerm ? "Tidak ditemukan hasil pencarian yang cocok." : "Belum ada pengguna yang terdaftar."}
      />

      {/* MODAL DIALOG CONFIRMATION */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal Container */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-gray-150 bg-white p-6 shadow-2xl z-10"
            >
              {/* Modal Header/Icon */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-950">Hapus Akun Pengguna</h3>
                  <p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan</p>
                </div>
              </div>

              {/* Modal Body */}
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus pengguna <span className="font-extrabold text-black">"{deleteConfirm.name}"</span> secara permanen dari sistem? Seluruh data profil dan akses masuk mereka akan dihapus.
              </p>

              {/* Modal Footer/Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="h-10 px-4 rounded-xl border border-gray-200 text-xs font-black text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="h-10 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-black text-white shadow-lg shadow-red-600/10 active:scale-95 transition-all"
                >
                  Hapus Permanen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
