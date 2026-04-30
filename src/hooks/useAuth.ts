"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/api/auth.service";

/**
 * useAuth Hook
 * Digunakan untuk mengelola status autentikasi, role pengguna,
 * dan fungsi logout secara global di seluruh komponen frontend.
 */
export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Sinkronisasi dengan localStorage saat hook dimuat
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("user_role");
      const pId = localStorage.getItem("profile_id");

      setIsLoggedIn(!!token);
      setUserRole(role);
      setProfileId(pId);
      setIsLoading(false);
    };

    checkAuth();
    
    // Listener untuk sinkronisasi antar hook instance di tab yang sama
    const handleAuthChange = () => checkAuth();
    window.addEventListener("auth-change", handleAuthChange);
    
    // Listener untuk perubahan storage (jika user logout di tab lain)
    window.addEventListener("storage", checkAuth);
    
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const logout = async () => {
    try {
      // 1. Panggil API logout (untuk hapus HttpOnly cookie di backend)
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 2. Bersihkan localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user_role");
      localStorage.removeItem("profile_id");
      
      // 3. Update state lokal
      setIsLoggedIn(false);
      setUserRole(null);
      setProfileId(null);
      
      // 4. Beritahu instance hook lain untuk update (Navbar, Sidebar, dll)
      window.dispatchEvent(new Event("auth-change"));
      
      // 5. Redirect ke home/login
      router.push("/home");
    }
  };

  /**
   * Helper untuk cek role secara spesifik
   */
  const hasRole = (roles: string | string[]) => {
    if (!userRole) return false;
    if (Array.isArray(roles)) {
      return roles.includes(userRole.toLowerCase());
    }
    return userRole.toLowerCase() === roles.toLowerCase();
  };

  return {
    isLoggedIn,
    userRole,
    profileId,
    isLoading,
    logout,
    hasRole,
  };
};
