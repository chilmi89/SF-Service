"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Building2,
  Headphones,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Sparkles,
  ArrowUpRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Toast } from "@/components/toast";

export default function ContactPage() {
  const router = useRouter();

  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [senderType, setSenderType] = useState("customer"); // customer, tenant, other
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: "success" | "error" | "warning" } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Mock API request delay
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      setToast({
        title: "Pesan Terkirim",
        message: "Terima kasih, tim FixIt akan segera merespons pesan Anda.",
        type: "success"
      });

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
      setSenderType("customer");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-transparent text-black">
      <main className="relative z-10 pt-28 pb-20 px-4 sm:px-8 lg:px-16">
        {/* Decorative background blobs */}
        <div className="absolute top-10 left-10 -z-10 h-64 w-64 rounded-full bg-black/[0.01] blur-[80px]" />
        <div className="absolute bottom-10 right-10 -z-10 h-80 w-80 rounded-full bg-black/[0.01] blur-[100px]" />

        {/* Hero Section */}
        <div className="max-w-2xl mx-auto text-center mb-12 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/[0.03] border border-black/5 text-[9px] font-bold text-black uppercase tracking-wider backdrop-blur-sm"
          >
            <Sparkles className="h-3 w-3" />
            Hubungi FixIt
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-black tracking-tight leading-tight"
          >
            Ada Pertanyaan? <br />
            <span className="text-gray-400">Kami Siap Membantu</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-lg mx-auto text-gray-500 font-medium text-xs sm:text-sm leading-relaxed"
          >
            Apakah Anda pelanggan yang mencari bantuan teknis, atau perwakilan perusahaan jasa service yang tertarik untuk bermitra? Kirimkan pesan Anda melalui formulir di bawah ini.
          </motion.p>
        </div>

        {/* Main Content Grid - Max width restricted to 5xl for more intimate feel */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Contact Cards & Info */}
          <div className="lg:col-span-5 space-y-6">
            <h2 className="text-lg font-bold tracking-tight text-black">Informasi Kontak</h2>
            
            {/* Quick Cards */}
            <div className="grid grid-cols-1 gap-4">
              
              {/* Customer Support Card */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-5 rounded-2xl bg-white border border-black/[0.05] hover:border-black transition-all shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-black shrink-0">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-black">Layanan Pelanggan</h3>
                    <p className="text-[10px] text-gray-400 font-medium leading-normal">Butuh bantuan terkait pesanan servis rumah Anda?</p>
                    <div className="pt-2 space-y-1 text-xs font-semibold text-gray-700">
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <a href="mailto:support@fixit.co.id" className="hover:underline">support@fixit.co.id</a>
                      </p>
                      <p className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <a href="tel:+62215550199" className="hover:underline">+62 (21) 555-0199</a>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Partnership Support Card */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-5 rounded-2xl bg-white border border-black/[0.05] hover:border-black transition-all shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-black shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-black">Kemitraan Tenant (Perusahaan)</h3>
                    <p className="text-[10px] text-gray-400 font-medium leading-normal">Hubungi divisi bisnis kami untuk integrasi tenant & promosi khusus.</p>
                    <div className="pt-2 space-y-1 text-xs font-semibold text-gray-700">
                      <p className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <a href="mailto:mitra@fixit.co.id" className="hover:underline">mitra@fixit.co.id</a>
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Address / Office Hours Card */}
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-5 rounded-2xl bg-white border border-black/[0.05] hover:border-black transition-all shadow-sm"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center text-black shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-black">Kantor Pusat</h3>
                    <p className="text-[10px] text-gray-400 font-medium leading-normal">Kunjungi kantor utama kami untuk konsultasi langsung.</p>
                    <p className="pt-2 text-xs font-semibold leading-relaxed text-gray-700">
                      Gedung FixIt Tower Lt. 12, <br />
                      Jl. Sudirman No. 89, Jakarta Selatan, 12190
                    </p>
                    <div className="pt-2 flex items-center gap-1.5 text-[10px] font-bold text-gray-400">
                      <Clock className="h-3.5 w-3.5" />
                      Senin - Jumat | 09.00 - 17.00 WIB
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>

            {/* CTA to Quick Partner Registration */}
            <div className="p-5 rounded-2xl bg-black text-white space-y-3">
              <h3 className="font-bold text-sm">Tertarik Menjadi Mitra Tenant?</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Anda tidak perlu menunggu balasan email. Daftarkan perusahaan jasa service Anda secara instan di platform kami untuk mulai menerima pesanan.
              </p>
              <button
                onClick={() => router.push("/auth/tenant-register")}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-100 transition-colors shadow-lg cursor-pointer"
              >
                Daftar Tenant Sekarang
                <ArrowUpRight className="h-3 w-3" />
              </button>
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7 bg-white border border-black/[0.05] rounded-3xl p-6 sm:p-8 shadow-sm relative">
            <h2 className="text-lg font-bold tracking-tight text-black mb-6">Kirim Pesan</h2>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-8 flex flex-col items-center justify-center text-center space-y-3"
              >
                <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-base font-bold text-black">Terima Kasih!</h3>
                <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
                  Pesan Anda telah berhasil kami terima. Tim kami akan segera meninjau dan membalas melalui email Anda dalam waktu maksimal 1x24 jam.
                </p>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="mt-4 px-4 py-2 rounded-xl border border-black/10 text-xs font-bold text-black hover:bg-black/5 transition-all cursor-pointer"
                >
                  Kirim Pesan Lain
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Sender Type Radio Selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Saya Adalah</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "customer", label: "Pelanggan" },
                      { id: "tenant", label: "Perusahaan Jasa" },
                      { id: "other", label: "Lainnya" }
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSenderType(type.id)}
                        className={`py-2 rounded-lg border text-center text-xs font-bold transition-all cursor-pointer ${
                          senderType === type.id
                            ? "bg-black border-black text-white shadow-sm"
                            : "bg-white border-black/5 text-gray-400 hover:border-black/20 hover:text-black"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nama Lengkap</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama Anda"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-gray-50/50 outline-none text-xs sm:text-sm font-semibold text-black focus:bg-white focus:border-black transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Alamat Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Masukkan email aktif"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-gray-50/50 outline-none text-xs sm:text-sm font-semibold text-black focus:bg-white focus:border-black transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nomor Telepon (Opsional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Contoh: 08123456789"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-gray-50/50 outline-none text-xs sm:text-sm font-semibold text-black focus:bg-white focus:border-black transition-all"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Subjek Pesan</label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Subjek pertanyaan"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-gray-50/50 outline-none text-xs sm:text-sm font-semibold text-black focus:bg-white focus:border-black transition-all"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Detail Pesan</label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pertanyaan atau detail tawaran kerja sama Anda di sini..."
                    rows={4}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 bg-gray-50/50 outline-none text-xs sm:text-sm font-semibold text-black resize-none focus:bg-white focus:border-black transition-all"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-3 rounded-xl bg-black text-white font-bold text-xs hover:bg-black/90 active:scale-95 disabled:bg-gray-400 transition-all shadow-md cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Mengirim Pesan...
                      </>
                    ) : (
                      <>
                        Kirim Pesan
                        <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>

      </main>

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