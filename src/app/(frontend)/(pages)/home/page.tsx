"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
  ChevronLeft,
  ChevronRight, 
  ArrowUpRight, 
  Star, 
  Shield, 
  Layers, 
  Headphones, 
  Rocket,
  Wrench,
  Droplets,
  Zap,
  Hammer,
  Monitor,
  Heart,
  Eye,
  ChevronDown,
  SlidersHorizontal,
  LayoutGrid
} from "lucide-react";
import LiquidEther from "@/components/LiquidEther";
import BookingModal from "@/components/BookingModal";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";
import { layananService } from "@/lib/api/layanan.service";

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [likedServices, setLikedServices] = useState<Record<string, boolean>>({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: "success" | "error" | "warning" } | null>(null);

  const [services, setServices] = useState<any[]>([]);
  const [isFetchingServices, setIsFetchingServices] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const servicesSectionRef = useRef<HTMLDivElement>(null);

  const handleSearch = (query?: string, shouldResetCategory: boolean = true) => {
    if (query !== undefined) {
      setSearchQuery(query);
    }
    if (shouldResetCategory) {
      setActiveCategory("Semua");
    }
    setTimeout(() => {
      if (servicesSectionRef.current) {
        servicesSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 50);
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth * 0.75;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Ambil data kategori untuk dipetakan ke id_kategori
        const catRes = await layananService.getAllKategori();
        const catData = catRes?.data || catRes;
        const categoriesList = Array.isArray(catData) ? catData : (Array.isArray(catData.data) ? catData.data : []);
        
        const categoryMap: Record<number, string> = {};
        categoriesList.forEach((c: any) => {
          if (c.id && c.nama) {
            categoryMap[c.id] = c.nama;
          }
        });

        const res = await layananService.getAllLayanan();
        let rawData = res?.data;
        if (rawData && !Array.isArray(rawData)) {
          if (Array.isArray(rawData.data)) rawData = rawData.data;
          else if (Array.isArray(rawData.layanan)) rawData = rawData.layanan;
          else rawData = [rawData];
        }
        const dataArray = Array.isArray(rawData) ? rawData : [];
        
        const mapped = dataArray.map((item: any) => ({
          id: item.layanan_id || item.id,
          title: item.nama_layanan || "Layanan",
          category: (item.id_kategori && categoryMap[item.id_kategori]) || item.kategori || "Pendingin (HVAC)",
          img: item.gambar || "/images/ac.png",
          tech: item.tenants?.name || "Teknisi FixIt", 
          avatar: "/images/budi.png",
          likes: Math.floor(Math.random() * 100),
          views: `${(Math.random() * 10 + 1).toFixed(1)}k`,
          price: `Rp ${(item.harga_dasar || 0).toLocaleString('id-ID')}`,
        }));
        setServices(mapped);
      } catch (err) {
        console.error("Gagal mengambil data layanan beranda:", err);
      } finally {
        setIsFetchingServices(false);
      }
    };
    fetchServices();
  }, []);

  // Auto-open booking modal if there's a pending service from before login
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      const pendingServiceStr = localStorage.getItem("pending_booking_service");
      if (pendingServiceStr) {
        try {
          const pendingService = JSON.parse(pendingServiceStr);
          if (pendingService) {
            setSelectedService(pendingService);
            setIsBookingModalOpen(true);
          }
        } catch (e) {
          console.error("Gagal memproses pending service:", e);
        } finally {
          localStorage.removeItem("pending_booking_service");
        }
      }
    }
  }, [isLoading, isLoggedIn]);

  const filteredServices = services.filter(service => {
    const matchesCategory = activeCategory === "Semua" || 
      service.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = searchQuery.trim() === "" || 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.tech && service.tech.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-transparent text-black">
      <main className="relative z-10">

        <section className="px-8 lg:px-24 pt-32 lg:pt-0 relative overflow-hidden min-h-[80vh] lg:min-h-screen flex items-center justify-center">
          <div className="absolute inset-0 -z-10 bg-white">
            <LiquidEther
              colors={["#000000", "#111111", "#222222", "#333333"]}
              mouseForce={15}
              cursorSize={120}
              autoDemo={true}
              autoSpeed={0.3}
              autoIntensity={1.5}
              resolution={0.6}
            />
          </div>
          
          {/* Radial/Linear contrast gradient mask */}
          <div className="w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center max-w-7xl mx-auto mt-12 lg:mt-0">
            
            {/* Left Column: Typographic & Search Panel */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-8 space-y-6 flex flex-col items-start text-left"
            >
              {/* Premium Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-[9px] font-bold text-black uppercase tracking-wider"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-black"></span>
                </span>
                FixIt Platform Layanan
              </motion.div>

              {/* Minimalist Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tight text-black max-w-2xl">
                Servis Rumah <br />
                <span className="text-gray-400">Jadi Lebih Sederhana.</span>
              </h1>

              {/* Refined Subtitle */}
              <p className="max-w-xl text-xs sm:text-sm font-medium text-gray-500 leading-relaxed">
                Hubungkan kebutuhan perbaikan dan perawatan rumah Anda dengan jaringan penyedia jasa handal secara instan. Transparan, terverifikasi, dan bergaransi resmi.
              </p>

              {/* Elegant Search Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="w-full max-w-md pt-2"
              >
                <div className="relative flex w-full items-center rounded-2xl bg-white/80 backdrop-blur-xl border border-black/10 pl-4 pr-1.5 py-1.5 focus-within:border-black transition-all">
                  <Search className="h-4 w-4 text-gray-400 shrink-0" />
                  <input 
                    type="text" 
                    placeholder="Cari layanan servis (misal: AC, Pipa)..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch();
                      }
                    }}
                    className="w-full bg-transparent pl-3 pr-2 py-2 text-xs sm:text-sm font-semibold text-black outline-none placeholder:text-gray-400"
                  />
                  <button 
                    onClick={() => handleSearch()}
                    className="px-4 py-2 shrink-0 rounded-xl bg-black text-white font-bold text-xs hover:bg-black/90 transition-all active:scale-95"
                  >
                    Cari
                  </button>
                </div>
              </motion.div>

              {/* Quick Tags */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-[11px] sm:text-xs font-semibold text-gray-400"
              >
                <span>Populer:</span>
                {["Servis AC", "Pipa Bocor", "Instalasi Listrik"].map((tag, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      if (tag === "Servis AC") {
                        setActiveCategory("Pendingin");
                        setSearchQuery("");
                      } else if (tag === "Pipa Bocor") {
                        setActiveCategory("Sanitasi dan Air");
                        setSearchQuery("Pipa");
                      } else if (tag === "Instalasi Listrik") {
                        setActiveCategory("Kelistrikan");
                        setSearchQuery("Listrik");
                      } else {
                        setSearchQuery(tag);
                      }
                      handleSearch(undefined, false);
                    }}
                    className="text-black/60 hover:text-black transition-colors underline decoration-black/10 hover:decoration-black underline-offset-4 decoration-1 font-bold"
                  >
                    {tag}
                  </button>
                ))}
              </motion.div>
            </motion.div>

            {/* Right Column: Glassmorphic Live Operational Widget */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="lg:col-span-6 lg:col-start-9 w-full bg-white/40 border border-black/[0.06] backdrop-blur-xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)]"
            >
              {/* Widget Header with Pulse */}
              <div className="flex items-center justify-between border-b border-black/[0.06] pb-4">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Status Mitra</span>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">24 Teknisi Aktif</span>
                </div>
              </div>

              {/* Category Quick Price list */}
              <div className="space-y-4">
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Estimasi Harga Jasa</p>
                
                <div className="space-y-3">
                  {[
                    { name: "Servis & Cuci AC", price: "Mulai 75rb", status: "Tersedia", textClass: "text-emerald-600 bg-emerald-50" },
                    { name: "Instalasi Pipa & Kran", price: "Mulai 150rb", status: "Padat", textClass: "text-amber-600 bg-amber-50" },
                    { name: "Instalasi & Servis Listrik", price: "Mulai 100rb", status: "Tersedia", textClass: "text-emerald-600 bg-emerald-50" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-white/50 border border-black/[0.02] hover:border-black/10 transition-colors">
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-black">{item.name}</p>
                        <p className="text-[10px] font-medium text-gray-500">{item.price}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${item.textClass}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to action within widget */}
              <div className="pt-2">
                <button 
                  onClick={() => {
                    if (servicesSectionRef.current) {
                      servicesSectionRef.current.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="w-full py-3 rounded-2xl bg-black text-white text-xs font-black hover:bg-black/90 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  Lihat Semua Layanan
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>

            </motion.div>

          </div>
        </section>
        
        <section ref={servicesSectionRef} className="px-8 lg:px-24 py-16 border-t border-black/[0.05]">
          <div className="w-full">
            <div className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
              <div className="flex items-center w-full md:w-auto justify-between gap-2">
                <button className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:border-black">
                  Popular <ChevronDown className="h-4 w-4" />
                </button>
                <button className="md:hidden flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:border-black">
                  <SlidersHorizontal className="h-4 w-4" /> Filters
                </button>
              </div>
              <div className="flex overflow-x-auto items-center gap-6 md:gap-8 w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                {["Semua", "Kelistrikan", "Pendingin", "Sanitasi dan Air", "Struktur Ringan"].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => {
                      setActiveCategory(tab);
                      setSearchQuery("");
                    }}
                    className={`text-sm whitespace-nowrap font-bold transition-all hover:text-black ${activeCategory === tab ? "text-black border-b-2 border-black pb-1" : "text-[#a1a1a1]"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="hidden md:flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:border-black">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
            </div>
            {filteredServices.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                  {filteredServices.map((service, index) => (
                    <motion.div
                      key={service.id}
                      onClick={() => {
                        if (isLoading) return; // tunggu status auth selesai
                        if (!isLoggedIn) {
                          // Simpan layanan ke localStorage sebelum redirect
                          localStorage.setItem("pending_booking_service", JSON.stringify(service));
                          setToast({
                            title: "Login Diperlukan",
                            message: "Silakan login atau daftar sebagai user untuk memesan layanan ini.",
                            type: "warning"
                          });
                          setTimeout(() => {
                            router.push(`/auth/login?redirect=${window.location.pathname}`);
                          }, 2500);
                          return;
                        }
                        setSelectedService(service);
                        setIsBookingModalOpen(true);
                      }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.5 }}
                      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-black/[0.08] hover:border-black hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 cursor-pointer"
                    >
                      <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-[#f8f8f8]">
                        <Image
                          src={service.img}
                          alt={service.title}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-bold text-black uppercase tracking-wider shadow-sm">
                          {service.category}
                        </div>
                      </div>
                      
                      <div className="p-3.5 sm:p-4 flex flex-col flex-grow">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-sm leading-tight group-hover:text-black/80 transition-colors pr-2">{service.title}</h3>
                          <span className="text-xs sm:text-sm font-black text-black shrink-0 whitespace-nowrap">
                            {service.price}
                          </span>
                        </div>
                        
                        <div className="mt-auto pt-3 border-t border-black/[0.05] flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-100 border border-black/10">
                              <Image src={service.avatar} alt={service.tech} fill className="object-cover transition-all duration-500" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold">{service.tech}</span>
                              <span className="text-[9px] sm:text-[10px] font-medium text-[#666] flex items-center gap-0.5">
                                <Shield className="h-2.5 w-2.5 text-black/60" /> Verified
                              </span>
                            </div>
                          </div>
                          
                          <button className="relative inline-flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-black/10 group-hover:bg-black transition-all duration-150">
                            <div className="-rotate-45 transition-transform duration-150 group-hover:rotate-0 text-black group-hover:text-white">
                              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4">
                                <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                              </svg>
                            </div>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {filteredServices.length > 20 && (
                  <div className="mt-20 flex justify-center">
                    <button className="rounded-2xl border border-black/10 bg-black px-8 py-3 text-sm text-white font-medium shadow-sm transition-all hover:border-black active:scale-95">
                      Show more
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                <p className="text-gray-400 font-bold text-sm">Tidak ada layanan yang cocok dengan pencarian Anda.</p>
                <button 
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("Semua");
                  }} 
                  className="px-5 py-2.5 rounded-xl bg-black text-white font-bold text-xs transition-all active:scale-95 hover:bg-black/90 shadow-sm"
                >
                  Reset Pencarian
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="px-8 lg:px-24 py-16 bg-white border-t border-black/[0.05]">
          <div className="w-full max-w-7xl mx-auto">
            {/* Section Header with Slider Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.03] border border-black/10 text-[9px] font-bold text-black uppercase tracking-widest">
                  Promo & Program Unggulan
                </span>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-black">
                  Penawaran Spesial Untuk Anda
                </h2>
                <p className="text-sm text-gray-500 font-medium">
                  Jelajahi program khusus, keuntungan tambahan, dan jaminan terbaik untuk perbaikan rumah Anda.
                </p>
              </div>
              
              {/* Navigation Controls */}
              <div className="flex gap-2 shrink-0 self-end sm:self-auto">
                <button 
                  onClick={() => scroll("left")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black hover:bg-black hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => scroll("right")}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black hover:bg-black hover:text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Horizontal Promo Slider */}
            <div 
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-6 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {[
                { 
                  label: "GARANSI RESMI", 
                  badge: "PROMO",
                  image: "/images/hero.png", 
                  title: "FixIt Secure", 
                  desc: "Garansi resmi layanan hingga 30 hari untuk ketenangan pikiran Anda.",
                  views: "12k", 
                  likes: 88,
                  badgeBg: "bg-emerald-500"
                },
                { 
                  label: "TEKNISI AHLI", 
                  badge: "TERBAIK",
                  image: "/images/hendra.png", 
                  title: "FixIt Expert", 
                  desc: "Hanya bekerja dengan teknisi bersertifikat dan berating tinggi.",
                  views: "8.1k", 
                  likes: 54,
                  badgeBg: "bg-amber-500"
                },
                { 
                  label: "HARGA JUJUR", 
                  badge: "HEMAT",
                  image: "/images/card.png", 
                  title: "FixIt Price", 
                  desc: "Biaya transparan di awal tanpa ada biaya tersembunyi/siluman.",
                  views: "15.2k", 
                  likes: 164,
                  badgeBg: "bg-blue-600"
                },
                { 
                  label: "LAYANAN CEPAT", 
                  badge: "KILAT",
                  image: "/images/automotive.png", 
                  title: "FixIt Speed", 
                  desc: "Respon super cepat dalam hitungan menit untuk kendala darurat.",
                  views: "5.4k", 
                  likes: 47,
                  badgeBg: "bg-rose-500"
                },
                { 
                  label: "SUKU CADANG", 
                  badge: "ASLI",
                  image: "/images/plumbing.png", 
                  title: "FixIt Parts", 
                  desc: "Jaminan suku cadang original dengan standar kualitas terbaik.",
                  views: "9.2k", 
                  likes: 92,
                  badgeBg: "bg-indigo-600"
                },
                { 
                  label: "SUPPORT 24/7", 
                  badge: "SIAGA",
                  image: "/images/maya.png", 
                  title: "FixIt Care", 
                  desc: "Bantuan dan konsultasi kapan saja, siang malam siap melayani.",
                  views: "6.1k", 
                  likes: 58,
                  badgeBg: "bg-neutral-900"
                },
                { 
                  label: "TERPERCAYA", 
                  badge: "VERIFIED",
                  image: "/images/budi.png", 
                  title: "FixIt Trust", 
                  desc: "Telah dipercaya menyelesaikan lebih dari 10,000+ perbaikan rumah.",
                  views: "11.1k", 
                  likes: 120,
                  badgeBg: "bg-violet-600"
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="w-[280px] sm:w-[320px] shrink-0 snap-start relative aspect-[16/11] sm:aspect-[16/10] overflow-hidden rounded-2xl border border-black/[0.06] bg-gray-50 cursor-pointer group hover:shadow-lg transition-all duration-300"
                >
                  {/* Background Image */}
                  <div className="absolute inset-0 z-0">
                    <Image 
                      src={item.image}
                      alt={item.label}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    {/* Soft gradient bottom depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent group-hover:opacity-0 transition-opacity duration-300" />
                  </div>

                  {/* Always Visible Top Badges (Fade out on hover) */}
                  <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center group-hover:opacity-0 transition-opacity duration-300">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">
                      {item.label}
                    </span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-white shadow-sm ${item.badgeBg}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Hover Overlay containing all details */}
                  <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5 text-white">
                    {/* Action arrow button inside card */}
                    <div className="absolute top-4 right-4 transform translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 delay-75">
                      <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </div>
                    </div>

                    {/* Info sliding up on hover */}
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 ease-out space-y-1">
                      <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">
                        {item.title}
                      </span>
                      <h3 className="text-base font-black tracking-tight leading-tight">
                        {item.label}
                      </h3>
                      <p className="text-white/70 text-[11px] font-medium leading-normal line-clamp-2 pt-0.5">
                        {item.desc}
                      </p>

                      {/* Stats Footer */}
                      <div className="flex items-center gap-3 pt-2.5 border-t border-white/10 mt-2.5">
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3 fill-white text-white" />
                          <span className="text-[10px] font-bold">{item.likes}</span>
                        </div>
                        <div className="flex items-center gap-1 opacity-70">
                          <Eye className="h-3 w-3 text-white" />
                          <span className="text-[10px] font-bold">{item.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={isBookingModalOpen} 
        onClose={() => setIsBookingModalOpen(false)} 
        service={selectedService} 
      />

      {/* Toast Notification */}
      <Toast 
        show={!!toast} 
        title={toast?.title} 
        message={toast?.message || ""} 
        type={toast?.type} 
        onClose={() => setToast(null)} 
      />
    </div>
  );
}
