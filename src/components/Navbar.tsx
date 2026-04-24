"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import { User, Menu, X, ArrowUpRight, LogOut } from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("user_role")?.toLowerCase().trim() || null;
    setIsLoggedIn(!!token);
    setUserRole(role);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      // Panggil API logout untuk menghapus HttpOnly cookie di backend
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    localStorage.removeItem("profile_id");
    setIsLoggedIn(false);
    setUserRole(null);
    router.push("/home");
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
              { label: "Services", href: "/services" },
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
                  href="/login"
                  className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-black transition-all hover:bg-gray-50 active:scale-95"
                >
                  <User className="h-4 w-4" />
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-black px-5 py-2 text-sm font-bold text-white transition-all hover:bg-black/90 hover:shadow-xl active:scale-95"
                >
                  Daftar
                </Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {userRole && !userRole.includes("user") && (
                  <Link
                    href="/dashboard/superadmin"
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
                    href="/login" 
                    className="flex items-center justify-center gap-2 py-3 text-black bg-white border border-black/10 rounded-full hover:bg-gray-50 transition-all font-bold" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Masuk
                  </Link>
                  <Link href="/register" className="rounded-full bg-black py-3 text-white font-bold flex items-center justify-center transition-all hover:bg-black/90 shadow-lg" onClick={() => setIsMenuOpen(false)}>Daftar</Link>
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  {userRole && !userRole.includes("user") && (
                    <Link 
                      href="/dashboard/superadmin" 
                      className="rounded-full bg-black py-4 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg" 
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  )}
                  <Link 
                    href="/profile" 
                    className="rounded-full border border-black/10 bg-white py-4 text-black font-bold flex items-center justify-center gap-2 transition-all" 
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="h-4 w-4" />
                    Profil Saya
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
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
    </>
  );
}
