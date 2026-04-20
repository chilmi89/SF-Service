"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import {
  Wrench,
  CheckCircle2,
  ChevronRight,
  User,
  Search,
  Settings,
  Shield,
  Clock,
  ArrowUpRight,
  Package,
  BarChart3,
  Users,
  Star,
  Quote,
  Layers,
  Rocket,
  Headphones,
} from "lucide-react";

export default function LandingPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <div className="min-h-screen bg-transparent text-black selection:bg-black selection:text-white selection:rounded-none">
      <main className="relative z-10">
        {/* Hero Section */}
        {/* Hero Section - Full Background */}
        <section className="relative w-full min-h-screen flex items-center overflow-hidden">
          {/* Background Image & Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero.png"
              alt="Professional Home Service"
              fill
              priority
              className="object-cover grayscale brightness-75"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
          </div>

          <div className="w-full relative z-10 px-6 md:px-12 lg:px-20 pt-32 pb-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="space-y-10 max-w-3xl"
            >
              <motion.div variants={itemVariants}>
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#a1a1a1] backdrop-blur-md">
                  Home Service Specialist
                </span>
              </motion.div>
              <motion.h1 
                variants={itemVariants}
                className="text-3xl font-black leading-[1.1] text-white sm:text-4xl md:text-5xl lg:text-7xl"
              >
                Rumah Nyaman, <br />
                <span className="text-[#a1a1a1]">Tanpa Beban.</span>
              </motion.h1>
              <motion.p 
                variants={itemVariants}
                className="max-w-xl text-md font-medium text-gray-300"
              >
                Kami menghadirkan teknisi profesional untuk segala kebutuhan servis rumah Anda. Cepat, transparan, dan bergaransi resmi dari FixIt.
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
                <button className="flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-bold text-black transition-all hover:bg-white/90 active:scale-95">
                  Pesan Layanan <ChevronRight className="h-5 w-5" />
                </button>
                <button className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md transition-colors hover:bg-white/10 text-white">
                  <Search className="h-6 w-6" />
                </button>
              </motion.div>

            </motion.div>
          </div>
        </section>


        {/* Highlight Features Section */}
        <section className="py-20 bg-gray-50/30">
          <div className="w-full px-6 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: "Manajemen Inventori",
                  desc: "Pantau stok suku cadang secara real-time. Notifikasi otomatis saat stok menipis untuk mencegah kendala layanan.",
                  icon: <Package className="h-6 w-6 text-white" />,
                },
                {
                  title: "Laporan Profit Otomatis",
                  desc: "Data keuangan yang akurat dan instan. Visualisasi keuntungan harian hingga tahunan dalam genggaman Anda.",
                  icon: <BarChart3 className="h-6 w-6 text-white" />,
                },
                {
                  title: "Monitoring Teknisi",
                  desc: "Pantau lokasi dan status pekerjaan teknisi di lapangan melalui dashboard terpusat yang responsif.",
                  icon: <Users className="h-6 w-6 text-white" />,
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="rounded-3xl border border-black/[0.05] bg-white p-10 shadow-[0_10px_40px_rgba(0,0,0,0.02)]"
                >
                  <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-black">
                    {feature.icon}
                  </div>
                  <h3 className="mb-4 text-xl font-black">{feature.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-[#666]">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Section (Grid 12) */}
        <section className="py-24 bg-white/50">
          <div className="w-full px-6 md:px-12 lg:px-20">
            {/* Section Header */}
            <div className="mb-16 max-w-2xl">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-black text-4xl mb-4"
              >
                Pesan Jasa Servis
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-md font-medium text-[#666]"
              >
                Marketplace terintegrasi yang menghubungkan pelanggan dengan teknisi ahli di berbagai bidang layanan untuk kebutuhan harian Anda.
              </motion.p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* Primary Card: AC & Electronics */}
              <motion.div 
                whileHover={{ scale: 1.01 }}
                className="relative min-h-[500px] overflow-hidden rounded-2xl border border-black/[0.1] lg:col-span-8 group shadow-lg"
              >
                <Image 
                  src="/images/ac.png" 
                  alt="Servis AC & Elektronik" 
                  fill 
                  className="object-cover grayscale transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-8 left-8">
                  <span className="rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md border border-white/20">
                    Paling Dicari
                  </span>
                </div>

                <div className="absolute bottom-10 left-10 right-10">
                  <h3 className="text-3xl font-bold text-white md:text-4xl">Servis AC & Elektronik</h3>
                  <p className="mt-3 max-w-sm text-sm font-medium text-white/70">
                    Layanan perawatan rutin dan perbaikan AC oleh teknisi tersertifikasi dengan jaminan kualitas terbaik.
                  </p>
                </div>
                <button className="absolute bottom-10 right-10 h-14 w-14 flex items-center justify-center rounded-full bg-white text-black transition-transform hover:scale-110">
                  <ArrowUpRight className="h-6 w-6" />
                </button>
              </motion.div>

              {/* Secondary Column: Automotive & Plumbing */}
              <div className="flex flex-col gap-8 lg:col-span-4">
                {/* Automotive Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative min-h-[240px] flex-1 overflow-hidden rounded-2xl border border-black/[0.1] group shadow-md"
                >
                  <Image 
                    src="/images/automotive.png" 
                    alt="Otomotif" 
                    fill 
                    className="object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8">
                    <h4 className="text-xl font-bold text-white">Otomotif</h4>
                    <p className="mt-1 text-xs font-medium text-white/60">Servis rutin hingga tune-up kendaraan harian.</p>
                  </div>
                </motion.div>

                {/* Plumbing Card */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="relative min-h-[240px] flex-1 overflow-hidden rounded-2xl border border-black/[0.1] group shadow-md"
                >
                  <Image 
                    src="/images/plumbing.png" 
                    alt="Plumbing & Pipa" 
                    fill 
                    className="object-cover grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-8 left-8">
                    <h4 className="text-xl font-bold text-white">Plumbing & Pipa</h4>
                    <p className="mt-1 text-xs font-medium text-white/60">Solusi tuntas untuk segala masalah instalasi air rumah.</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Services List Section */}
        <section className="bg-black/[0.02] py-24">
          <div className="w-full px-6 md:px-12 lg:px-20">
            <div className="mb-8">
              <div className="mb-10 space-y-2">
                <h2 className="text-4xl font-black md:text-5xl">Layanan Kami</h2>
                <p className="text-md font-medium text-[#666]">Kategori servis yang paling sering dibutuhkan.</p>
              </div>
              
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search Bar */}
                <div className="relative flex max-w-md flex-1 items-center">
                  <Search className="absolute left-4 h-4 w-4 text-[#a1a1a1]" />
                  <input 
                    type="text" 
                    placeholder="Cari layanan servis..." 
                    className="w-full rounded-full border border-black/[0.1] bg-white py-3 pl-11 pr-6 text-sm font-medium outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-4 self-end rounded-full border border-black/[0.1] bg-white px-4 py-2 sm:self-auto">
                  <span className="text-sm font-bold text-black">Semua</span>
                  <div className="h-4 w-px bg-black/[0.1]" />
                  <span className="text-sm font-bold text-[#a1a1a1]">Pipa</span>
                  <span className="text-sm font-bold text-[#a1a1a1]">Listrik</span>
                  <span className="text-sm font-bold text-[#a1a1a1]">AC</span>
                </div>
              </div>
            </div>

            <div className="flex overflow-x-auto gap-8 pb-12 pt-4 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
              {[
                { name: "Servis & Cuci AC", price: "Mulai 75rb", info: "Pembersihan rutin, isi freon, & perbaikan mesin.", icon: <Settings className="h-6 w-6" /> },
                { name: "Perbaikan Instalasi Pipa", price: "Mulai 150rb", info: "Mendeteksi kebocoran, wastafel mampet, & pompa air.", icon: <Wrench className="h-6 w-6" /> },
                { name: "Instalasi & Servis Listrik", price: "Mulai 100rb", info: "Pasang titik baru, servis panel, & perbaikan korsleting.", icon: <Settings className="h-6 w-6" /> },
                { name: "Servis Mesin Cuci", price: "Mulai 120rb", info: "Perbaikan modul, bocor air, & ganti mesin pengering.", icon: <Settings className="h-6 w-6" /> },
                { name: "Perbaikan Water Heater", price: "Mulai 200rb", info: "Servis pemanas air gas/listrik & penggantian elemen.", icon: <Settings className="h-6 w-6" /> },
                { name: "Pembersihan Tandon Air", price: "Mulai 90rb", info: "Kuras tangki air, pembersihan jamur & lumut.", icon: <Wrench className="h-6 w-6" /> }
              ].map((service, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative flex w-[280px] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl border border-black/[0.1] bg-white p-8 transition-all hover:border-black shadow-sm hover:shadow-xl"
                >
                  <div className="space-y-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black text-white transition-all group-hover:scale-110">
                      {service.icon}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold leading-tight">{service.name}</h4>
                      <p className="mt-2 text-xs font-medium leading-relaxed text-[#666]">{service.info}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-black/[0.05] pt-6">
                    <span className="text-lg font-bold">{service.price}</span>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-white transition-all hover:scale-110 active:scale-95">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Why ServisHub? Section */}
        <section className="py-24 bg-gray-50/50">
          <div className="w-full px-6 md:px-12 lg:px-20">
            <div className="mb-20 text-center">
              <h2 className="text-4xl font-black mb-6">Mengapa FixtIt?</h2>
              <div className="mx-auto h-1 w-16 bg-black rounded-full" />
            </div>

            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Enterprise Security",
                  desc: "Keamanan data tingkat bank dengan enkripsi end-to-end yang menjamin privasi bisnis Anda.",
                  icon: <Shield className="h-6 w-6" />
                },
                {
                  title: "Multi-tenant Isolation",
                  desc: "Infrastruktur cloud yang memisahkan data antar tenant untuk performa maksimal dan keamanan.",
                  icon: <Layers className="h-6 w-6" />
                },
                {
                  title: "24/7 Support",
                  desc: "Tim ahli kami siap membantu kendala operasional Anda kapan saja melalui live chat dan telepon.",
                  icon: <Headphones className="h-6 w-6" />
                },
                {
                  title: "Infinite Scalability",
                  desc: "Platform yang tumbuh bersama bisnis Anda, dari 1 teknisi hingga ribuan cabang di seluruh Indonesia.",
                  icon: <Rocket className="h-6 w-6" />
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="text-center group"
                >
                  <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-black/[0.05] transition-colors group-hover:bg-black group-hover:text-white">
                    {feature.icon}
                  </div>
                  <h3 className="mb-4 text-xl font-black">{feature.title}</h3>
                  <p className="text-sm font-medium leading-relaxed text-[#666]">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 bg-white relative z-10">
          <div className="w-full px-6 md:px-12 lg:px-20">
            <div className="mb-16 text-center">
              <h2 className="text-4xl font-black mb-4 text-black">Apa Kata Mereka?</h2>
              <p className="text-lg font-medium text-[#666]">Pengalaman nyata dari pelanggan setia FixIt.</p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  name: "Budi Santoso",
                  role: "Pemilik Rumah",
                  content: "Sangat profesional. AC rumah jadi dingin lagi hanya dalam waktu 30 menit. Teknisi sangat mengerti apa yang dilakukan.",
                  avatar: "/images/budi.png",
                  rating: 5
                },
                {
                  name: "Maya Kartika",
                  role: "Pelaku Bisnis",
                  content: "Sistem pelaporannya sangat membantu bisnis saya. Profit harian terpantau jelas dan transparan.",
                  avatar: "/images/maya.png",
                  rating: 5
                },
                {
                  name: "Hendra Wijaya",
                  role: "Karyawan Swasta",
                  content: "Teknisi sangat ramah dan berpakaian rapi. Sangat nyaman untuk layanan di dalam rumah. Pasti langganan!",
                  avatar: "/images/hendra.png",
                  rating: 5
                }
              ].map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="relative rounded-2xl border border-black/30 bg-white p-10 shadow-sm hover:shadow-xl transition-all"
                >
                  <Quote className="absolute top-8 right-10 h-10 w-10 text-black/[0.03]" />
                  
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-black text-black" />
                    ))}
                  </div>

                  <p className="text-md font-medium leading-relaxed mb-10 italic text-black">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-4">
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-black/[0.05]">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-black">{testimonial.name}</h4>
                      <p className="text-xs font-bold text-[#a1a1a1] uppercase">{testimonial.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
