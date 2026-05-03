"use client";

import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-black selection:bg-black selection:text-white overflow-hidden relative">
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden opacity-20">
        <motion.div 
            animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-gray-100 rounded-full blur-3xl" 
        />
        <motion.div 
            animate={{ 
                scale: [1, 1.3, 1],
                rotate: [0, -90, 0]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-gray-50 rounded-full blur-3xl" 
        />
      </div>

      <div className="z-10 flex flex-col items-center text-center max-w-lg">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-black text-white shadow-2xl"
        >
          <Lock size={48} strokeWidth={2.5} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-6xl font-black tracking-tighter sm:text-8xl">
            403
          </h1>
          <h2 className="mt-4 text-2xl font-black uppercase tracking-tight text-black sm:text-3xl">
            Akses Ditolak
          </h2>
          <p className="mt-6 text-base font-bold text-[#666] leading-relaxed">
            Maaf, akun Anda tidak memiliki izin yang cukup untuk mengakses halaman ini. 
            Silakan hubungi administrator jika Anda merasa ini adalah kesalahan.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row items-center gap-4 w-full"
        >
          <button
            onClick={() => router.back()}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-black bg-white px-8 py-4 text-sm font-black transition-all hover:bg-gray-50 active:scale-95 sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Kembali
          </button>
          
          <Link
            href="/home"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-8 py-4 text-sm font-black text-white transition-all hover:bg-black/90 hover:shadow-xl active:scale-95 sm:w-auto"
          >
            <Home className="h-4 w-4" />
            Ke Beranda
          </Link>
        </motion.div>
      </div>

      {/* Footer Decoration */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-12 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300"
      >
        FixIt Security Protocol Restricted Area
      </motion.div>
    </div>
  );
}
