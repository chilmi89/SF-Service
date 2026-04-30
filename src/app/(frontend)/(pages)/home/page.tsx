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
import Masonry from "@/components/Masonry";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("Semua");

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

        <section className="px-8 lg:px-24 pt-20 pb-16 relative overflow-hidden min-h-screen flex items-center">
          {/* Background Liquid Ether */}
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
          
          <div className="w-full relative z-10 pt-10">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
              <div className="space-y-12">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <h1 className="text-6xl font-bold leading-[1.1] tracking-wighter">
                    Rumah Nyaman 
                    Tanpa Beban 
                    <span className="text-[#a1a1a1]"> bersama FixIt.</span>
                  </h1>
                  <p className="max-w-2xl text-md font-medium text-[#666]">
                    Solusi terpercaya untuk segala kebutuhan perbaikan rumah Anda. Dari instalasi listrik hingga perbaikan pipa, teknisi ahli kami siap membantu dengan layanan berkualitas dan harga transparan.
                  </p>
                </motion.div>

                <div className="space-y-8">
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative flex w-full max-w-2xl items-center"
                  >
                    <div className="flex w-full items-center rounded-full bg-[rgb(242,242,245)] pl-3 pr-2 shadow-sm transition-all focus-within:ring-2 focus-within:ring-black/5">
                      <div className="flex w-full items-center px-4">
                        <Search className="h-5 w-5 text-[#a1a1a1]" />
                        <input 
                          type="text" 
                          placeholder="Cari jasa servis (misal: AC, perbaikan pipa...)" 
                          className="w-full bg-transparent px-4 py-4 text-md font-small text-black outline-none placeholder:text-[#a1a1a1]"
                        />
                      </div>
                      <button className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-black text-white shadow-lg transition-all hover:scale-105 active:scale-95">
                        <Search className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative aspect-square w-96 max-w-lg lg:ml-auto"
              >
                <div className="relative h-full w-full overflow-hidden rounded-2xl bg-gray-50 shadow-[0_40px_100px_rgba(0,0,0,0.08)]">
                  <Image 
                    src="/images/hero.png" 
                    alt="Servis Rumah" 
                    fill 
                    priority
                    className="object-cover grayscale transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent" />
                </div>
                
                <div className="absolute -z-10 -top-20 -right-20 h-96 w-96 rounded-full bg-black/[0.02] blur-[100px]" />
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="px-8 lg:px-24 py-16 border-t border-black/[0.05]">
          <div className="w-full">
            <div className="mb-12 flex items-center justify-between">
              <button className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:border-black">
                Popular <ChevronDown className="h-4 w-4" />
              </button>
              <div className="hidden items-center gap-8 lg:flex">
                {["Semua", "Servis AC", "Pipa Air", "Listrik", "Elektronik", "Pertukangan"].map((tab) => (
                  <button 
                    key={tab} 
                    onClick={() => setActiveCategory(tab)}
                    className={`text-sm font-bold transition-all hover:text-black ${activeCategory === tab ? "text-black border-b-2 border-black pb-1" : "text-[#a1a1a1]"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:border-black">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
            </div>
            <div className="min-h-[1000px]">
              <Masonry 
                items={filteredServices} 
                animateFrom="bottom"
                stagger={0.03}
                duration={0.7}
              />
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
                          className="object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100 flex flex-col justify-between p-4 text-white">
                          <div className="flex w-full items-center justify-between transform translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-500">
                            <span className="text-xs font-bold truncate pr-2">{item.label}</span>
                            <div className="h-7 w-7 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
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
    </div>
  );
}
