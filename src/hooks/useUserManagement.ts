"use client";

import { useState, useEffect, useCallback } from "react";
import { userService } from "@/lib/api/(superadmin)/user.service";
import { ToastType } from "@/components/toast";

export interface UserData {
  id: string;
  full_name: string;
  email: string;
  role_name: string;
  role_id: string;
  created_at: string;
  phone?: string;
  address?: string;
  avatar_url?: string;
  kode_tenant?: string;
}

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: ToastType;
  } | null>(null);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: apiError } = await userService.getAll();
      if (apiError) {
        setError(apiError);
        setToast({
          show: true,
          title: "Gagal Memuat",
          message: apiError,
          type: "error",
        });
      } else if (data && data.data) {
        setUsers(data.data);
      }
    } catch (err: any) {
      const msg = err.message || "Terjadi kesalahan saat mengambil data user.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteUser = async (id: string) => {
    try {
      const { error: apiError } = await userService.delete(id);
      if (apiError) {
        setToast({
          show: true,
          title: "Gagal Menghapus",
          message: apiError,
          type: "error",
        });
        return false;
      }
      
      setToast({
        show: true,
        title: "Berhasil",
        message: "User berhasil dihapus secara permanen.",
        type: "success",
      });
      fetchUsers(); // Refresh daftar user
      return true;
    } catch (err) {
      console.error("Delete error:", err);
      return false;
    }
  };

  const updateRole = async (id: string, roleId: string) => {
    try {
      const { error: apiError } = await userService.updateRole(id, roleId);
      if (apiError) {
        setToast({
          show: true,
          title: "Gagal Update",
          message: apiError,
          type: "error",
        });
        return false;
      }

      setToast({
        show: true,
        title: "Berhasil",
        message: "Role user berhasil diperbarui.",
        type: "success",
      });
      fetchUsers(); // Refresh daftar user
      return true;
    } catch (err) {
      console.error("Update role error:", err);
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const hideToast = () => setToast(null);

  return {
    users,
    isLoading,
    error,
    toast,
    fetchUsers,
    deleteUser,
    updateRole,
    hideToast,
  };
};
