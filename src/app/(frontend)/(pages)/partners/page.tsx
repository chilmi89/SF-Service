"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Star,
  Shield,
  MapPin,
  Phone,
  ArrowUpRight,
  Sparkles,
  Building2,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  ChevronRight,
  Briefcase,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import BookingModal from "@/components/BookingModal";
import { Toast } from "@/components/toast";
import { usePartnersData } from "@/hooks/usePartnersData";

export default function PartnersDirectoryPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Search and Loading States
  const [searchQuery, setSearchQuery] = useState("");
  const { tenants, allServices, loading } = usePartnersData();

  // Selected Tenant Modal & Services States
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [tenantServices, setTenantServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Toast State
  const [toast, setToast] = useState<{ title: string; message: string; type: "success" | "error" | "warning" } | null>(null);

  // Auto-open booking modal if there's a pending service from before login
  useEffect(() => {
    if (!authLoading && isLoggedIn) {
      const pendingServiceStr = localStorage.getItem("pending_booking_service");
      if (pendingServiceStr) {
        try {
          const pendingService = JSON.parse(pendingServiceStr);
          if (pendingService) {
            const formatted = {
              ...pendingService,
              price: typeof pendingService.price === "number"
                ? `Rp ${pendingService.price.toLocaleString("id-ID")}`
                : pendingService.price
            };
            setSelectedService(formatted);
            setIsBookingModalOpen(true);
          }
        } catch (e) {
          console.error("Gagal memproses pending service:", e);
        } finally {
          localStorage.removeItem("pending_booking_service");
        }
      }
    }
  }, [authLoading, isLoggedIn]);

  // Mencegah scroll pada body saat right bar (selectedTenant) terbuka
  useEffect(() => {
    if (!selectedTenant) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedTenant]);

  // Fetch Services for Selected Tenant
  const handleViewServices = (tenant: any) => {
    setSelectedTenant(tenant);
    setLoadingServices(true);
    setTenantServices([]);

    // Filter from preloaded services
    const filtered = allServices
      .filter((item: any) => {
        return (
          item.tenantId === tenant.id ||
          item.tech?.toLowerCase() === tenant.name.toLowerCase()
        );
      })
      .map((item: any) => ({
        ...item,
        avatar: tenant.image_url || item.avatar
      }));

    setTenantServices(filtered);
    setLoadingServices(false);
  };

  const handleBookService = (service: any) => {
    if (authLoading) return;
    if (!isLoggedIn) {
      // Simpan layanan ke localStorage sebelum redirect
      localStorage.setItem("pending_booking_service", JSON.stringify(service));
      setToast({
        title: "Login Diperlukan",
        message: "Silakan login ke akun Anda terlebih dahulu untuk memesan layanan ini.",
        type: "warning",
      });
      setTimeout(() => {
        router.push(`/auth/login?redirect=${window.location.pathname}`);
      }, 2000);
      return;
    }

    // Format price and trigger BookingModal
    const formatted = {
      ...service,
      price: `Rp ${service.price.toLocaleString("id-ID")}`
    };
    setSelectedService(formatted);
    setIsBookingModalOpen(true);
  };

  // Filter Tenants by Search Query
  const filteredTenants = tenants.filter((tenant) => {
    const q = searchQuery.toLowerCase();
    return (
      tenant.name.toLowerCase().includes(q) ||
      tenant.address.toLowerCase().includes(q) ||
      tenant.desc.toLowerCase().includes(q) ||
      tenant.categories.some((c: string) => c.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-transparent text-black">
      <main className="relative z-10 pt-32 pb-24 px-4 sm:px-8 lg:px-24">
        {/* Decorative background blobs */}
        <div className="absolute top-10 left-10 -z-10 h-72 w-72 rounded-full bg-black/[0.02] blur-[80px]" />
        <div className="absolute bottom-10 right-10 -z-10 h-96 w-96 rounded-full bg-black/[0.02] blur-[100px]" />

        {/* Simple Centered Hero Section (Clean & Minimalist) */}
        <div className="max-w-xl mx-auto text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-[9px] font-bold text-black uppercase tracking-wider"
          >
            <Sparkles className="h-3 w-3" />
            Direktori Kemitraan
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-bold tracking-tight text-black"
          >
            Temukan Mitra Service Terpercaya
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-md mx-auto"
          >
            Pusat direktori resmi penyedia jasa service rumahan bersertifikasi. Cari berdasarkan nama perusahaan, lokasi terdekat, atau bidang spesialisasi.
          </motion.p>
          
          {/* Centered Editorial Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative max-w-sm mx-auto pt-4"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama mitra, lokasi, atau spesialisasi..."
              className="w-full bg-transparent border-b border-black/10 focus:border-black py-2 pl-7 pr-4 text-xs sm:text-sm font-semibold text-black outline-none transition-all placeholder:text-gray-400"
            />
            <Search className="absolute left-0 bottom-2.5 h-4 w-4 text-gray-400" />
          </motion.div>
        </div>

        {/* Partners Grid / List */}
        <div className="max-w-7xl mx-auto min-h-[400px]">
          {loading ? (
            /* Skeleton list rows */
            <div className="space-y-0 border-t border-black/[0.06] mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8 py-8 border-b border-black/[0.06]">
                  <div className="w-full lg:w-48 h-36 lg:h-28 rounded-2xl bg-gray-100 shrink-0" />
                  <div className="flex-grow space-y-3">
                    <div className="h-6 bg-gray-100 rounded w-1/3" />
                    <div className="h-4 bg-gray-100 rounded w-3/4" />
                    <div className="h-4 bg-gray-100 rounded w-1/2" />
                  </div>
                  <div className="w-32 h-10 bg-gray-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredTenants.length === 0 ? (
            /* Empty state */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-3xl border border-dashed border-black/10 bg-gray-50/30"
            >
              <div className="h-16 w-16 bg-black/5 rounded-full flex items-center justify-center mb-6">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Mitra Tidak Ditemukan</h3>
              <p className="text-gray-500 text-sm max-w-sm">
                Tidak ada perusahaan jasa service yang cocok dengan pencarian Anda. Silakan cari dengan kata kunci lain.
              </p>
            </motion.div>
          ) : (
            /* Partners directory list (Borderless Row-based Layout) */
            <div className="space-y-0 border-t border-black/[0.06] mt-8">
              {filteredTenants.map((tenant, index) => (
                <motion.div
                  key={tenant.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                  className="group flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8 py-8 border-b border-black/[0.06] transition-all hover:bg-black/[0.01] -mx-4 px-4 sm:mx-0 sm:px-0"
                >
                  {/* Thumbnail Image */}
                  <div className="relative w-full lg:w-48 h-36 lg:h-28 rounded-2xl overflow-hidden shrink-0 bg-gray-50 border border-black/[0.04]">
                    <Image
                      src={tenant.image_url}
                      alt={tenant.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 200px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-bold text-black uppercase tracking-wider shadow-sm border border-black/5 flex items-center gap-1">
                      <Shield className="h-2.5 w-2.5 text-emerald-600 fill-emerald-100" />
                      Verified
                    </div>
                  </div>

                  {/* Info Details */}
                  <div className="flex-grow space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <h3 className="font-black text-xl text-black group-hover:text-black/80 transition-colors leading-tight">
                          {tenant.name}
                        </h3>
                        <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                          <span className="flex items-center gap-1 text-black">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            {tenant.rating}
                          </span>
                          <span>•</span>
                          <span>{tenant.ordersCount}+ Orders Selesai</span>
                          <span>•</span>
                          <span className="text-gray-500 font-semibold">{tenant.servicesCount || 0} Layanan Tersedia</span>
                        </div>
                      </div>

                      {/* Categories Badges */}
                      <div className="flex flex-wrap gap-1">
                        {tenant.categories.map((cat: string) => (
                          <span key={cat} className="px-2 py-0.5 rounded bg-black/5 text-[9px] font-bold text-gray-600 uppercase tracking-wider">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-3xl">
                      {tenant.desc}
                    </p>

                    {/* Contact Info Row */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 text-[11px] font-semibold text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="line-clamp-1">{tenant.address}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span>{tenant.phone}</span>
                      </span>
                    </div>
                  </div>

                  {/* Trigger Button */}
                  <div className="shrink-0 lg:self-center w-full lg:w-auto pt-2 lg:pt-0">
                    <button
                      onClick={() => handleViewServices(tenant)}
                      className="w-full lg:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-black hover:bg-black/90 text-white font-black text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                      Lihat Jasa Layanan
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Company Registration Section - Borderless Editorial Split Layout */}
        <section className="max-w-7xl mx-auto mt-32 pt-24 border-t border-black/[0.06]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-6 space-y-6">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/5 text-[10px] font-bold uppercase tracking-wider text-black">
                <Building2 className="h-3.5 w-3.5" />
                FixIt untuk Perusahaan Jasa
              </span>
              <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-black leading-[1.1]">
                Kembangkan Bisnis <br />
                Jasa Anda Bersama Kami.
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-medium leading-relaxed">
                Daftarkan perusahaan Anda di platform FixIt. Dapatkan akses langsung ke ribuan pelanggan baru, kelola operasional harian Anda secara digital, pantau kinerja teknisi Anda secara real-time, dan tingkatkan pendapatan Anda.
              </p>

              {/* Benefits list (clean text-based rows instead of cards) */}
              <div className="space-y-4 pt-2">
                {[
                  { title: "Dasbor Pengelola Terpusat", desc: "Kelola katalog layanan, harga, dan cakupan wilayah secara mandiri." },
                  { title: "Manajemen Teknisi Lapangan", desc: "Tugaskan order dan pantau lokasi serta status tugas teknisi Anda." },
                  { title: "Pembayaran & Invoice Instan", desc: "Sistem pencatatan otomatis untuk setiap transaksi yang selesai dikerjakan." }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-black/5 flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-[10px] font-bold text-black">{i + 1}</span>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-black">{benefit.title}</h4>
                      <p className="text-[11px] sm:text-xs text-gray-500 font-medium leading-normal">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <button
                  onClick={() => router.push("/auth/tenant-register")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-black hover:bg-black/90 text-white font-black text-sm transition-all shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                >
                  Mulai Kemitraan Sekarang
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right Dashboard Visual Mockup Column (Borderless Showcase instead of Card) */}
            <div className="lg:col-span-6 relative">
              {/* Subtle backglow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-72 w-72 rounded-full bg-black/[0.02] blur-[80px]" />

              <div className="w-full rounded-2xl border border-black/[0.08] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.05)] p-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b border-black/[0.05]">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-400" />
                    <div className="h-3 w-3 rounded-full bg-amber-400" />
                    <div className="h-3 w-3 rounded-full bg-green-400" />
                    <span className="text-[10px] font-bold text-gray-400 ml-2">portal-kemitraan.fixit.id</span>
                  </div>
                  <span className="text-[10px] font-black text-black tracking-widest uppercase">Live Dashboard</span>
                </div>

                {/* Dashboard Metrics Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Order Hari Ini", val: "18", color: "text-black" },
                    { label: "Teknisi Aktif", val: "6 / 8", color: "text-emerald-600" },
                    { label: "Total Omset", val: "Rp 3.2M", color: "text-black" }
                  ].map((stat, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-gray-50 border border-black/[0.03] space-y-1">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                      <p className={`text-base font-black ${stat.color}`}>{stat.val}</p>
                    </div>
                  ))}
                </div>

                {/* Recent Task Mock */}
                <div className="space-y-3">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Tugas Berjalan</span>
                  
                  <div className="p-4 rounded-xl border border-black/[0.06] bg-white shadow-sm space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 text-[8px] font-bold uppercase tracking-wider">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Sedang Dikerjakan
                        </span>
                        <h4 className="text-xs font-black text-black leading-tight">Perbaikan Instalasi Listrik Rumah</h4>
                      </div>
                      <span className="text-xs font-bold text-black shrink-0">Rp 350.000</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-black/[0.03] text-[10px] font-bold text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-gray-100 border border-black/5 relative overflow-hidden">
                          <Image
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100"
                            alt="avatar"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span>Teknisi: Hendra Wijaya</span>
                      </div>
                      <span className="text-gray-400">Jl. Margonda No. 12</span>
                    </div>
                  </div>
                </div>

                {/* Growth Chart Mock */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    <span>Grafik Kinerja Bulanan</span>
                    <span className="text-emerald-600">+24.8% Naik</span>
                  </div>
                  {/* Stylized bar representation */}
                  <div className="h-8 flex items-end gap-1.5 pt-1">
                    {[35, 45, 60, 50, 75, 90, 85, 95, 110, 120].map((h, i) => (
                      <div
                        key={i}
                        style={{ height: `${h}%` }}
                        className={`w-full rounded-t-sm transition-all duration-500 ${
                          i === 9 ? "bg-black" : "bg-black/10"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Selected Tenant Services Drawer / Modal */}
      <AnimatePresence>
        {selectedTenant && (
          <div className="fixed inset-0 z-[80] flex items-center justify-end px-0 sm:px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTenant(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 250 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 250 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-lg h-full sm:h-[calc(100vh-2rem)] sm:my-4 sm:mr-4 sm:rounded-2xl bg-white/95 backdrop-blur-xl border border-black/[0.05] sm:border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.12)] flex flex-col overflow-hidden z-10"
            >
              <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                  width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                  background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                  background-color: rgba(0, 0, 0, 0.08);
                  border-radius: 9px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                  background-color: rgba(0, 0, 0, 0.16);
                }
              `}} />

              {/* Header */}
              <div className="p-6 border-b border-black/[0.04] flex items-center justify-between bg-gradient-to-b from-gray-50/50 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 relative rounded-xl overflow-hidden border border-black/5 ring-4 ring-black/[0.01]">
                    <Image
                      src={selectedTenant.image_url}
                      alt={selectedTenant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-gray-900 flex items-center gap-1.5 leading-tight">
                      {selectedTenant.name}
                      <Shield className="h-4 w-4 text-indigo-600 fill-indigo-50 shrink-0" />
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Katalog Layanan</span>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <span className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider">Terverifikasi</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTenant(null)}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-black/5 text-gray-400 hover:text-gray-950 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Services List Content */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
                <div className="p-4 rounded-xl bg-gray-50/60 border border-black/[0.03] space-y-1.5">
                  <p className="text-[11px] font-bold text-gray-400">Tentang Mitra</p>
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">{selectedTenant.desc}</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-400">Jasa Yang Ditawarkan</h4>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {tenantServices.length} Layanan
                    </span>
                  </div>

                  {loadingServices ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse h-28 rounded-2xl bg-gray-50 border border-black/[0.02]" />
                      ))}
                    </div>
                  ) : tenantServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center rounded-2xl border border-dashed border-black/10 bg-gray-50/30">
                      <Briefcase className="h-8 w-8 text-gray-300 mb-2.5" />
                      <p className="text-xs font-bold text-gray-500">Tidak ada layanan aktif</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Mitra belum menambahkan layanan ke katalog mereka.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {tenantServices.map((service) => (
                        <div
                          key={service.id}
                          className="group p-4 rounded-2xl border border-black/[0.04] bg-white hover:border-indigo-600/30 hover:shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 flex items-start gap-4"
                        >
                          <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-50 border border-black/[0.03] shrink-0">
                            <Image
                              src={service.img}
                              alt={service.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>

                          <div className="flex-grow space-y-1 min-w-0 flex flex-col h-full justify-between">
                            <div>
                              <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-[8px] font-bold text-indigo-600 uppercase tracking-wider leading-none mb-1">
                                {service.category}
                              </span>
                              <h5 className="font-bold text-sm text-gray-950 truncate leading-tight group-hover:text-indigo-600 transition-colors">
                                {service.title}
                              </h5>
                              <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1 line-clamp-2">
                                {service.desc}
                              </p>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-gray-50 mt-2">
                              <span className="text-sm font-extrabold text-gray-900">
                                Rp {service.price.toLocaleString("id-ID")}
                              </span>
                              <button
                                onClick={() => handleBookService(service)}
                                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all duration-200 shadow-sm hover:shadow shadow-indigo-100 active:scale-95 cursor-pointer"
                              >
                                Pesan Jasa
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {/* Bottom Spacer to ensure space below the last card */}
                <div className="h-4" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Booking Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        service={selectedService}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          show={!!toast}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}