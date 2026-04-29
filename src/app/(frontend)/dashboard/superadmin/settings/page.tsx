"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Save,
  Check,
  Plus,
  ChevronDown,
  X,
  Lock,
  Pencil,
  Trash2,
  Search,
  Settings2,
  AlertTriangle
} from "lucide-react";
import { Toast, ToastType } from "@/components/toast";

import { useDashboard } from "@/app/hooks";
import { Role, Permission } from "@/app/types/dashboard";

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Data States for Modals
  const [newPermName, setNewPermName] = useState("");
  const [targetRoleIds, setTargetRoleIds] = useState<string[]>([]);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [editPermName, setEditPermName] = useState("");
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast State
  const [toast, setToast] = useState({
    show: false,
    type: 'success' as ToastType,
    title: '',
    message: ''
  });

  const { 
    roles: rolesHook, 
    permissions: permissionsHook, 
    updatePermissions, 
    addPermission, 
    updatePermission, 
    deletePermission 
  } = useDashboard();

  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({ show: true, type, title, message });
  };

  useEffect(() => {
    const savedRole = localStorage.getItem("selected_role_management");
    if (savedRole) {
      setSelectedRole(savedRole);
    }
  }, []);

  const handleRoleChange = (roleName: string) => {
    setSelectedRole(roleName);
    localStorage.setItem("selected_role_management", roleName);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    rolesHook.execute();
  }, [rolesHook.execute]);

  useEffect(() => {
    const rolesData = (rolesHook.data as any) || [];
    if (rolesData.length > 0 && !selectedRole && !localStorage.getItem("selected_role_management")) {
      handleRoleChange(rolesData[0].name);
    }
  }, [rolesHook.data, selectedRole]);

  useEffect(() => {
    if (!selectedRole || !rolesHook.data) return;
    const currentRole = (rolesHook.data as any[]).find((r: Role) => r.name.toLowerCase() === selectedRole.toLowerCase());
    if (currentRole) {
      permissionsHook.execute(currentRole.id);
    }
  }, [selectedRole, rolesHook.data, permissionsHook.execute]);

  const togglePermission = (id: string) => {
    if (!permissionsHook.data) return;
    const updated = (permissionsHook.data as any[]).map((p: Permission) => 
      p.id === id ? { ...p, assigned: !p.assigned } : p
    );
    permissionsHook.setData(updated);
  };

  const handleSave = async () => {
    const currentRole = (rolesHook.data as any[])?.find((r: Role) => r.name.toLowerCase() === selectedRole.toLowerCase());
    if (!currentRole || !permissionsHook.data) return;

    setIsSubmitting(true);
    try {
      const payload = (permissionsHook.data as any[]).map((p: Permission) => ({
        id: p.id,
        assigned: p.assigned
      }));

      const { error } = await updatePermissions(currentRole.id, payload);

      if (!error) {
        showToast('success', 'Berhasil Disimpan', `Perubahan hak akses untuk ${selectedRole} telah diperbarui.`);
      } else {
        showToast('error', 'Gagal Menyimpan', error);
      }
    } catch (error) {
      showToast('error', 'Kesalahan Koneksi', 'Tidak dapat terhubung ke server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddPermission = async () => {
    if (!newPermName || targetRoleIds.length === 0) {
      showToast('warning', 'Input Tidak Lengkap', 'Harap isi nama permission dan pilih minimal satu role.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await addPermission(newPermName, targetRoleIds);

      if (!error) {
        showToast('success', 'Berhasil Ditambahkan', 'Permission baru berhasil didaftarkan ke sistem.');
        setIsAddModalOpen(false);
        setNewPermName("");
        setTargetRoleIds([]);
        permissionsHook.execute(); // Refresh
      } else {
        showToast('error', 'Gagal', error);
      }
    } catch (error) {
      showToast('error', 'Kesalahan', 'Terjadi gangguan koneksi saat menambah data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePermission = async () => {
    if (!editPermName || !editingPermission) return;

    setIsSubmitting(true);
    try {
      const { error } = await updatePermission(editingPermission.id, editPermName);

      if (!error) {
        showToast('success', 'Berhasil Diperbarui', 'Nama permission telah berhasil diubah.');
        setIsEditModalOpen(false);
        setEditingPermission(null);
        setEditPermName("");
        permissionsHook.execute();
      } else {
        showToast('error', 'Gagal Perbarui', error);
      }
    } catch (error) {
      showToast('error', 'Kesalahan', 'Terjadi gangguan koneksi saat memperbarui data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePermission = async () => {
    if (!permissionToDelete) return;

    setIsSubmitting(true);
    try {
      const { error } = await deletePermission(permissionToDelete.id);

      if (!error) {
        showToast('success', 'Berhasil Dihapus', 'Permission telah dihapus dari sistem.');
        setIsDeleteModalOpen(false);
        setPermissionToDelete(null);
        permissionsHook.execute();
      } else {
        showToast('error', 'Gagal Menghapus', error);
      }
    } catch (error) {
      showToast('error', 'Kesalahan', 'Terjadi gangguan koneksi saat menghapus data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (perm: Permission) => {
    setEditingPermission(perm);
    setEditPermName(perm.name);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (perm: Permission) => {
    setPermissionToDelete(perm);
    setIsDeleteModalOpen(true);
  };

  const toggleRoleSelection = (roleId: string) => {
    setTargetRoleIds(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const roles = (rolesHook.data as any[]) || [];
  const permissions = (permissionsHook.data as any[]) || [];
  const isLoading = rolesHook.isLoading || permissionsHook.isLoading;

  return (
    <div className="p-8 md:p-12 space-y-10 max-w-[1600px] mx-auto pb-32">
      
      {/* TOAST NOTIFICATION */}
      <Toast 
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Manajemen Hak Akses</h1>
          <p className="text-sm font-medium text-[#a1a1a1]">Konfigurasi dan atur tingkat izin akses untuk setiap peran pengguna secara dinamis.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex w-full items-center justify-between h-12 px-6 rounded-xl border border-gray-300 bg-white text-sm font-bold shadow-sm transition-all hover:border-black active:scale-[0.98]"
          >
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-black" />
              <span className="capitalize">{selectedRole || "Pilih Role"}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {isDropdownOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full right-0 mt-2 w-64 p-2 rounded-2xl border border-gray-200 bg-white shadow-2xl z-50 overflow-hidden"
            >
              <div className="max-h-60 overflow-y-auto space-y-1">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(role.name)}
                    className={`flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all capitalize ${
                      selectedRole.toLowerCase() === role.name.toLowerCase()
                        ? "bg-black text-white shadow-lg" 
                        : "text-[#666] hover:bg-black/[0.03] hover:text-black"
                    }`}
                  >
                    <div className={`h-2 w-2 rounded-full ${selectedRole.toLowerCase() === role.name.toLowerCase() ? "bg-white" : "bg-transparent"}`} />
                    {role.name}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* SEARCH AREA */}
      <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#a1a1a1]" />
             <input 
               type="text" 
               placeholder="Cari nama izin atau deskripsi..."
               className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
             />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex h-11 items-center gap-2 rounded-xl bg-black px-6 text-sm font-bold text-white shadow-xl transition-all hover:bg-black/90 active:scale-95"
          >
            <Plus size={18} />
            Tambah Permission
          </button>
      </div>

      {/* PERMISSIONS TABLE */}
      <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
             <div className="h-10 w-10 border-4 border-black/10 border-t-black rounded-full animate-spin" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-4 text-sm font-medium text-gray-500">Nama Izin</th>
                <th className="px-8 py-4 text-sm font-medium text-gray-500">Deskripsi</th>
                <th className="px-8 py-4 text-sm font-medium text-gray-500">Status</th>
                <th className="px-8 py-4 text-sm font-medium text-gray-500 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {permissions.length > 0 ? (
                permissions.map((perm) => (
                  <tr key={perm.id} className="group hover:bg-black/[0.01] transition-colors">
                    <td className="px-8 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-medium transition-colors whitespace-nowrap ${perm.assigned ? "text-black" : "text-gray-300"}`}>{perm.label}</span>
                        <code className={`text-[10px] font-mono px-2 py-0.5 rounded ${perm.assigned ? "bg-black/5 text-[#a1a1a1]" : "bg-gray-50 text-gray-200"}`}>{perm.name}</code>
                      </div>
                    </td>
                    <td className="px-8 py-3.5">
                      <p className={`text-sm font-small max-w-md text-theme-sm transition-colors ${perm.assigned ? "text-gray-600" : "text-gray-300"}`}>{perm.desc}</p>
                    </td>
                    <td className="px-8 py-3.5">
                       <button 
                         onClick={() => togglePermission(perm.id)}
                         className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-medium transition-all ${
                            perm.assigned 
                              ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                              : "bg-gray-50 text-gray-400 border border-gray-100 opacity-50"
                         }`}
                       >
                         <div className={`h-1.5 w-1.5 rounded-full ${perm.assigned ? "bg-emerald-500 animate-pulse" : "bg-gray-300"}`} />
                         {perm.assigned ? "Aktif" : "Non-aktif"}
                       </button>
                    </td>
                    <td className="px-8 py-3.5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => openEditModal(perm)}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-black hover:text-white transition-all"
                          >
                             <Pencil size={16} />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(perm)}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <Shield size={40} className="text-gray-200" />
                       <p className="text-sm font-bold text-gray-400">Tidak ada data izin untuk role {selectedRole}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER ACTION */}
      <div className="flex justify-end pt-12 border-t border-gray-200">
        <button 
          onClick={handleSave}
          disabled={isLoading || permissions.length === 0}
          className="flex items-center gap-3 rounded-2xl bg-black px-10 py-4 text-sm font-bold text-white shadow-2xl hover:bg-black/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={20} />
          )}
          Simpan Perubahan
        </button>
      </div>

      {/* MODAL TAMBAH PERMISSION */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-white">
                      <Lock size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Tambah Izin Baru</h3>
                      <p className="text-xs font-medium text-[#a1a1a1]">Definisikan akses sistem baru</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#a1a1a1] ml-2">Nama Teknis Permission</label>
                    <input 
                      type="text" 
                      value={newPermName}
                      onChange={(e) => setNewPermName(e.target.value)}
                      placeholder="Contoh: download_laporan"
                      className="w-full h-14 px-6 rounded-2xl border border-gray-200 bg-gray-50/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-bold text-[#a1a1a1] ml-2">Berikan Ke Role (Multi-select)</label>
                    <div className="grid grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                      {roles.map((role) => (
                        <button
                          key={role.id}
                          onClick={() => toggleRoleSelection(role.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                            targetRoleIds.includes(role.id)
                              ? "border-black bg-black text-white shadow-lg"
                              : "border-gray-200 bg-white text-gray-500 hover:border-gray-400"
                          }`}
                        >
                          <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${
                             targetRoleIds.includes(role.id) ? "border-white bg-white" : "border-gray-300"
                          }`}>
                            {targetRoleIds.includes(role.id) && <Check size={10} className="text-black" strokeWidth={4} />}
                          </div>
                          <span className="text-xs font-bold capitalize">{role.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 h-14 rounded-2xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleAddPermission}
                    disabled={isSubmitting || !newPermName || targetRoleIds.length === 0}
                    className="flex-[2] h-14 rounded-2xl bg-black text-white text-sm font-bold shadow-xl hover:bg-black/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Plus size={18} />
                        Simpan Permission
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL EDIT PERMISSION */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsEditModalOpen(false);
                setEditingPermission(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-black flex items-center justify-center text-white">
                      <Settings2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Edit Permission</h3>
                      <p className="text-xs font-medium text-[#a1a1a1]">Ubah identitas teknis izin ini</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="h-10 w-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#a1a1a1] ml-2">Permission Saat Ini</label>
                    <div className="w-full h-14 px-6 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center">
                      <p className="text-sm font-bold text-gray-500">{editingPermission?.label}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#a1a1a1] ml-2">Nama Teknis Baru</label>
                    <input 
                      type="text" 
                      value={editPermName}
                      onChange={(e) => setEditPermName(e.target.value)}
                      placeholder="Contoh: download_laporan_v2"
                      className="w-full h-14 px-6 rounded-2xl border border-gray-200 bg-gray-50/30 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 h-14 rounded-2xl border border-gray-200 text-sm font-bold hover:bg-gray-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleUpdatePermission}
                    disabled={isSubmitting || !editPermName}
                    className="flex-[2] h-14 rounded-2xl bg-black text-white text-sm font-bold shadow-xl hover:bg-black/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Save size={18} />
                        Simpan Perubahan
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-8 text-center space-y-6">
                {/* Warning Icon */}
                <div className="mx-auto h-20 w-20 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                  <AlertTriangle size={40} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900">Hapus Permission?</h3>
                  <p className="text-sm font-medium text-gray-500 leading-relaxed px-4">
                    Apakah Anda yakin ingin menghapus permission <span className="font-bold text-black">"{permissionToDelete?.label}"</span>? Tindakan ini bersifat permanen.
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 h-10 rounded-xl border border-gray-200 text-sm font-bold shadow-sm hover:bg-gray-50 transition-all"
                  >
                    Batal
                  </button>
                  <button 
                    onClick={handleDeletePermission}
                    disabled={isSubmitting}
                    className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-bold shadow-xl shadow-red-100 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Trash2 size={18} />
                        Ya, Hapus
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
