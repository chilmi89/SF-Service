"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { User, Menu, X, ArrowUpRight, LogOut, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/lib/api/auth.service";
import { apiClient } from "@/lib/api/api-client";
import { Toast, ToastType } from "@/components/toast";

export default function Navbar() {
  const { isLoggedIn, userRole, logout, hasRole } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: ToastType } | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) {
      const fetchProfile = async () => {
        try {
          const profileId = localStorage.getItem("profile_id");
          if (!profileId) return;

          // Use /api/users instead of /api/profiles because it includes role information
          const { data: userRes } = await apiClient(`/api/users/${profileId}`);
          const userData = userRes?.data || userRes;
          
          if (userData) {
            setProfile(userData);
            
            // Sync role if inconsistent with localStorage
            const dbRole = userData.role_name?.toLowerCase();
            const localRole = localStorage.getItem("user_role")?.toLowerCase();
            
            if (dbRole && dbRole !== localRole) {
              localStorage.setItem("user_role", dbRole);
              // Trigger event to update other hooks (like useAuth)
              window.dispatchEvent(new Event("auth-change"));
            }
          }
        } catch (err) {
          console.error("Gagal mengambil data profil di Navbar:", err);
        }
      };
      fetchProfile();
    } else {
      setProfile(null);
    }
  }, [isLoggedIn]);

  const handleTenantRegisterClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Re-fetch profile to get latest data
    let latestProfile = profile;
    try {
      const profileId = localStorage.getItem("profile_id");
      if (profileId) {
        const { data } = await authService.getProfile(profileId);
        const actualProfile = data?.data || data;
        if (actualProfile) {
          setProfile(actualProfile);
          latestProfile = actualProfile;
        }
      }
    } catch (err) {
      console.error("Gagal refresh profil:", err);
    }

    // Syarat kelengkapan profil: Nama, No HP, dan Alamat
    // Cek di tingkat utama atau di dalam properti data (antisipasi nesting)
    const isProfileComplete = 
      (latestProfile?.full_name && latestProfile?.phone && latestProfile?.address) ||
      (latestProfile?.data?.full_name && latestProfile?.data?.phone && latestProfile?.data?.address);

    if (!isProfileComplete) {
      setToast({
        show: true,
        title: "Profil Belum Lengkap",
        message: "Silakan lengkapi profil Anda (Nama, No HP, dan Alamat) terlebih dahulu sebelum mendaftar Tenant.",
        type: "warning"
      });
    } else {
      router.push("/auth/tenant-register");
    }
  };

  const getDashboardLink = () => {
    if (!userRole) return "/home";
    const role = userRole.toLowerCase();
    if (role === "super admin" || role === "superadmin") return "/dashboard/superadmin";
    if (role === "admin") return "/dashboard/admin";
    if (role === "teknisi") return "/dashboard/teknisi";
    if (role === "owner tunggal" || role === "owner_tunggal" || role === "owner") return "/dashboard/owner";
    if (role === "admin tenant") return "/dashboard/admin"; // Or specify a dedicated path if needed
    return "/home";
  };

  const blobVariants: Variants = {
    animate1: {
      x: [0, 40, 0],
      y: [0, 30, 0],
      scale: [1, 1.1, 1],
      transition: { duration: 10, repeat: Infinity, ease: "easeInOut" },
    },
    animate2: {
      x: [0, -30, 0],
      y: [0, 50, 0],
      scale: [1, 1.2, 1],
      transition: { duration: 12, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <>
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          variants={blobVariants}
          animate="animate1"
          className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-black/[0.03] blur-[100px]"
        />
        <motion.div
          variants={blobVariants}
          animate="animate2"
          className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-black/[0.03] blur-[100px]"
        />
      </div>

      <nav className="fixed top-6 left-0 right-0 z-50 flex flex-col items-center px-4 pointer-events-none">
        <div className="flex w-full max-w-7xl items-center justify-between rounded-xl bg-transparent border border-black/5 shadow-xl px-4 md:px-10 py-2 backdrop-blur-sm pointer-events-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.1 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white font-black"
            >
              F
            </motion.div>
            <span className="text-xl font-black tracking-tight text-black">
              FixIt
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-[#666]">
            {[
              { label: "Home", href: "/home" },
              { label: "Services", href: "/service" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="relative group py-2"
                >
                  <motion.div
                    whileTap={{ 
                      skewX: -15, 
                      scaleX: 1.2, 
                      scaleY: 0.8,
                      transition: { type: "spring", stiffness: 400, damping: 10 }
                    }}
                    animate={isActive ? { x: [0, 12, 0, 6, 0, 3, 0] } : { x: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className={`transition-[transform,color] duration-300 ${isActive ? 'text-black italic font-bold' : 'hover:text-black hover:scale-105'}`}
                  >
                    {item.label}
                  </motion.div>
                  {isActive && (
                    <motion.div
                      layoutId="active-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-full"
                      transition={{ type: "spring", stiffness: 350, damping: 25 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-6">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/auth/login"
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-black transition-all hover:bg-gray-50 active:scale-95"
                >
                  <User className="h-4 w-4" />
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white transition-all hover:bg-black/90 hover:shadow-xl active:scale-95"
                >
                  Daftar
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {userRole?.toLowerCase() === "user biasa" ? (
                  <button
                    onClick={handleTenantRegisterClick}
                    className="flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-5 py-2 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-200/50"
                  >
                    Buka Tenant
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                ) : (
                  <Link
                    href={getDashboardLink()}
                    className="flex items-center gap-2 rounded-full bg-black px-8 py-3 text-sm font-bold text-white transition-all hover:bg-black/90 hover:shadow-xl active:scale-95 shadow-lg"
                  >
                    Dashboard
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )}
                <Link
                  href="/profiles"
                  className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-6 py-2.5 text-sm font-bold text-black transition-all hover:bg-gray-50 active:scale-95 shadow-sm"
                >
                  <User className="h-4 w-4" />
                  Profil
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-black"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 w-full max-w-7xl rounded-3xl border border-black/[0.08] bg-transparent backdrop-blur-md p-6 md:hidden shadow-2xl pointer-events-auto"
          >
            <div className="flex flex-col gap-4 text-center font-bold">
              {[
                { label: "Home", href: "/home" },
                { label: "Services", href: "#" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "#" },
              ].map((item) => (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className="py-2 text-black hover:opacity-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-black/[0.05] my-2" />
              {!isLoggedIn ? (
                <>
                  <Link 
                    href="/auth/login" 
                    className="flex items-center justify-center gap-2 py-3 text-black bg-white border border-black/10 rounded-full hover:bg-gray-50 transition-all font-bold" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Masuk
                  </Link>
                  <Link href="/auth/register" className="rounded-full bg-black py-3 text-white font-bold flex items-center justify-center transition-all hover:bg-black/90 shadow-lg" onClick={() => setIsMenuOpen(false)}>Daftar</Link>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  {userRole?.toLowerCase() === "user biasa" ? (
                    <button 
                      onClick={(e) => {
                        handleTenantRegisterClick(e);
                        if (profile?.full_name && profile?.phone && profile?.address) {
                          setIsMenuOpen(false);
                        }
                      }} 
                      className="rounded-full bg-gradient-to-r from-orange-500 to-rose-500 py-4 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-200/50"
                    >
                      Buka Tenant
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <Link 
                      href={getDashboardLink()} 
                      className="rounded-full bg-black py-4 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link 
                    href="/profiles" 
                    className="rounded-full border border-black/10 bg-white py-4 text-black font-bold flex items-center justify-center gap-2 transition-all" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profil Saya
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }} 
                    className="rounded-full border border-red-100 bg-red-50/50 py-4 text-red-600 font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <LogOut size={18} />
                    Keluar Sekarang
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </nav>

      {toast && (
        <Toast
          show={toast.show}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
