"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CreditCard, 
  FileText, 
  Settings,
  LogOut
} from "lucide-react";
import { authService } from "@/lib/api/auth.service";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
}

// Menu definitions for each role
const MENU_CONFIG: Record<string, NavItem[]> = {
  superadmin: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard/superadmin" },
    { name: "Layanan", icon: <Briefcase size={20} />, href: "/dashboard/superadmin/layanan" },
    { name: "Pengguna", icon: <Users size={20} />, href: "/dashboard/superadmin/pengguna" },
    { name: "Transaksi", icon: <CreditCard size={20} />, href: "/dashboard/superadmin/transaksi" },
    { name: "Laporan", icon: <FileText size={20} />, href: "/dashboard/superadmin/laporan" },
    { name: "Pengaturan", icon: <Settings size={20} />, href: "/dashboard/superadmin/settings" },
  ],
  admin: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard/admin" },
  ],
  teknisi: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard/teknisi" },
  ]
};

interface SidebarMenuProps {
  role: "superadmin" | "admin" | "teknisi";
}

export default function SidebarMenu({ role }: SidebarMenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const items = MENU_CONFIG[role] || [];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authService.getProfile();
        if (data) setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await authService.logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'superadmin') return 'Super Admin';
    if (role === 'admin') return 'Admin Tenant';
    if (role === 'teknisi') return 'Teknisi';
    return role;
  };

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-2 px-4 py-8 shadow-sm backdrop-blur-md">
        {items.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
                isActive 
                ? "bg-black text-white shadow-xl shadow-black/10" 
                : "text-[#666] hover:bg-black/[0.03] hover:text-black"
              }`}
            >
              {item.icon}
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Profile Card with Logout Icon */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] p-4 transition-all hover:bg-black/[0.06] group">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full border border-black/10 bg-white overflow-hidden flex-shrink-0">
              <Image 
                src={profile?.avatar_url || "/images/budi.png"} 
                alt="Profile" 
                width={40} 
                height={40} 
                className="object-cover h-full w-full" 
              />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black truncate max-w-[100px]">
                {profile?.full_name || "Memuat..."}
              </p>
              <p className="text-[10px] font-bold text-[#666] capitalize">
                {getRoleLabel(role)}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#a1a1a1] hover:text-red-500 hover:bg-red-50 transition-all"
            title="Keluar"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
