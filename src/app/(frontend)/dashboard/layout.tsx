"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Loader2, X } from "lucide-react";

export default function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, userRole, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const pathname = usePathname();

  // Menampilkan loader saat sedang mengecek status login
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  // Jika tidak login, biarkan middleware yang menangani redirect ke /auth/login
  // if (!isLoggedIn) {
  //   return null;
  // }

  // Normalisasi role untuk Sidebar
  const getNormalizedRole = () : "superadmin" | "admin" | "teknisi" | "owner_tunggal" => {
    if (pathname?.startsWith("/dashboard/teknisi")) return "teknisi";
    
    const role = userRole?.toLowerCase() || "";
    if (role === "super admin" || role === "superadmin") return "superadmin";
    if (role === "owner tunggal" || role === "owner_tunggal") return "owner_tunggal";
    if (role === "teknisi") return "teknisi";
    return "admin"; // Default fallback
  };

  const normalizedRole = getNormalizedRole();

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-black selection:bg-black selection:text-white">
      
      {/* MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (SHARED) */}
      <aside className={`fixed left-0 top-0 h-screen w-60 border-r border-gray-300 bg-white flex flex-col z-50 transition-transform duration-300 ${
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Branding */}
        <div className="flex h-20 items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white font-black text-lg">
              F
            </div>
            <span className="text-xl font-black tracking-tight">
              {normalizedRole === "superadmin" ? "FixIt Admin" : "FixIt Tenant"}
            </span>
          </Link>
          <button 
            className="lg:hidden p-2 -mr-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors" 
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation - Role specific menu loaded here */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden pb-4">
          <SidebarMenu role={normalizedRole} onNavigate={() => setIsMobileMenuOpen(false)} />
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-60 flex flex-col min-w-0">
        
        {/* SHARED HEADER */}
        <DashboardHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* PAGE CONTENT */}
        <div className="min-h-[calc(100vh-4.5rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
