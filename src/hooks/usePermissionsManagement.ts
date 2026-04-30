"use client";

import { useState, useEffect, useCallback } from "react";
import { superAdminService } from "@/lib/api/(superadmin)/super-admin.service";
import { ToastType } from "@/components/toast";

// Constants
const STORAGE_KEY_ROLE = "selected_role_management";

// Types
export interface Role {
  id: string;
  name: string;
}

export interface Permission {
  id: string;
  name: string;
  label: string;
  desc: string;
  assigned: boolean;
}

/**
 * Utility to format raw permission data into UI-ready objects
 */
const formatPermission = (p: any): Permission => ({
  ...p,
  label: p.label || p.name.replace(/_/g, ' ').replace(/\b\w/g, (l: any) => l.toUpperCase()),
  desc: p.desc || `Izin untuk fitur ${p.name.replace(/_/g, ' ')}`,
  assigned: p.assigned ?? false
});

export const usePermissionsManagement = () => {
  // Main Data States
  const [selectedRole, setSelectedRole] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Modal Management
  const [modals, setModals] = useState({
    add: false,
    edit: false,
    delete: false
  });

  // Form / Action Data States
  const [newPermData, setNewPermData] = useState({ name: "", roleIds: [] as string[] });
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [editPermName, setEditPermName] = useState("");
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);

  // Toast State
  const [toast, setToast] = useState({
    show: false,
    type: 'success' as ToastType,
    title: '',
    message: ''
  });

  const showToast = (type: ToastType, title: string, message: string) => {
    setToast({ show: true, type, title, message });
  };

  useEffect(() => {
    const savedRole = localStorage.getItem(STORAGE_KEY_ROLE);
    if (savedRole) setSelectedRole(savedRole);
  }, []);

  const handleRoleChange = (roleName: string) => {
    setSelectedRole(roleName);
    localStorage.setItem(STORAGE_KEY_ROLE, roleName);
    setIsDropdownOpen(false);
  };

  const getCurrentRole = useCallback(() => 
    roles.find(r => r.name.toLowerCase() === selectedRole.toLowerCase()), 
    [roles, selectedRole]
  );

  const fetchRoles = useCallback(async () => {
    try {
      const { data, error } = await superAdminService.getRoles();
      if (error) throw new Error(error);

      const rolesData = data.data || (Array.isArray(data) ? data : []);
      setRoles(rolesData);
      
      if (rolesData.length > 0 && !selectedRole && !localStorage.getItem(STORAGE_KEY_ROLE)) {
        handleRoleChange(rolesData[0].name);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  }, [selectedRole]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const loadPermissions = useCallback(async () => {
    const currentRole = getCurrentRole();
    if (!selectedRole || roles.length === 0 || !currentRole) return;

    setIsLoading(true);
    try {
      const { data, error } = await superAdminService.getRolePermissions(currentRole.id);
      if (error) throw new Error(error);
      
      const rawData = data.permissions || data.data || data || [];
      const formatted = Array.isArray(rawData) ? rawData.map(formatPermission) : [];

      setPermissions(formatted.filter(p => p.assigned));
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      showToast('error', 'Gagal Memuat', error.message || 'Tidak dapat mengambil data hak akses.');
      setPermissions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRole, roles, getCurrentRole]);

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  const togglePermission = (id: string) => {
    setPermissions(prev => prev.map(p => 
      p.id === id ? { ...p, assigned: !p.assigned } : p
    ));
  };

  const handleSave = async () => {
    const currentRole = getCurrentRole();
    if (!currentRole) return;

    setIsLoading(true);
    try {
      const payload = {
        role_id: currentRole.id,
        permissions: permissions.map(p => ({ id: p.id, assigned: p.assigned }))
      };

      const { error } = await superAdminService.saveRolePermissions(payload);

      if (!error) {
        showToast('success', 'Berhasil Disimpan', `Perubahan hak akses untuk ${selectedRole} telah diperbarui.`);
      } else {
        showToast('error', 'Gagal Menyimpan', error || 'Terjadi kesalahan saat menyimpan perubahan.');
      }
    } catch (error: any) {
      console.error("Error saving permissions:", error);
      showToast('error', 'Kesalahan Koneksi', error.message || 'Tidak dapat terhubung ke server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPermission = async () => {
    if (!newPermData.name || newPermData.roleIds.length === 0) {
      showToast('warning', 'Input Tidak Lengkap', 'Harap isi nama permission dan pilih minimal satu role.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await superAdminService.addPermission({
        name: newPermData.name,
        role_ids: newPermData.roleIds
      });

      if (!error) {
        showToast('success', 'Berhasil Ditambahkan', 'Permission baru berhasil didaftarkan ke sistem.');
        setModals(prev => ({ ...prev, add: false }));
        setNewPermData({ name: "", roleIds: [] });
        loadPermissions(); 
      } else {
        showToast('error', 'Gagal', error || 'Sistem gagal menambahkan permission baru.');
      }
    } catch (error: any) {
      console.error("Error adding permission:", error);
      showToast('error', 'Kesalahan', error.message || 'Terjadi gangguan koneksi saat menambah data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePermission = async () => {
    if (!editPermName || !editingPermission) return;

    setIsSubmitting(true);
    try {
      const { error } = await superAdminService.updatePermission({
        permission_id: editingPermission.id,
        name: editPermName
      });

      if (!error) {
        showToast('success', 'Berhasil Diperbarui', 'Nama permission telah berhasil diubah.');
        setModals(prev => ({ ...prev, edit: false }));
        setEditingPermission(null);
        setEditPermName("");
        loadPermissions();
      } else {
        showToast('error', 'Gagal Perbarui', error || 'Sistem gagal memperbarui nama permission.');
      }
    } catch (error: any) {
      console.error("Error updating permission:", error);
      showToast('error', 'Kesalahan', error.message || 'Terjadi gangguan koneksi saat memperbarui data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePermission = async () => {
    if (!permissionToDelete) return;

    setIsSubmitting(true);
    try {
      const { error } = await superAdminService.deletePermission(permissionToDelete.id);

      if (!error) {
        showToast('success', 'Berhasil Dihapus', 'Permission telah dihapus dari sistem.');
        setModals(prev => ({ ...prev, delete: false }));
        setPermissionToDelete(null);
        loadPermissions();
      } else {
        showToast('error', 'Gagal Menghapus', error || 'Sistem tidak dapat menghapus permission ini.');
      }
    } catch (error: any) {
      console.error("Error deleting permission:", error);
      showToast('error', 'Kesalahan', error.message || 'Terjadi gangguan koneksi saat menghapus data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (perm: Permission) => {
    setEditingPermission(perm);
    setEditPermName(perm.name);
    setModals(prev => ({ ...prev, edit: true }));
  };

  const openDeleteModal = (perm: Permission) => {
    setPermissionToDelete(perm);
    setModals(prev => ({ ...prev, delete: true }));
  };

  const toggleRoleSelection = (roleId: string) => {
    setNewPermData(prev => ({
      ...prev,
      roleIds: prev.roleIds.includes(roleId) 
        ? prev.roleIds.filter(id => id !== roleId) 
        : [...prev.roleIds, roleId]
    }));
  };

  return {
    // Data
    selectedRole,
    roles,
    permissions,
    // UI Status
    isLoading,
    isSubmitting,
    isDropdownOpen,
    modals,
    toast,
    // Form States
    newPermData,
    editingPermission,
    editPermName,
    permissionToDelete,
    // Actions
    setIsDropdownOpen,
    setModals,
    setToast,
    setNewPermData,
    setEditPermName,
    handleRoleChange,
    togglePermission,
    handleSave,
    handleAddPermission,
    handleUpdatePermission,
    handleDeletePermission,
    openEditModal,
    openDeleteModal,
    toggleRoleSelection
  };
};
