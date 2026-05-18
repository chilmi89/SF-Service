"use client";

import { usePathname } from "next/navigation";
import { Search, Bell, Menu } from "lucide-react";

interface DashboardHeaderProps {
  title?: string;
  onMenuClick?: () => void;
}

export default function DashboardHeader({ title, onMenuClick }: DashboardHeaderProps) {
  const pathname = usePathname();

  // Otomatis menentukan judul berdasarkan path jika tidak diberikan
  const getAutoTitle = () => {
    if (title) return title;
    
    // Mapping path ke Judul
    if (pathname.includes("/superadmin")) {
        if (pathname === "/dashboard/superadmin") return "Dashboard Superadmin";
        if (pathname.includes("/permissions")) return "Role & Permission";
        if (pathname.includes("/layanan")) return "Manajemen Layanan";
    }
    
    if (pathname.includes("/owner_tunggal")) {
        if (pathname === "/dashboard/owner_tunggal") return "Dashboard Tenant";
        if (pathname.includes("/layanan")) return "Layanan Saya";
        if (pathname.includes("/pesanan")) return "Daftar Pesanan";
        if (pathname.includes("/subscription")) return "Langganan";
        if (pathname.includes("/teknisi")) return "Manajemen Teknisi";
    }

    if (pathname.includes("/dashboard/owner") && !pathname.includes("/owner_tunggal")) {
        if (pathname === "/dashboard/owner") return "Dashboard Owner";
        if (pathname.includes("/layanan")) return "Layanan Saya";
        if (pathname.includes("/subscription")) return "Langganan";
        if (pathname.includes("/teknisi")) return "Manajemen Teknisi";
    }

    if (pathname.includes("/admin") && !pathname.includes("/superadmin")) return "Dashboard Admin";
    if (pathname.includes("/teknisi")) return "Dashboard Teknisi";

    return "Dashboard";
  };

  const currentDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <header className="flex h-18 items-center justify-between px-6 md:px-12 bg-white/80 backdrop-blur-md border-b border-gray-300 sticky top-0 z-30">
      <div className="flex items-center gap-3 md:gap-4">
        {onMenuClick && (
          <button 
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <h1 className="text-xl md:text-2xl font-bold truncate max-w-[180px] md:max-w-none">{getAutoTitle()}</h1>
        <span className="hidden md:block h-1 w-1 rounded-full bg-black/20 shrink-0" />
        <p className="hidden md:block text-sm font-bold text-[#666] truncate">{currentDate}</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative hidden md:block">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
          <input 
            type="text" 
            placeholder="Cari data..." 
            className="h-10 w-80 rounded-lg border border-gray-300 bg-gray-100 pl-11 pr-4 text-xs font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>

        {/* Notifications */}
        <button className="relative h-10 w-10 rounded-lg border border-gray-300 bg-white shadow-sm flex items-center justify-center transition-all hover:bg-black/[0.03] active:scale-95">
          <Bell size={20} className="text-[#666]" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
        </button>
      </div>
    </header>
  );
}
