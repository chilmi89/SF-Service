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
import { tenantService } from "@/lib/api/(tenant)/tenant.service";
import { layananService } from "@/lib/api/layanan.service";
import BookingModal from "@/components/BookingModal";
import { Toast } from "@/components/toast";

// Fallback Mock Tenants matching the database schema for a gorgeous premium display
const FALLBACK_TENANTS = [
  {
    id: "tenant-1",
    name: "PT Digital Cool Nusantara",
    slug: "pt-digital-cool-nusantara",
    address: "Jl. HR Rasuna Said No. 10, Kuningan, Jakarta Selatan",
    phone: "0812-3456-7890",
    image_url: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?auto=format&fit=crop&q=80&w=800",
    kode_tenant: "COOL",
    rating: 4.9,
    ordersCount: 320,
    categories: ["Servis AC", "Listrik"],
    desc: "Spesialis perawatan pendingin ruangan (HVAC) dan instalasi listrik perkantoran maupun hunian dengan teknisi bersertifikat nasional."
  },
  {
    id: "tenant-2",
    name: "Sanitasi Prima Jaya",
    slug: "sanitasi-prima-jaya",
    address: "Ruko Gading Serpong Block A/5, Tangerang",
    phone: "0818-9876-5432",
    image_url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    kode_tenant: "PIPE",
    rating: 4.8,
    ordersCount: 195,
    categories: ["Pipa Air", "Pertukangan"],
    desc: "Solusi cepat kebocoran pipa, wastafel tersumbat, instalasi tandon air, dan pompa air mati. Siaga melayani wilayah Jabodetabek."
  },
  {
    id: "tenant-3",
    name: "CV Elektro Mandiri",
    slug: "cv-elektro-mandiri",
    address: "Jl. Margonda Raya No. 45, Depok, Jawa Barat",
    phone: "0857-1122-3344",
    image_url: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=800",
    kode_tenant: "ELEC",
    rating: 5.0,
    ordersCount: 412,
    categories: ["Listrik", "Elektronik"],
    desc: "Pemasangan instalasi listrik rumah baru, perbaikan korsleting, perapihan kabel panel MCB, dan servis barang elektronik rumah tangga."
  },
  {
    id: "tenant-4",
    name: "Teknik Sejahtera Bersama",
    slug: "teknik-sejahtera-bersama",
    address: "Kompleks Harapan Indah Block C/12, Bekasi",
    phone: "0813-5566-7788",
    image_url: "https://images.unsplash.com/photo-1610557892470-76d747eed2f1?auto=format&fit=crop&q=80&w=800",
    kode_tenant: "TECH",
    rating: 4.7,
    ordersCount: 85,
    categories: ["Elektronik", "Servis AC"],
    desc: "Penyedia jasa reparasi mesin cuci, kulkas, smart TV, microwave, dan AC split rumah tangga dengan garansi sparepart orisinal."
  },
  {
    id: "tenant-5",
    name: "Karya Kayu Abadi",
    slug: "karya-kayu-abadi",
    address: "Jl. KH Mas Mansyur No. 88, Tanah Abang, Jakarta Pusat",
    phone: "0899-8877-6655",
    image_url: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800",
    kode_tenant: "WOOD",
    rating: 4.9,
    ordersCount: 140,
    categories: ["Pertukangan"],
    desc: "Bengkel kayu profesional melayani pembuatan lemari kustom, kitchen set, perbaikan engsel pintu, pengecatan ulang, dan pasang wallpaper."
  }
];

