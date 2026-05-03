"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  MoreHorizontal,
  ChevronRight
} from "lucide-react";
import { useUserManagement, UserData } from "@/hooks/useUserManagement";
import { Toast } from "@/components/toast";

export default function SuperAdminUsersPage() {
  const { users, isLoading, toast, hideToast } = useUserManagement();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user => 
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
             <div className="h-10 w-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal Daftar</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="group hover:bg-black/[0.01] transition-all">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-black/5 border border-black/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-lg font-black text-black/20">{user.full_name?.charAt(0) || user.email.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-black">{user.full_name || "Tanpa Nama"}</p>
                          <div className="flex items-center gap-1 text-xs text-[#a1a1a1]">
                            <Mail size={12} />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${
                          user.role_name?.toLowerCase() === 'superadmin' ? 'bg-purple-500' :
                          user.role_name?.toLowerCase() === 'admin' ? 'bg-blue-500' : 'bg-emerald-500'
                        }`} />
                        <span className="text-xs font-bold capitalize text-gray-700">{user.role_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                        <Calendar size={14} />
                        {new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="h-9 w-9 inline-flex items-center justify-center rounded-xl hover:bg-black hover:text-white text-gray-400 transition-all active:scale-90">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center text-gray-400 font-medium italic">
                    {isLoading ? "Memuat data pengguna..." : "Tidak ada pengguna yang ditemukan."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
