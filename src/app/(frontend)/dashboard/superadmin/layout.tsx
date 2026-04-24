"use client";

import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SidebarMenu from "@/components/dashboard/SidebarMenu";
import { 
  Search, 
  Bell, 
  LogOut
} from "lucide-react";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_role");
    router.push("/home");
  };

  // Determine page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/dashboard/superadmin") return "Dashboard";
    if (pathname === "/dashboard/superadmin/settings") return "Pengaturan";
    if (pathname.includes("/layanan")) return "Layanan";
    if (pathname.includes("/pengguna")) return "Pengguna";
    if (pathname.includes("/transaksi")) return "Transaksi";
    if (pathname.includes("/laporan")) return "Laporan";
    return "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-[#f8f9fa] text-black selection:bg-black selection:text-white">
      
      {/* SIDEBAR */}
      <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r border-gray-300 bg-white lg:flex lg:flex-col">
        {/* Branding */}
        <div className="flex h-18 items-center px-8 border-b border-gray-300">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white font-black text-lg">
              F
            </div>
            <span className="text-xl font-black tracking-tight">FixIt Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <SidebarMenu role="superadmin" />

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-300 shadow-sm backdrop-blur-md">
          <div className="flex items-center justify-between rounded-2xl bg-black/[0.03] p-4 transition-all hover:bg-black/[0.06] cursor-pointer group">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border border-black/10 bg-white overflow-hidden">
                <Image src="/images/budi.png" alt="Admin" width={40} height={40} className="object-cover" />
              </div>
              <div>
                <p className="text-xs font-black">Rizky Admin</p>
                <p className="text-[10px] font-bold text-[#666]">Super Admin</p>
              </div>
            </div>
            <LogOut 
              size={16} 
              className="text-[#a1a1a1] hover:text-black transition-colors cursor-pointer" 
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-60">
        
        {/* TOP HEADER */}
        <header className="flex h-18 items-center justify-between px-8 md:px-12 bg-white/80 backdrop-blur-md border-b border-gray-300 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">{getPageTitle()}</h1>
            <span className="h-1 w-1 rounded-full bg-black/20" />
            <p className="text-sm font-bold text-[#666]">Sabtu, 25 April 2026</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
              <input 
                type="text" 
                placeholder="Cari data..." 
                className="h-10 w-80 rounded-lg border border-gray-300 bg-gray-100 pl-11 pr-4 text-xs font-medium transition-all focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/5"
              />
            </div>
            <button className="relative h-10 w-10 rounded-lg border border-gray-300 bg-white shadow-sm flex items-center justify-center transition-all hover:bg-black/[0.03] active:scale-95">
              <Bell size={20} className="text-[#666]" />
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
