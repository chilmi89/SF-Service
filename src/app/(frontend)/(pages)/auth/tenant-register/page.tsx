"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Globe, 
  Phone, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  Star
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toast, ToastType } from "@/components/toast";
import { authService } from "@/lib/api/auth.service";
import { tenantService } from "@/lib/api/(tenant)/tenant.service";
import Image from "next/image";
import { Camera, Plus } from "lucide-react";

export default function TenantRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: ToastType } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    kode_tenant: "",
    phone: "",
    address: "",
    image_url: "",
  });

  // Load profile to ensure user is logged in and has profile_id
  useEffect(() => {
    const fetchProfile = async () => {
      const profileId = localStorage.getItem("profile_id");
      if (!profileId) {
        router.push("/auth/login");
        return;
      }
      const { data } = await authService.getProfile(profileId);
      const actualProfile = data?.data || data;
      if (actualProfile) setProfile(actualProfile);
    };
    fetchProfile();
  }, [router]);

  // Auto-generate slug and tenant code
  useEffect(() => {
    if (formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      
      const code = formData.name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase() + Math.floor(1000 + Math.random() * 9000);

      setFormData(prev => ({ ...prev, slug, kode_tenant: prev.kode_tenant || code }));
    }
  }, [formData.name]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setToast({
          show: true,
          title: "File Terlalu Besar",
          message: "Ukuran gambar maksimal adalah 2MB.",
          type: "warning"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, image_url: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Create Tenant using tenantService
      const tenantRes = await tenantService.createTenant({
        name: formData.name,
        slug: formData.slug,
        kode_tenant: formData.kode_tenant,
        phone: formData.phone,
        address: formData.address,
        image_url: formData.image_url,
      });

      if (tenantRes.error) {
        throw new Error(tenantRes.error);
      }

      // 2. Update User Profile (Role -> Owner, Set Kode Tenant)
      const profileId = localStorage.getItem("profile_id");
      
      await authService.updateProfile(profileId, {
        kode_tenant: formData.kode_tenant,
      });

      setToast({
        show: true,
        title: "Selamat! Tenant Berhasil Dibuat",
        message: "Sekarang Anda adalah pemilik layanan. Mengalihkan ke dashboard...",
        type: "success"
      });

      // Clear cached permissions so sidebar refreshes
      localStorage.removeItem("user_permissions");
      localStorage.setItem("user_role", "owner_tunggal"); // Simulate role change for UI

      setTimeout(() => {
        router.push("/dashboard/owner_tunggal");
      }, 2000);

    } catch (err: any) {
      setToast({
        show: true,
        title: "Gagal Mendaftar",
        message: err.message || "Terjadi kesalahan saat membuat tenant.",
        type: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white selection:bg-black selection:text-white relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-50/50 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-50/50 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Side: Branding & Info */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <Link 
            href="/home"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-black transition-colors"
          >
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>

          <div className="space-y-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-xs font-black uppercase tracking-widest"
            >
              <Zap size={14} className="fill-orange-600" />
              FixIt Business Partnership
            </motion.div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter text-black leading-[0.9]">
              MULAI BISNIS <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-rose-500">ANDA SENDIRI.</span>
            </h1>
            <p className="text-xl text-gray-500 font-medium max-w-md leading-relaxed">
              Bergabunglah dengan ribuan teknisi profesional lainnya dan kelola layanan Anda dengan dashboard premium FixIt.
            </p>
          </div>

          <div className="grid gap-6">
            {[
              { icon: <ShieldCheck className="text-orange-500" />, title: "Kelola Pesanan", desc: "Pantau semua permintaan pelanggan dalam satu layar." },
              { icon: <Star className="text-rose-500" />, title: "Bangun Reputasi", desc: "Dapatkan rating dan ulasan untuk meningkatkan kepercayaan." },
              { icon: <Globe className="text-blue-500" />, title: "Jangkauan Luas", desc: "Tampilkan layanan Anda ke ribuan pengguna aktif kami." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white/50 backdrop-blur-sm"
              >
                <div className="h-12 w-12 rounded-xl bg-white shadow-sm border border-gray-100 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h4 className="font-bold text-black">{item.title}</h4>
                  <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Registration Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-rose-500/10 blur-2xl rounded-3xl -z-10" />
          
          <form 
            onSubmit={handleSubmit}
            className="bg-white rounded-3xl border border-gray-200 shadow-2xl p-8 lg:p-10 space-y-6"
          >
            <div className="text-center space-y-2 mb-8">
              <h3 className="text-2xl font-black text-black">Daftarkan Tenant</h3>
              <p className="text-sm text-gray-400 font-medium italic">Silakan lengkapi detail bisnis Anda dibawah ini</p>
            </div>

            {/* Image Upload Component */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="group relative h-28 w-28 cursor-pointer overflow-hidden rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 transition-all hover:border-black hover:bg-gray-100"
              >
                {imagePreview ? (
                  <Image 
                    src={imagePreview} 
                    alt="Preview" 
                    fill 
                    className="object-cover transition-transform group-hover:scale-110" 
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-gray-400">
                    <Camera size={28} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Logo</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Plus className="text-white" size={24} />
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Upload Logo Bisnis</p>
            </div>

            {/* Business Name */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nama Bisnis</label>
              <div className="relative group">
                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                <input 
                  required
                  type="text"
                  placeholder="Contoh: FixIt Jaya Mandiri"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {/* Slug */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Slug URL</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input 
                    required
                    type="text"
                    placeholder="fixit-jaya"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Tenant Code */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Kode Tenant</label>
                <div className="relative group">
                  <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={18} />
                  <input 
                    required
                    type="text"
                    placeholder="FJM01"
                    value={formData.kode_tenant}
                    onChange={(e) => setFormData({ ...formData, kode_tenant: e.target.value.toUpperCase() })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Nomor Telepon Bisnis</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                <input 
                  required
                  type="tel"
                  placeholder="+62 8..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all"
                />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Alamat Bisnis</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-4 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
                <textarea 
                  required
                  rows={3}
                  placeholder="Alamat lengkap operasional bisnis Anda"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5 outline-none transition-all resize-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white rounded-2xl py-5 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:bg-black/90 hover:shadow-2xl hover:shadow-black/20 active:scale-[0.98] disabled:bg-gray-400 mt-4"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Memproses...
                </>
              ) : (
                <>
                  Mulai Menjadi Partner
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-gray-400 font-bold leading-relaxed px-4">
              Dengan mendaftar, Anda menyetujui <span className="text-black">Syarat & Ketentuan</span> serta <span className="text-black">Kebijakan Privasi</span> FixIt Partnership.
            </p>
          </form>
        </motion.div>
      </div>

      {toast && (
        <Toast 
          show={toast.show}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}