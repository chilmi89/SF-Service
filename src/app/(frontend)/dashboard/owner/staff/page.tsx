"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Trash2, Mail, Phone, Search, Loader2, ShieldAlert, Copy, Check, AlertCircle } from "lucide-react";
import Image from "next/image";
import { tenantService } from "@/lib/api/(tenant)/tenant.service";
import { authService } from "@/lib/api/auth.service";
import { apiClient } from "@/lib/api/api-client";
import { Toast } from "@/components/toast";
import { PremiumTableTemplate, Column } from "@/components/PremiumTableTemplate";

export default function ManageStaffPage() {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // State Modal Tambah
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState<"admin tenant" | "teknisi">("teknisi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Modal Hapus (Mocked UI)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // State Toast
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  }>({ show: false, title: "", message: "", type: "success" });

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      
      // 1. Fetch staff list
      const response = await tenantService.getStaff();
      const allStaff = response?.data?.data || response?.data || [];
      setStaffList(allStaff);

      // 2. Fetch tenant profile info to get tenant code
      const profileId = localStorage.getItem("profile_id");
      if (profileId) {
        const profileResponse = await authService.getProfile(profileId);
        const userProfile = profileResponse?.data?.data || profileResponse?.data;

        if (userProfile?.tenant_name) {
          const allTenantsResponse = await tenantService.getAllTenants();
          const allTenants = allTenantsResponse?.data?.data || allTenantsResponse?.data || [];
          const myTenant = allTenants.find((t: any) => t.name === userProfile.tenant_name);
          if (myTenant) {
            setTenantInfo(myTenant);
          }
        }
      }
    } catch (error: any) {
      console.error("Gagal memuat daftar staf:", error);
      showToast("Gagal", "Tidak dapat memuat daftar staf.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const showToast = (title: string, message: string, type: "success" | "error" | "warning") => {
    setToast({ show: true, title, message, type });
  };

  const handleCopyCode = () => {
    if (tenantInfo?.kode_tenant) {
      navigator.clipboard.writeText(tenantInfo.kode_tenant);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      showToast("Peringatan", "Silakan masukkan email terlebih dahulu.", "warning");
      return;
    }
    try {
      setIsSubmitting(true);
      const res = await tenantService.addStaff(emailInput, roleInput);
      if (res.error) {
        showToast(
          "Gagal",
          res.error || "Gagal menambahkan staf. Pastikan email terdaftar di FixIt dan belum bergabung di tenant lain.",
          "error"
        );
        return;
      }

      showToast("Berhasil", `Staf dengan email ${emailInput} berhasil ditambahkan sebagai ${roleInput === "admin tenant" ? "Admin Tenant" : "Teknisi"}.`, "success");
      setEmailInput("");
      setShowAddModal(false);
      
      // Refresh list
      await fetchStaff();

      // Trigger a page reload to force role upgrade middleware to execute and update cookie
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Gagal menambahkan staf (Unexpected):", error);
      showToast(
        "Gagal",
        "Terjadi kesalahan koneksi atau kesalahan sistem. Silakan coba lagi.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Handler dengan API
  const handleDeleteStaff = async () => {
    if (!selectedStaff) return;
    try {
      setIsDeleting(true);
      
      // Panggil API DELETE staf sesungguhnya secara inline
      const res = await apiClient(`/api/tenants/staff/${selectedStaff.id}`, {
        method: 'DELETE',
      });

      if (res.error) {
        showToast("Gagal", res.error || "Terjadi kesalahan saat menghapus staf.", "error");
        return;
      }
      
      // Hapus dari state visual
      setStaffList(prev => prev.filter(item => item.id !== selectedStaff.id));
      
      showToast("Berhasil", `Staf ${selectedStaff.full_name || selectedStaff.email} berhasil dihapus dari tenant.`, "success");
      setShowDeleteModal(false);
      setSelectedStaff(null);
    } catch (error: any) {
      console.error("Gagal menghapus staf (Unexpected):", error);
      showToast("Gagal", "Terjadi kesalahan koneksi atau kesalahan sistem. Silakan coba lagi.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter list berdasarkan kolom pencarian
  const filteredStaff = staffList.filter(
    (staff) =>
      staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hitung jumlah tipe staf
  const totalTechnicians = staffList.filter(s => s.role === "teknisi").length;
  const totalAdmins = staffList.filter(s => s.role === "admin tenant" || s.role === "admin").length;

  const columns: Column<any>[] = [
    {
      key: "identitas",
      label: "Identitas Staf",
      align: "left",
      render: (staff: any) => {
        const name = staff.full_name || "Nama Belum Diatur";
        const initials = name
          ? name.trim().split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
          : "S";
        const colors = [
          "bg-rose-100 text-rose-700",
          "bg-blue-100 text-blue-700",
          "bg-amber-100 text-amber-700",
          "bg-purple-100 text-purple-700",
          "bg-emerald-100 text-emerald-700",
          "bg-indigo-100 text-indigo-700"
        ];
        const charCode = name ? name.charCodeAt(0) : 65;
        const avatarColorClass = colors[charCode % colors.length];

        return (
          <div className="flex items-center gap-3">
            {staff.avatar_url ? (
              <div className="h-10 w-10 rounded-full overflow-hidden bg-black/5 flex-shrink-0 relative border border-gray-100">
                <Image
                  src={staff.avatar_url}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${avatarColorClass}`}>
                {initials}
              </div>
            )}
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-black leading-tight">
                {name}
              </span>
              <span className={`w-fit mt-1 text-[10px] font-medium uppercase px-2 py-0.5 rounded-full ${
                staff.role === "teknisi"
                  ? "bg-amber-50 text-amber-600 border border-amber-100"
                  : "bg-purple-50 text-purple-600 border border-purple-100"
              }`}>
                {staff.role === "admin tenant" ? "Admin" : staff.role}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      key: "kontak",
      label: "Kontak",
      align: "left",
      render: (staff: any) => (
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Mail size={12} className="text-gray-400" />
            {staff.email || "-"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Phone size={12} className="text-gray-400" />
            {staff.phone || "-"}
          </div>
        </div>
      )
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      render: () => (
        <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full text-[11px] font-medium">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Aktif
        </span>
      )
    },
    {
      key: "aksi",
      label: "Aksi",
      align: "right",
      render: (staff: any) => (
        <button
          onClick={() => {
            setSelectedStaff(staff);
            setShowDeleteModal(true);
          }}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
          title="Hapus Staf"
        >
          <Trash2 size={16} />
        </button>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col pt-8 pb-10 px-4 sm:px-8 md:px-12 w-full text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-2xl font-bold text-black tracking-tight">Kelola Staff</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Daftar staf admin dan teknisi yang terasosiasi dengan tenant Anda.</p>
        </div>
        <div className="flex flex-row items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          {tenantInfo?.kode_tenant && (
            <div className="flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 bg-gray-50 border border-gray-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-[9px] sm:text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Kode Tenant:</span>
                <code className="text-[11px] sm:text-xs font-bold text-black">{tenantInfo.kode_tenant}</code>
              </div>
              <button 
                onClick={handleCopyCode} 
                className="text-gray-400 hover:text-black transition-colors ml-0.5 sm:ml-1"
                title="Salin Kode"
              >
                {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              </button>
            </div>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center justify-center gap-1.5 sm:gap-2 bg-black text-white hover:bg-gray-800 font-bold text-[11px] sm:text-[13px] px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-lg shadow-black/10 active:scale-95"
          >
            <UserPlus size={14} className="sm:w-4 sm:h-4" />
            Tambah Staff
          </button>
        </div>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-6 mb-8 w-full max-w-3xl">
        <div className="p-2.5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-400 truncate">Total Staff</p>
            <p className="text-xl font-bold text-black mt-0.5 sm:mt-1">{staffList.length}</p>
          </div>
        </div>
        <div className="p-2.5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-400 truncate">Teknisi</p>
            <p className="text-xl font-bold text-black mt-0.5 sm:mt-1">{totalTechnicians}</p>
          </div>
        </div>
        <div className="p-2.5 sm:p-6 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
            <Users className="h-4 w-4 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-400 truncate">Admin</p>
            <p className="text-xl font-bold text-black mt-0.5 sm:mt-1">{totalAdmins}</p>
          </div>
        </div>
      </div>

      {/* Search & Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="p-5 border-b border-gray-100 flex items-center bg-gray-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Cari nama atau email staf..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-gray-200 text-black text-xs font-medium rounded-xl pl-10 pr-4 py-2.5 outline-none focus:border-black transition-colors"
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-h-[300px]">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <Loader2 className="animate-spin text-black" size={32} />
              <p className="mt-3 text-sm font-bold text-gray-400">Memuat data staf...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center py-20 px-4 text-center">
              <Users size={48} className="text-gray-300 mb-3" />
              <h3 className="text-base font-bold text-black">Tidak Ada Staf</h3>
              <p className="text-xs text-gray-500 max-w-xs mt-1">
                {searchTerm ? "Tidak ditemukan hasil pencarian yang cocok." : "Belum ada staf yang bergabung di tenant Anda."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <PremiumTableTemplate
                  columns={columns}
                  data={filteredStaff}
                  isLoading={false}
                  rowKey={(staff) => staff.id}
                  hideWrapper={true}
                />
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden divide-y divide-gray-100">
                {filteredStaff.map((staff) => {
                  const name = staff.full_name || "Nama Belum Diatur";
                  const initials = name
                    ? name.trim().split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
                    : "S";
                  const colors = [
                    "bg-rose-100 text-rose-700",
                    "bg-blue-100 text-blue-700",
                    "bg-amber-100 text-amber-700",
                    "bg-purple-100 text-purple-700",
                    "bg-emerald-100 text-emerald-700",
                    "bg-indigo-100 text-indigo-700"
                  ];
                  const charCode = name ? name.charCodeAt(0) : 65;
                  const avatarColorClass = colors[charCode % colors.length];

                  return (
                    <div key={staff.id} className="p-4 flex flex-col gap-4 hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {staff.avatar_url ? (
                            <div className="h-10 w-10 rounded-full overflow-hidden bg-black/5 flex-shrink-0 relative border border-gray-100">
                              <Image
                                src={staff.avatar_url}
                                alt={name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${avatarColorClass}`}>
                              {initials}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-black">{name}</p>
                            <span className={`inline-block mt-0.5 text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              staff.role === "teknisi"
                                ? "bg-amber-50 text-amber-600 border border-amber-100"
                                : "bg-purple-50 text-purple-600 border border-purple-100"
                            }`}>
                              {staff.role === "admin tenant" ? "Admin" : staff.role}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                            <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse"></span>
                            Aktif
                          </span>
                          <button
                            onClick={() => {
                              setSelectedStaff(staff);
                              setShowDeleteModal(true);
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            title="Hapus Staf"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-gray-50/50 p-2.5 rounded-xl text-xs text-gray-500 font-semibold">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Mail size={12} className="shrink-0 text-gray-400" />
                          <span className="truncate" title={staff.email}>{staff.email || "-"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Phone size={12} className="shrink-0 text-gray-400" />
                          <span className="truncate" title={staff.phone}>{staff.phone || "-"}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Tambah Staf */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-black"></div>
              <h3 className="text-xl font-black text-black mb-1">Undang Staf Baru</h3>
              <p className="text-xs text-gray-400 font-medium mb-6">
                Undang staf bergabung ke tenant Anda dengan mendaftarkan email akun mereka.
              </p>

              <form onSubmit={handleAddStaff} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Email Staf</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="email"
                      required
                      placeholder="contoh: staf@gmail.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-white border border-gray-200 text-black text-sm font-semibold rounded-xl pl-10 pr-4 py-3 outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700">Role Pekerjaan</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRoleInput("teknisi")}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        roleInput === "teknisi"
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      Teknisi
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoleInput("admin tenant")}
                      className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                        roleInput === "admin tenant"
                          ? "border-black bg-black text-white"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      Admin Tenant
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold mt-2 leading-relaxed">
                    *Catatan: Pengguna harus sudah terdaftar di sistem FixIt sebelum dapat ditambahkan ke tenant Anda.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailInput("");
                      setShowAddModal(false);
                    }}
                    disabled={isSubmitting}
                    className="px-5 py-2.5 text-xs font-bold text-gray-500 hover:text-black transition-colors rounded-xl disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 flex items-center gap-2 font-bold text-xs bg-black text-white rounded-xl shadow-lg hover:bg-gray-800 transition-all disabled:opacity-75"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Tambah Sekarang"
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Hapus */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500"></div>
              <h3 className="text-xl font-black text-black mb-3">Hapus Staf dari Tenant</h3>
              <p className="text-sm font-medium text-gray-600 mb-6 leading-relaxed">
                Apakah Anda yakin ingin menghapus <span className="font-bold text-black px-1.5 py-0.5 bg-gray-100 rounded">"{selectedStaff?.full_name || selectedStaff?.email}"</span> dari daftar staf Anda?
                <br /><br />                <span className="text-red-600 font-medium block bg-red-50 p-3 rounded-xl border border-red-100 mt-1 text-xs">
                  Staf ini akan dikeluarkan dari organisasi Anda dan perannya akan otomatis kembali menjadi <strong>user biasa</strong>.
                </span>
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedStaff(null);
                  }}
                  disabled={isDeleting}
                  className="px-5 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteStaff}
                  disabled={isDeleting}
                  className="px-5 py-2.5 flex items-center gap-2 font-bold text-xs text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-lg disabled:opacity-75"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Menghapus...
                    </>
                  ) : (
                    "Ya, Hapus"
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Toast
        show={toast.show}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
