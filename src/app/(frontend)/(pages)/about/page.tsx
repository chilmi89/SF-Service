"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Sparkles,
  Building2,
  Users,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Check,
  Layers,
  Wrench
} from "lucide-react";

export default function AboutPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      <main className="relative z-10 px-6 md:px-12 lg:px-20 pt-32 pb-24 max-w-7xl mx-auto space-y-32">
        
        {/* Hero Section */}
        <section className="max-w-3xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-[9px] font-bold text-black uppercase tracking-wider"
          >
            <Sparkles className="h-3 w-3" />
            Tentang FixIt
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl font-black tracking-tight leading-[1.1] text-black"
          >
            Menyatukan Penyedia Jasa <br />
            <span className="text-gray-400">dengan Kebutuhan Rumah Anda.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-xl mx-auto"
          >
            FixIt hadir sebagai jembatan digital yang menghubungkan pemilik rumah dengan berbagai perusahaan penyedia jasa perbaikan dan perawatan profesional secara terpusat, aman, dan efisien.
          </motion.p>
        </section>

        {/* Story Section - Editorial Grid with Image */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center border-t border-black/[0.06] pt-16">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Misi & Visi</span>
            <h2 className="text-2xl sm:text-3xl font-black text-black leading-tight">
              Mendigitalisasi Industri Jasa Servis Rumah Tangga.
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              <p>
                Selama bertahun-tahun, pengusaha jasa perbaikan rumah dan pelanggan seringkali menghadapi kendala koordinasi. Pelanggan kesulitan menemukan teknisi handal yang terverifikasi, sementara perusahaan jasa kesulitan mengelola jadwal, melacak tim di lapangan, serta menjangkau area operasional yang lebih luas secara efektif.
              </p>
              <p>
                FixIt didirikan untuk memecahkan masalah tersebut. Kami tidak hanya membuat platform pencarian bagi pengguna, tetapi juga merancang infrastruktur digital khusus bagi perusahaan jasa untuk naik kelas. Mulai dari manajemen teknisi, dasbor laporan, hingga katalog layanan terintegrasi dapat diakses secara langsung demi menaikkan produktivitas harian.
              </p>
            </div>
          </div>
          <div className="lg:col-span-5 relative">
            <div className="relative w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden bg-gray-50 border border-black/[0.08] shadow-sm">
              <Image
                src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800"
                alt="FixIt Professional Service"
                fill
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
            {/* Overlay badge decoration */}
            <div className="absolute -bottom-4 -left-4 bg-white border border-black/[0.08] p-4 rounded-xl shadow-md hidden sm:flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] font-black text-black">100% Terverifikasi</p>
                <p className="text-[8px] text-gray-400 font-bold">Mitra Resmi FixIt</p>
              </div>
            </div>
          </div>
        </section>

        {/* Ecosystem Pillars - Split Columns without Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20 border-t border-black/[0.06] pt-16">
          {/* Column 1: For Service Partners */}
          <div className="space-y-6">
            <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-black">
              <Building2 className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-black">Bagi Mitra Perusahaan Jasa</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Kami menyediakan ekosistem terpadu untuk mendominasi pasar lokal dan mengoptimalkan sistem manajemen internal.
              </p>
            </div>
            <ul className="space-y-3 pt-2">
              {[
                { title: "Dasbor Pengawasan Real-time", desc: "Pantau status pengerjaan tugas dan jadwalkan teknisi secara instan." },
                { title: "Manajemen Katalog Jasa", desc: "Perbarui harga, deskripsi layanan, dan cakupan wilayah secara mandiri." },
                { title: "Rekap Transaksi Otomatis", desc: "Sistem pencatatan invoice digital yang meminimalisir kesalahan operasional." }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <Check className="h-4 w-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-black">{item.title}</h4>
                    <p className="text-[11px] text-gray-500 font-medium leading-normal">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: For Household Customers */}
          <div className="space-y-6">
            <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-black">
              <Users className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-black">Bagi Pelanggan Rumah Tangga</h3>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">
                Kemudahan penuh untuk menjaga fungsionalitas dan kenyamanan rumah Anda tanpa rasa khawatir.
              </p>
            </div>
            <ul className="space-y-3 pt-2">
              {[
                { title: "Mitra Resmi Terverifikasi", desc: "Seluruh perusahaan jasa yang bergabung telah melewati penyaringan ketat." },
                { title: "Pemesanan Katalog Instan", desc: "Pilih jenis layanan, jadwalkan kedatangan, dan pesan langsung dari portal mitra." },
                { title: "Garansi & Transparansi Biaya", desc: "Biaya jasa yang tertera di katalog bersifat final tanpa biaya tambahan tak terduga." }
              ].map((item, idx) => (
                <li key={idx} className="flex gap-3">
                  <Check className="h-4 w-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-black">{item.title}</h4>
                    <p className="text-[11px] text-gray-500 font-medium leading-normal">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Wide Landscape Image Banner */}
        <section className="relative w-full h-[240px] sm:h-[320px] rounded-2xl overflow-hidden bg-gray-100 border border-black/[0.06] shadow-sm">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1200"
            alt="Modern Living Space Managed by FixIt"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          <div className="absolute bottom-6 left-6 text-white space-y-1">
            <h4 className="text-sm sm:text-base font-black">Rumah Nyaman, Tanpa Beban</h4>
            <p className="text-[10px] sm:text-xs text-white/80 font-medium">Fokus pada kenyamanan Anda, biar kami yang mengurus sisanya.</p>
          </div>
        </section>

        {/* Milestones / Impact stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 border-y border-black/[0.06] py-12 text-center">
          {[
            { value: "150+", label: "Mitra Terdaftar" },
            { value: "12K+", label: "Order Selesai" },
            { value: "98.4%", label: "Ulasan Puas" },
            { value: "4.8/5", label: "Rating Rata-rata" }
          ].map((stat, idx) => (
            <div key={idx} className="space-y-1.5">
              <p className="text-3xl font-black text-black tracking-tight">{stat.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </section>

        {/* CTA - Editorial Invitation */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8">
          <div className="lg:col-span-8 space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 text-[9px] font-bold text-black uppercase tracking-wider">
              <Layers className="h-3 w-3" />
              Gabung Ekosistem FixIt
            </span>
            <h2 className="text-3xl font-black text-black tracking-tight leading-tight">
              Kembangkan Perusahaan Jasa Anda Bersama Kami.
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium leading-relaxed max-w-xl">
              Daftarkan usaha Anda hari ini untuk mengakses ribuan calon pelanggan baru dan rasakan kecanggihan pengelolaan operasional berbasis digital terpusat.
            </p>
          </div>
          <div className="lg:col-span-4 lg:justify-self-end flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <button
              onClick={() => router.push("/auth/tenant-register")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-black hover:bg-black/90 text-white font-black text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              Mulai Kemitraan
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push("/partners")}
              className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-black font-black text-xs transition-all border border-black/5 active:scale-95 cursor-pointer"
            >
              Cari Perusahaan Jasa
              <Wrench className="h-4 w-4" />
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
