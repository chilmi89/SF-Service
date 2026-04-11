"use client";

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

export default function Home() {
  return (
    <div className="min-h-screen bg-transparent text-black">
      <main className="relative z-10">
        
        {/* HERO SECTION */}
        <section className="px-8 lg:px-24 pt-44 pb-16 relative overflow-hidden">
          <div className="w-full">
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
                  <p className="max-w-md text-md font-medium text-[#666]">
                    Temukan teknisi profesional untuk segala kebutuhan servis rumah Anda. Cepat, transparan, dan bergaransi resmi.
                  </p>
                </motion.div>

                <div className="space-y-8">
                  {/* Category Pill Tabs */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 rounded-full border border-black/5 bg-white px-6 py-3 text-sm font-bold shadow-sm transition-all hover:border-black cursor-pointer">
                      <LayoutGrid className="h-4 w-4" />
                      Semua
                    </div>
                    {[
                      { name: "Pipa Air", icon: <Droplets className="h-4 w-4" /> },
                      { name: "Listrik", icon: <Zap className="h-4 w-4" /> },
                      { name: "Elektronik", icon: <Monitor className="h-4 w-4" /> },
                    ].map((item, i) => (
                      <button 
                        key={i}
                        className="group flex items-center gap-2 rounded-full border border-black/5 bg-white px-6 py-3 text-sm font-bold text-[#666] transition-all hover:bg-black hover:text-white"
                      >
                        <span className="text-[#a1a1a1] transition-transform group-hover:scale-110 group-hover:text-white">{item.icon}</span>
                        {item.name}
                      </button>
                    ))}
                  </div>

                  {/* Search Bar (Image Match) */}
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

                  {/* Popular Tags */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-bold text-black">Popular:</span>
                    <div className="flex flex-wrap gap-2">
                      {["cuci ac", "pipa bocor", "instalasi listrik", "servis kulkas", "kunci pintu"].map((tag, i) => (
                        <button 
                          key={tag} 
                          className={`rounded-full border px-5 py-2 text-xs font-medium transition-all ${i === 1 ? "border-black bg-white text-[#213547]" : "border-black/10 bg-white text-[#5d6d7e] hover:border-black hover:text-black"}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative aspect-square w-80 max-w-xl lg:ml-auto"
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
                
                {/* Decorative blob */}
                <div className="absolute -z-10 -top-20 -right-20 h-96 w-96 rounded-full bg-black/[0.02] blur-[100px]" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* SERVICE GALLERY SECTION (Dribbble Style) */}
        <section className="px-8 lg:px-24 py-16 border-t border-black/[0.05]">
          <div className="w-full">
            {/* Gallery Header / Filters */}
            <div className="mb-12 flex items-center justify-between">
              {/* Popular Dropdown */}
              <button className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:border-black">
                Popular <ChevronDown className="h-4 w-4" />
              </button>

              {/* Centered Discovery Tabs */}
              <div className="hidden items-center gap-8 lg:flex">
                {["Semua", "Servis AC", "Pipa Air", "Listrik", "Elektronik", "Pertukangan"].map((tab, i) => (
                  <button 
                    key={tab} 
                    className={`text-sm font-bold transition-all hover:text-black ${i === 0 ? "text-black border-b-2 border-black pb-1" : "text-[#a1a1a1]"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Filters Button */}
              <button className="flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-bold shadow-sm transition-all hover:border-black">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
            </div>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { title: "Servis & Cuci AC", img: "ac", tech: "Budi Santoso", avatar: "/images/budi.png", likes: 88, views: "8.1k" },
                { title: "Instalasi Pipa Air", img: "plumbing", tech: "Maya Kartika", avatar: "/images/maya.png", likes: 54, views: "5.4k" },
                { title: "Reparasi Elektronik", img: "hero", tech: "Hendra Wijaya", avatar: "/images/hendra.png", likes: 164, views: "10.2k" },
                { title: "Servis Mesin Cuci", img: "feature", tech: "Budi Santoso", avatar: "/images/budi.png", likes: 47, views: "3.3k" },
                { title: "Pasang Tandon Air", img: "card", tech: "Maya Kartika", avatar: "/images/maya.png", likes: 58, views: "1.1k" },
                { title: "Perbaikan Atap", img: "feature", tech: "Hendra Wijaya", avatar: "/images/hendra.png", likes: 92, views: "4.5k" },
                { title: "Instalasi Listrik", img: "hero", tech: "Budi Santoso", avatar: "/images/budi.png", likes: 120, views: "7.8k" },
                { title: "Servis Pompa Air", img: "plumbing", tech: "Maya Kartika", avatar: "/images/maya.png", likes: 43, views: "2.1k" },
                { title: "Perbaikan Kulkas", img: "ac", tech: "Hendra Wijaya", avatar: "/images/hendra.png", likes: 76, views: "5.9k" },
                { title: "Pembersihan Tandon", img: "card", tech: "Budi Santoso", avatar: "/images/budi.png", likes: 88, views: "8.1k" },
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-black/[0.05] bg-gray-50">
                    <Image 
                      src={`/images/${item.img}.png`} 
                      alt={item.title} 
                      fill 
                      className="object-cover grayscale transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-4">
                      <div className="flex w-full items-center justify-between text-white">
                        <span className="text-xs font-bold truncate pr-2">{item.title}</span>
                        <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                          <ArrowUpRight className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Info Bar */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6 overflow-hidden rounded-full border border-black/10">
                        <Image src={item.avatar} alt={item.tech} fill className="object-cover" />
                      </div>
                      <span className="text-sm font-bold truncate max-w-[80px]">{item.tech.split(' ')[0]}</span>
                      <span className="rounded bg-black px-1.5 py-0.5 text-[8px] font-black text-white">PRO</span>
                    </div>

                    <div className="flex items-center gap-3 text-black">
                      <div className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="h-3 w-3 fill-current" />
                        <span className="text-sm font-medium">{item.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span className="text-sm font-medium">{item.views}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Show More Button */}
            <div className="mt-20 flex justify-center">
              <button className="rounded-2xl border border-black/10 bg-black px-8 py-3 text-sm text-white font-medium shadow-sm transition-all hover:border-black active:scale-95">
                Show more
              </button>
            </div>
          </div>
        </section>

        {/* KEUNGGULAN SECTION (Marquee Gallery Style) */}
        <section className="py-24 bg-white overflow-hidden border-t border-black/[0.05]">
          <div className="flex relative">
            <motion.div 
              className="flex gap-8 px-6"
              animate={{ x: [0, -1650] }} // Adjust based on content width
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
                      className="group cursor-pointer w-[280px] shrink-0"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-black/[0.05] bg-gray-50 flex items-center justify-center">
                        <Image 
                          src={item.image}
                          alt={item.label}
                          fill
                          unoptimized
                          className="object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-4">
                          <div className="flex w-full items-center justify-between text-white">
                            <span className="text-xs font-bold truncate pr-2">{item.label}</span>
                            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                              <ArrowUpRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Info Bar */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-black flex items-center justify-center text-[10px] font-black text-white">
                            F
                          </div>
                          <span className="text-xs font-bold truncate max-w-[80px]">{item.tech}</span>
                          <span className="rounded bg-black/[0.05] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-[#a1a1a1]">PRO</span>
                        </div>

                        <div className="flex items-center gap-3 text-[#a1a1a1]">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3 fill-current" />
                            <span className="text-[10px] font-bold">{item.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span className="text-[10px] font-bold">{item.views}</span>
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
