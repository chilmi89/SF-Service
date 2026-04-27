"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  CreditCard, 
  FileText, 
  Settings 
} from "lucide-react";

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
  const items = MENU_CONFIG[role] || [];

  return (
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
  );
}
