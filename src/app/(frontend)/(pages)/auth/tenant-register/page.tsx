"use client";

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { 
  ArrowRight, 
  Loader2, 
  ArrowLeft,
  Camera,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toast, ToastType } from "@/components/toast";
import { authService } from "@/lib/api/auth.service";
import { tenantService } from "@/lib/api/(tenant)/tenant.service";
import Image from "next/image";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

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
      localStorage.setItem("user_role", "owner tunggal"); // Simulate role change for UI

      setTimeout(() => {
        router.push("/dashboard/owner");
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
    <div className="min-h-screen bg-white pb-32 pt-20 sm:pt-28 selection:bg-black selection:text-white relative">
      <div className="mx-auto max-w-2xl px-6">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-4"
        >
          {/* Back Action */}
          <Link
            href="/home"
            className="group inline-flex items-center gap-2 text-sm font-bold text-[#a1a1a1] transition-all hover:text-black mb-6"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Kembali ke Beranda
          </Link>

          {/* Header */}
          <header className="border-b border-gray-100 pb-8 mb-8 mt-2">
            <h1 className="text-3xl font-bold tracking-tight text-black">
              Daftarkan Tenant Baru
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Silakan lengkapi detail bisnis Anda di bawah ini untuk mulai bermitra dengan FixIt.
            </p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Logo Bisnis */}
            <div className="space-y-4">
              <label className="text-sm font-medium text-black block">Logo Bisnis</label>
              <div className="flex items-center gap-6">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative h-20 w-20 cursor-pointer overflow-hidden rounded-full bg-gray-50 border border-gray-200 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center shrink-0"
                >
                  {imagePreview ? (
                    <Image 
                      src={imagePreview} 
                      alt="Logo Preview" 
                      fill 
                      className="h-full w-full object-cover" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Camera size={24} />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Plus className="text-white" size={16} />
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-sm font-semibold text-black hover:underline"
                  >
                    Pilih Logo Bisnis
                  </button>
                  <p className="text-xs text-gray-400 mt-1">Maksimal ukuran gambar adalah 2MB.</p>
                </div>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Nama Bisnis */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black block">Nama Bisnis</label>
              <input 
                required
                type="text"
                placeholder="Contoh: FixIt Jaya Mandiri"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black block">Nomor Telepon Bisnis</label>
              <input 
                required
                type="tel"
                placeholder="+62 8..."
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black block">Alamat Lengkap Bisnis</label>
              <textarea 
                required
                rows={3}
                placeholder="Alamat lengkap operasional bisnis Anda"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black resize-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex flex-col gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-black px-10 py-4 text-sm font-bold text-white transition-all hover:bg-black/90 active:scale-95 disabled:bg-gray-400 shadow-xl shadow-black/5 w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    MEMPROSES...
                  </>
                ) : (
                  <>
                    DAFTARKAN TENANT SEKARANG
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-gray-400 font-semibold leading-relaxed px-4">
                Dengan mendaftar, Anda menyetujui <span className="text-black underline cursor-pointer">Syarat & Ketentuan</span> serta <span className="text-black underline cursor-pointer">Kebijakan Privasi</span> FixIt Partnership.
              </p>
            </div>
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