// Fallback Mock Services to load when viewing a tenant's details
const FALLBACK_SERVICES = [
  {
    id: "fb-1",
    tenantName: "PT Digital Cool Nusantara",
    title: "Servis AC Split Rutin & Cuci AC",
    category: "Servis AC",
    img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800",
    price: 75000,
    desc: "Layanan cuci AC, pengecekan tekanan freon, dan pembersihan filter udara untuk AC split 0.5 - 2 PK."
  },
  {
    id: "fb-2",
    tenantName: "Sanitasi Prima Jaya",
    title: "Deteksi & Perbaikan Pipa Bocor",
    category: "Pipa Air",
    img: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80&w=800",
    price: 150000,
    desc: "Deteksi kebocoran pipa air bersih/kotor di dalam dinding dengan sensor ultrasonik serta perbaikan cepat."
  },
  {
    id: "fb-3",
    tenantName: "CV Elektro Mandiri",
    title: "Instalasi Panel Listrik & Panel MCB",
    category: "Listrik",
    img: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?auto=format&fit=crop&q=80&w=800",
    price: 250000,
    desc: "Pemasangan instalasi listrik baru, pembagian beban MCB, dan perapihan jalur kabel utama rumah."
  },
  {
    id: "fb-4",
    tenantName: "Teknik Sejahtera Bersama",
    title: "Reparasi Mesin Cuci Front Load",
    category: "Elektronik",
    img: "https://images.unsplash.com/photo-1610557892470-76d747eed2f1?auto=format&fit=crop&q=80&w=800",
    price: 175000,
    desc: "Perbaikan modul eror, pergantian dinamo, pintu macet, atau pipa pembuangan mesin cuci tersumbat."
  },
  {
    id: "fb-5",
    tenantName: "Karya Kayu Abadi",
    title: "Pembuatan & Perbaikan Lemari Custom",
    category: "Pertukangan",
    img: "https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=800",
    price: 350000,
    desc: "Perbaikan engsel pintu lemari, pembuatan rak kayu kustom, pengecatan ulang, dan restorasi furnitur kayu."
  },
  {
    id: "fb-6",
    tenantName: "Sanitasi Prima Jaya",
    title: "Instalasi Water Heater Listrik/Gas",
    category: "Pipa Air",
    img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    price: 200000,
    desc: "Pemasangan unit water heater baru lengkap dengan instalasi pipa air panas dan instalasi kran mixer."
  },
  {
    id: "fb-7",
    tenantName: "PT Digital Cool Nusantara",
    title: "Tambah Freon AC (R22 / R32 / R410)",
    category: "Servis AC",
    img: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800",
    price: 120000,
    desc: "Pengisian freon AC sesuai kapasitas PK dan jenis gas pendingin untuk mengembalikan suhu dingin maksimal."
  }
];

