"use client";

import React from "react";
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
}

// Menu definitions for each role
const MENU_CONFIG: Record<string, NavItem[]> = {
  superadmin: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Layanan", icon: <Briefcase size={20} /> },
    { name: "Pengguna", icon: <Users size={20} /> },
    { name: "Transaksi", icon: <CreditCard size={20} /> },
    { name: "Laporan", icon: <FileText size={20} /> },
    { name: "Pengaturan", icon: <Settings size={20} /> },
  ],
  admin: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    // Add more admin menus here
  ],
  teknisi: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} /> },
    // Add more teknisi menus here
  ]
};

interface SidebarMenuProps {
  activeTab: string;
  setActiveTab: (name: string) => void;
  role: "superadmin" | "admin" | "teknisi";
}

export default function SidebarMenu({ activeTab, setActiveTab, role }: SidebarMenuProps) {
  const items = MENU_CONFIG[role] || [];

  return (
    <nav className="flex-1 space-y-2 px-4 py-8 shadow-sm backdrop-blur-md">
      {items.map((item) => (
        <button
          key={item.name}
          onClick={() => setActiveTab(item.name)}
          className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all ${
            activeTab === item.name 
            ? "bg-black text-white shadow-xl shadow-black/10" 
            : "text-[#666] hover:bg-black/[0.03] hover:text-black"
          }`}
        >
          {item.icon}
          {item.name}
        </button>
      ))}
    </nav>
  );
}
