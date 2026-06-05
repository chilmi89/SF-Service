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
  Lock,
  Shield,
  ChevronDown,
  ChevronRight,
  LogOut,
  Building2,
  ClipboardCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authService } from "@/lib/api/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { superAdminService } from "@/lib/api/(superadmin)/super-admin.service";

interface NavItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  permission?: string;
  children?: NavItem[];
}

// Menu definitions for each role
const MENU_CONFIG: Record<string, NavItem[]> = {
  superadmin: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard/superadmin", permission: "dashboard" },
    { name: "Layanan", icon: <Briefcase size={20} />, href: "/dashboard/superadmin/layanan", permission: "view_layanan" },
    { name: "Pengguna", icon: <Users size={20} />, href: "/dashboard/superadmin/pengguna", permission: "view_pengguna" },
    { name: "Paket Langganan", icon: <CreditCard size={20} />, href: "/dashboard/superadmin/subscriptions", permission: "view_paket" },
    { name: "Transaksi", icon: <CreditCard size={20} />, href: "/dashboard/superadmin/transaksi", permission: "view_transaksi" },
    { name: "Laporan", icon: <FileText size={20} />, href: "/dashboard/superadmin/laporan", permission: "view_laporan" },
    { 
      name: "Permissions", 
      icon: <Lock size={20} />, 
      href: "/dashboard/superadmin/permissions",
      permission: "permission",
      children: [
        { name: "Role & Permission", icon: <Shield size={16} />, href: "/dashboard/superadmin/permissions", permission: "permission" },
        { name: "Data User", icon: <Users size={16} />, href: "/dashboard/superadmin/permissions/users", permission: "data user" },
      ]
    },
  ],
  admin: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard/admin", permission: "dashboard" },
    { name: "Verifikasi Order", icon: <ClipboardCheck size={20} />, href: "/dashboard/admin/verifikasi-order", permission: "verifikasi_order" },
    { name: "Layanan", icon: <Briefcase size={20} />, href: "/dashboard/admin/layanan", permission: "view_layanan" },
    { name: "Transaksi", icon: <CreditCard size={20} />, href: "/dashboard/admin/transaksi", permission: "view_transaksi" },
  ],
  teknisi: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard/teknisi" }, // Dashboard teknisi sebaiknya default tampil
    { name: "Tugas Saya", icon: <Briefcase size={20} />, href: "/dashboard/teknisi/tugas" },
  ],
  owner_tunggal: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard/owner", permission: "dashboard" },
    { name: "Verifikasi Order", icon: <ClipboardCheck size={20} />, href: "/dashboard/owner/verifikasi-order", permission: "verifikasi_order" },
    { name: "Profil Perusahaan", icon: <Building2 size={20} />, href: "/dashboard/owner/profile-tenant", permission: "view_profile" },
    { name: "Layanan Saya", icon: <Briefcase size={20} />, href: "/dashboard/owner/layanan", permission: "view_layanan" },
    { name: "Kelola Staf", icon: <Users size={20} />, href: "/dashboard/owner/staff", permission: "view_staff" },
    { name: "Langganan", icon: <CreditCard size={20} />, href: "/dashboard/owner/subscription", permission: "view_langganan" },
    { name: "Laporan", icon: <FileText size={20} />, href: "/dashboard/owner/laporan", permission: "view_laporan" },
  ],
  owner: [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, href: "/dashboard/owner", permission: "dashboard" },
    { name: "Profil Perusahaan", icon: <Building2 size={20} />, href: "/dashboard/owner/profile-tenant", permission: "view_profile" },
    { name: "Layanan Saya", icon: <Briefcase size={20} />, href: "/dashboard/owner/layanan", permission: "view_layanan" },
    { name: "Kelola Staf", icon: <Users size={20} />, href: "/dashboard/owner/staff", permission: "view_staff" },
    { name: "Langganan", icon: <CreditCard size={20} />, href: "/dashboard/owner/subscription", permission: "view_langganan" },
    { name: "Laporan", icon: <FileText size={20} />, href: "/dashboard/owner/laporan", permission: "view_laporan" },
  ]
};

interface SidebarMenuProps {
  role: "superadmin" | "admin" | "teknisi" | "owner_tunggal" | "owner";
  onNavigate?: () => void;
}