export default function PartnersDirectoryPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Search and Loading States
  const [searchQuery, setSearchQuery] = useState("");
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Selected Tenant Modal & Services States
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [tenantServices, setTenantServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Booking Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  // Toast State
  const [toast, setToast] = useState<{ title: string; message: string; type: "success" | "error" | "warning" } | null>(null);

  // Fetch Tenants on Mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoading(true);
        const res = await tenantService.getAllTenants();
        let rawData = res?.data;
        if (rawData && !Array.isArray(rawData)) {
          if (Array.isArray(rawData.data)) rawData = rawData.data;
          else rawData = [rawData];
        }
        const dataArray = Array.isArray(rawData) ? rawData : [];

        if (dataArray.length > 0) {
          // Map database tenants and merge with design extras (rating, categories list)
          const mapped = dataArray.map((item: any, idx: number) => {
            const fallbackExtra = FALLBACK_TENANTS[idx % FALLBACK_TENANTS.length];
            const hasValidImage = item.image_url && typeof item.image_url === "string" && 
              (item.image_url.startsWith("http") || item.image_url.startsWith("/"));
            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              address: item.address || "Alamat tidak dicantumkan",
              phone: item.phone || "No telepon tidak dicantumkan",
              image_url: hasValidImage ? item.image_url : fallbackExtra.image_url,
              kode_tenant: item.kode_tenant,
              rating: fallbackExtra.rating,
              ordersCount: fallbackExtra.ordersCount,
              categories: fallbackExtra.categories,
              desc: fallbackExtra.desc
            };
          });
          setTenants(mapped);
        } else {
          setTenants(FALLBACK_TENANTS);
        }
      } catch (err) {
        console.error("Gagal memuat tenant dari API, memuat fallback:", err);
        setTenants(FALLBACK_TENANTS);
      } finally {
        setLoading(false);
      }
    };
    fetchTenants();
  }, []);

  // Fetch Services for Selected Tenant
  const handleViewServices = async (tenant: any) => {
    setSelectedTenant(tenant);
    setLoadingServices(true);
    setTenantServices([]);

    try {
      // 1. Fetch categories for mapping
      let categoryMap: Record<number, string> = {};
      try {
        const catRes = await layananService.getAllKategori();
        const catData = catRes?.data || catRes;
        const categoriesList = Array.isArray(catData) ? catData : (Array.isArray(catData.data) ? catData.data : []);
        categoriesList.forEach((c: any) => {
          if (c.id && c.nama) categoryMap[c.id] = c.nama;
        });
      } catch (e) {
        console.error("Error categories mapping:", e);
      }

      // 2. Fetch all services
      const res = await layananService.getAllLayanan();
      let rawData = res?.data;
      if (rawData && !Array.isArray(rawData)) {
        if (Array.isArray(rawData.data)) rawData = rawData.data;
        else if (Array.isArray(rawData.layanan)) rawData = rawData.layanan;
        else rawData = [rawData];
      }
      const dataArray = Array.isArray(rawData) ? rawData : [];

      // Filter services belonging to this tenant name/id
      const filtered = dataArray
        .filter((item: any) => {
          // Check match either by tenant_id or tenant code or name
          return (
            item.tenant_id === tenant.id ||
            item.tenants?.name?.toLowerCase() === tenant.name.toLowerCase()
          );
        })
        .map((item: any) => {
          const hasValidImg = item.gambar && typeof item.gambar === "string" && 
            (item.gambar.startsWith("http") || item.gambar.startsWith("/"));
          const hasValidAvatar = tenant.image_url && typeof tenant.image_url === "string" && 
            (tenant.image_url.startsWith("http") || tenant.image_url.startsWith("/"));
          return {
            id: item.layanan_id || item.id,
            title: item.nama_layanan || "Layanan",
            category: (item.id_kategori && categoryMap[item.id_kategori]) || item.kategori || "Servis AC",
            img: hasValidImg ? item.gambar : "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800",
            price: item.harga_dasar || 0,
            desc: item.descripsi || "Dapatkan pengerjaan service rumah rapi, aman, dan bergaransi.",
            tech: tenant.name,
            avatar: hasValidAvatar ? tenant.image_url : "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150"
          };
        });

      if (filtered.length > 0) {
        setTenantServices(filtered);
      } else {
        // Fallback services filtered by tenant name
        const mockFiltered = FALLBACK_SERVICES
          .filter((s) => s.tenantName === tenant.name)
          .map((s) => ({
            id: s.id,
            title: s.title,
            category: s.category,
            img: s.img,
            price: s.price,
            desc: s.desc,
            tech: tenant.name,
            avatar: tenant.image_url
          }));
        setTenantServices(mockFiltered.length > 0 ? mockFiltered : FALLBACK_SERVICES.slice(0, 3).map(s => ({
          ...s,
          tech: tenant.name,
          avatar: tenant.image_url
        })));
      }
    } catch (e) {
      console.error("Error fetching services for tenant:", e);
      // Fallback
      setTenantServices(FALLBACK_SERVICES.slice(0, 3).map(s => ({
        ...s,
        tech: tenant.name,
        avatar: tenant.image_url
      })));
    } finally {
      setLoadingServices(false);
    }
  };

  const handleBookService = (service: any) => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setToast({
        title: "Login Diperlukan",
        message: "Silakan login ke akun Anda terlebih dahulu untuk memesan layanan ini.",
        type: "warning",
      });
      setTimeout(() => {
        router.push("/auth/login");
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
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Panel */}
            <motion.div
              initial={{ opacity: 0, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 200 }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="relative w-full max-w-xl h-full sm:h-[95vh] sm:rounded-3xl bg-white shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Header */}
              <div className="p-6 border-b border-black/[0.06] flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 relative rounded-full overflow-hidden border border-black/10">
                    <Image
                      src={selectedTenant.image_url}
                      alt={selectedTenant.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-black flex items-center gap-1.5 leading-tight">
                      {selectedTenant.name}
                      <Shield className="h-4 w-4 text-emerald-600 fill-emerald-50 text-xs shrink-0" />
                    </h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-none">Catalog Layanan</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTenant(null)}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-black/5 hover:bg-black/10 text-black transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Services List Content */}
              <div className="flex-grow overflow-y-auto p-6 space-y-6">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tentang Perusahaan</p>
                  <p className="text-xs text-gray-500 leading-relaxed font-medium">{selectedTenant.desc}</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-black/[0.04]">
                  <h4 className="text-sm font-black uppercase tracking-wider text-black">Jasa Service Yang Ditawarkan</h4>

                  {loadingServices ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => (
                        <div key={i} className="animate-pulse h-24 rounded-2xl bg-gray-100" />
                      ))}
                    </div>
                  ) : tenantServices.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center rounded-2xl border border-dashed border-black/10 bg-gray-50/50">
                      <Briefcase className="h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-xs font-bold text-gray-500">Tidak ada layanan aktif</p>
                      <p className="text-[10px] text-gray-400">Mitra belum menambahkan layanan ke katalog mereka.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {tenantServices.map((service) => (
                        <div
                          key={service.id}
                          className="group p-4 rounded-2xl border border-black/[0.06] hover:border-black bg-white transition-all flex items-start gap-4"
                        >
                          <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                            <Image
                              src={service.img}
                              alt={service.title}
                              fill
                              className="object-cover"
                            />
                          </div>

                          <div className="flex-grow space-y-1 min-w-0">
                            <span className="inline-block px-2 py-0.5 rounded-full bg-black/5 text-[8px] font-bold text-gray-500 uppercase tracking-wider leading-none mb-1">
                              {service.category}
                            </span>
                            <h5 className="font-bold text-sm text-black truncate leading-tight group-hover:text-black/80">
                              {service.title}
                            </h5>
                            <p className="text-[11px] text-gray-400 font-medium leading-tight line-clamp-1">
                              {service.desc}
                            </p>
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs font-black text-black">
                                Rp {service.price.toLocaleString("id-ID")}
                              </span>
                              <button
                                onClick={() => handleBookService(service)}
                                className="px-3.5 py-1.5 rounded-lg bg-black hover:bg-black/90 text-white text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer"
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