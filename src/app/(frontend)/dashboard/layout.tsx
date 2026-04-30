"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Loader2 } from "lucide-react";

export default function RootDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoggedIn, userRole, isLoading } = useAuth();

  // Menampilkan loader saat sedang mengecek status login
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f9fa]">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  // Jika tidak login, biarkan middleware yang menangani redirect ke /auth/login
  if (!isLoggedIn) {
    return null;
  }

  // Normalisasi role untuk Sidebar
  const getNormalizedRole = () : "superadmin" | "admin" | "teknisi" | "owner_tunggal" => {
    const role = userRole?.toLowerCase() || "";
    if (role === "super admin" || role === "superadmin") return "superadmin";
    if (role === "owner tunggal" || role === "owner_tunggal") return "owner_tunggal";
    if (role === "teknisi") return "teknisi";
    return "admin"; // Default fallback
  };

  const normalizedRole = getNormalizedRole();

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-black selection:bg-black selection:text-white">
      
      {/* SIDEBAR (SHARED) */}
      <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r border-gray-300 bg-white lg:flex lg:flex-col">
        {/* Branding */}
        <div className="flex h-20 items-center px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white font-black text-lg">
              F
            </div>
            <span className="text-xl font-black tracking-tight">
              {normalizedRole === "superadmin" ? "FixIt Admin" : "FixIt Tenant"}
            </span>
          </Link>
        </div>

        {/* Navigation - Role specific menu loaded here */}
        <SidebarMenu role={normalizedRole} />
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-60">
        
        {/* SHARED HEADER */}
        <DashboardHeader />

        {/* PAGE CONTENT */}
        <div className="min-h-[calc(100vh-4.5rem)]">
          {children}
        </div>
      </main>
    </div>
  );
}
