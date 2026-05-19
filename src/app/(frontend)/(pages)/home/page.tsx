"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Search, 
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

export default function Home() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [likedServices, setLikedServices] = useState<Record<string, boolean>>({});
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [toast, setToast] = useState<{ title: string; message: string; type: "success" | "error" | "warning" } | null>(null);

  const services = [
    { id: "1", title: "Servis & Cuci AC", category: "Servis AC", img: "/images/ac.png", tech: "Budi Santoso", avatar: "/images/budi.png", likes: 88, views: "8.1k", height: 450 },
    { id: "2", title: "Instalasi Pipa Air", category: "Pipa Air", img: "/images/plumbing.png", tech: "Maya Kartika", avatar: "/images/maya.png", likes: 54, views: "5.4k", height: 300 },
    { id: "3", title: "Reparasi Elektronik", category: "Elektronik", img: "/images/hero.png", tech: "Hendra Wijaya", avatar: "/images/hendra.png", likes: 164, views: "10.2k", height: 380 },
    { id: "4", title: "Servis Mesin Cuci", category: "Elektronik", img: "/images/feature.png", tech: "Budi Santoso", avatar: "/images/budi.png", likes: 47, views: "3.3k", height: 350 },
    { id: "5", title: "Pasang Tandon Air", category: "Pipa Air", img: "/images/card.png", tech: "Maya Kartika", avatar: "/images/maya.png", likes: 58, views: "1.1k", height: 420 },
    { id: "6", title: "Perbaikan Atap", category: "Pertukangan", img: "/images/feature.png", tech: "Hendra Wijaya", avatar: "/images/hendra.png", likes: 92, views: "4.5k", height: 340 },
    { id: "7", title: "Instalasi Listrik", category: "Listrik", img: "/images/hero.png", tech: "Budi Santoso", avatar: "/images/budi.png", likes: 120, views: "7.8k", height: 400 },
    { id: "8", title: "Servis Pompa Air", category: "Pipa Air", img: "/images/plumbing.png", tech: "Maya Kartika", avatar: "/images/maya.png", likes: 43, views: "2.1k", height: 320 },
    { id: "9", title: "Perbaikan Kulkas", category: "Elektronik", img: "/images/ac.png", tech: "Hendra Wijaya", avatar: "/images/hendra.png", likes: 76, views: "5.9k", height: 360 },
    { id: "10", title: "Pembersihan Tandon", category: "Pipa Air", img: "/images/card.png", tech: "Budi Santoso", avatar: "/images/budi.png", likes: 88, views: "8.1k", height: 410 },
  ];

  const filteredServices = activeCategory === "Semua" 
    ? services 
    : services.filter(service => service.category === activeCategory);

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

          <div className="w-full relative z-10 flex flex-col items-center text-center mt-8 lg:mt-0 max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8 flex flex-col items-center"
            >
              {/* Premium Badge */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/[0.03] border border-black/10 text-xs font-bold text-black uppercase tracking-widest backdrop-blur-md"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-40"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-black"></span>
                </span>
                FixIt Platform Layanan
              </motion.div>

              {/* Minimalist Heading */}
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-black leading-[1.05] tracking-tighter text-black">
                Rumah Nyaman <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-black via-gray-600 to-black">
                  Tanpa Beban.
                </span>
              </h1>

              {/* Refined Subtitle */}
              <p className="max-w-2xl text-base sm:text-lg lg:text-xl font-medium text-gray-600 leading-relaxed px-4">
                Solusi cerdas untuk segala kebutuhan perbaikan rumah Anda. Dari instalasi hingga perbaikan dengan teknisi ahli & harga transparan.
              </p>

              {/* Elegant Search Bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="w-full max-w-2xl pt-6 px-4 sm:px-0"
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-black/5 rounded-full blur-xl group-hover:bg-black/10 transition-all duration-500" />
                  <div className="relative flex w-full items-center rounded-full bg-white/80 backdrop-blur-xl border border-white/50 pl-6 pr-2 shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all focus-within:ring-4 focus-within:ring-black/5 focus-within:border-black/20 focus-within:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)]">
                    <Search className="h-5 w-5 text-gray-400 shrink-0" />
                    <input 
                      type="text" 
                      placeholder="Cari layanan servis (misal: AC, Pipa)..." 
                      className="w-full bg-transparent px-4 py-4 sm:py-5 text-sm sm:text-base font-semibold text-black outline-none placeholder:text-gray-400"
                    />
                    <button className="grid h-12 w-12 sm:h-14 sm:w-14 shrink-0 place-items-center rounded-full bg-black text-white shadow-lg transition-transform duration-300 hover:scale-105 active:scale-95">
                      <Search className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Quick Tags */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap justify-center items-center gap-2 pt-2"
              >
                <span className="text-xs font-semibold text-gray-500 mr-2">Populer:</span>
                {["Servis AC", "Pipa Bocor", "Instalasi Listrik"].map((tag, i) => (
                  <button key={i} className="px-4 py-1.5 rounded-full bg-black/5 text-xs font-bold text-gray-600 hover:bg-black hover:text-white transition-all hover:shadow-md hover:-translate-y-0.5">
                    {tag}
                  </button>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        <section className="px-8 lg:px-24 py-16 border-t border-black/[0.05]">
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
                {["Semua", "Servis AC", "Pipa Air", "Listrik", "Elektronik", "Pertukangan"].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveCategory(tab)}
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 min-h-[500px]">
              {filteredServices.map((service, index) => (
                <motion.div
                  key={service.id}
                  onClick={() => {
                    if (isLoading) return; // tunggu status auth selesai
                    if (!isLoggedIn) {
                      setToast({
                        title: "Login Diperlukan",
                        message: "Silakan login atau daftar sebagai user untuk memesan layanan ini.",
                        type: "warning"
                      });
                      setTimeout(() => {
                        router.push("/auth/login");
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
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setLikedServices(prev => ({...prev, [service.id]: !prev[service.id]}));
                        }}
                        className={`flex items-center gap-1 border px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-bold shrink-0 transition-colors ${
                          likedServices[service.id] 
                            ? "bg-red-50 border-red-100 text-red-600" 
                            : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <Heart className={`h-2.5 w-2.5 sm:h-3 sm:w-3 transition-colors ${
                          likedServices[service.id] ? "fill-red-500 text-red-500" : "fill-transparent text-gray-400"
                        }`} />
                        <span>{likedServices[service.id] ? service.likes + 1 : service.likes}</span>
                      </button>
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
          </div>
        </section>

        <section className="py-24 bg-white overflow-hidden border-t border-black/[0.05]">
          <div className="flex relative">
            <motion.div 
              className="flex gap-8 px-6"
              animate={{ x: [0, -1650] }} 
              transition={{ 
                duration: 35, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            >
              {[...Array(3)].map((_, groupIndex) => (
                <div key={groupIndex} className="flex gap-8">
                  {[
                    { label: "GARANSI RESMI", image: "/images/hero.png", tech: "FixIt Secure", views: "12k", likes: 88 },
                    { label: "TEKNISI AHLI", image: "/images/hendra.png", tech: "FixIt Expert", views: "8.1k", likes: 54 },
                    { label: "HARGA JUJUR", image: "/images/card.png", tech: "FixIt Price", views: "15.2k", likes: 164 },
                    { label: "LAYANAN CEPAT", image: "/images/automotive.png", tech: "FixIt Speed", views: "5.4k", likes: 47 },
                    { label: "SUPPORT 24/7", image: "/images/maya.png", tech: "FixIt Care", views: "6.1k", likes: 58 },
                    { label: "SUKU CADANG", image: "/images/plumbing.png", tech: "FixIt Parts", views: "9.2k", likes: 92 },
                    { label: "TERPERCAYA", image: "/images/budi.png", tech: "FixIt Trust", views: "11.1k", likes: 120 },
                  ].map((item, i) => (
                    <div 
                      key={i}
                      className="group cursor-pointer w-[180px] shrink-0"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-black/[0.05] bg-gray-50">
                        <Image 
                          src={item.image}
                          alt={item.label}
                          fill
                          unoptimized
                          className="object-cover transition-all duration-700 group-hover:scale-110"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100 flex flex-col justify-between p-4 text-white">
                          <div className="flex w-full items-center justify-between transform translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-500">
                            <span className="text-xs font-bold truncate pr-2">{item.label}</span>
                            <button className="group relative inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-neutral-950">
                              <div className="-rotate-45 transition duration-300 group-hover:rotate-0">
                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-neutral-200">
                                  <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                                </svg>
                              </div>
                            </button>
                          </div>

                          <div className="flex items-center justify-between transform translate-y-[10px] group-hover:translate-y-0 transition-transform duration-500">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-[10px] font-black text-white">
                                F
                              </div>
                              <span className="text-[10px] font-bold truncate max-w-[70px]">{item.tech}</span>
                            </div>

                            <div className="flex items-center gap-2.5">
                              <div className="flex items-center gap-1">
                                <Heart className="h-3 w-3 fill-white" />
                                <span className="text-[9px] font-bold">{item.likes}</span>
                              </div>
                              <div className="flex items-center gap-1 opacity-70">
                                <Eye className="h-3 w-3" />
                                <span className="text-[9px] font-bold">{item.views}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
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