export default function SidebarMenu({ role, onNavigate }: SidebarMenuProps) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [profile, setProfile] = useState<any>(null);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [isLoadingPerms, setIsLoadingPerms] = useState(true);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Permissions: pathname.includes("/permissions")
  });
  const toggleMenu = (name: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  useEffect(() => {
    // Load from cache first for instant UI
    const cached = localStorage.getItem("user_permissions");
    if (cached) {
      try {
        setUserPermissions(JSON.parse(cached));
      } catch (e) {
        console.error("Failed to parse cached permissions");
      }
    }

    const loadSidebarData = async () => {
      try {
        // 1. Ambil Profile (untuk avatar/nama)
        const profileId = localStorage.getItem("profile_id");
        const [profileRes, rolesRes] = await Promise.all([
          authService.getProfile(profileId || ""),
          superAdminService.getRoles()
        ]);

        if (profileRes.data) {
          // Unwrap data nesting (backend returns { data: { ... } })
          const actualProfile = profileRes.data.data || profileRes.data;
          setProfile(actualProfile);
        }

        const storedRoleName = localStorage.getItem("user_role");
        if (storedRoleName) {
          const rolesList = rolesRes?.data?.data || rolesRes?.data || rolesRes || [];
          const currentRoleData = rolesList.find((r: any) => {
            const dbRole = r.name.toLowerCase().trim();
            const localRole = storedRoleName.toLowerCase().trim();
            return dbRole === localRole || 
                   dbRole === localRole.replace(/_/g, " ") || 
                   dbRole.replace(/\s+/g, "_") === localRole;
          });

          if (currentRoleData?.id) {
            const { data: permData } = await superAdminService.getRolePermissions(currentRoleData.id);
            if (permData && permData.permissions) {
              const assigned = permData.permissions
                .filter((p: any) => p.assigned)
                .map((p: any) => p.name.toLowerCase());
              
              setUserPermissions(assigned);
              // Update cache
              localStorage.setItem("user_permissions", JSON.stringify(assigned));
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat data sidebar:", err);
      } finally {
        setIsLoadingPerms(false);
      }
    };
    loadSidebarData();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("user_permissions");
    await logout();
  };

  const getRoleLabel = (role: string) => {
    if (role === 'superadmin') return 'Super Admin';
    if (role === 'admin') return 'Admin Tenant';
    if (role === 'teknisi') return 'Teknisi';
    if (role === 'owner_tunggal') return 'Owner Tunggal';
    return role;
  };

  // Helper untuk filter menu berdasarkan permission secara rekursif
  const filterMenuItems = (menuItems: NavItem[]): NavItem[] => {
    return menuItems
      .filter(item => !item.permission || userPermissions.some(p => p === item.permission?.toLowerCase()))
      .map(item => {
        if (item.children) {
          return { ...item, children: filterMenuItems(item.children) };
        }
        return item;
      });
  };

  const items = filterMenuItems(MENU_CONFIG[role] || []);

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-2 px-4 py-8 shadow-sm backdrop-blur-md">
        {items.map((item) => {
          const hasChildren = !!item.children;
          const isMenuOpen = openMenus[item.name];
          const isParentActive = pathname === item.href || item.children?.some(child => pathname === child.href);
          
          return (
            <div key={item.name} className="space-y-1">
              {hasChildren ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
                    isParentActive
                      ? "text-black bg-black/[0.03]"
                      : "text-[#666] hover:bg-black/[0.03] hover:text-black"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.name}</span>
                  <motion.div
                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-[#a1a1a1]" />
                  </motion.div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex w-full items-center gap-4 rounded-xl px-4 py-3.5 text-sm font-bold transition-all ${
                    pathname === item.href
                    ? "bg-black text-white shadow-xl shadow-black/10" 
                    : "text-[#666] hover:bg-black/[0.03] hover:text-black"
                  }`}
                >
                  {item.icon}
                  <span className="flex-1">{item.name}</span>
                </Link>
              )}

              <AnimatePresence>
                {hasChildren && isMenuOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="ml-9 space-y-1 pt-1 pb-2 border-l-2 border-gray-100 pl-4">
                      {item.children?.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.name}
                            href={child.href}
                            onClick={onNavigate}
                            className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-xs font-bold transition-all ${
                              isChildActive
                              ? "text-black bg-black/[0.05]"
                              : "text-[#888] hover:text-black hover:bg-black/[0.02]"
                            }`}
                          >
                            <div className={`transition-colors ${isChildActive ? "text-black" : "text-[#888]"}`}>
                              {child.icon}
                            </div>
                            {child.name}
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      {/* Profile Card with Logout Icon */}
      <div className="p-2 border-t border-gray-100">
        <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] p-2 transition-all hover:bg-black/[0.06] group">
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
