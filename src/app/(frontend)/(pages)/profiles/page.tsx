"use client";

import { useEffect, useState, useRef } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Trash2,
  ExternalLink,
  ArrowLeft,
  LogOut,
  Camera,
  Plus,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { profileService } from "@/lib/api/profile.service";
import { authService } from "@/lib/api/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { Toast } from "@/components/toast";

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  address: string | null;
  email: string | null;
  role_id?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    phone: "",
    address: "",
    email: "",
  });

  // Password State
  const [passwords, setPasswords] = useState({
    new: "",
    confirm: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false,
  });

  const handleTriggerUpload = (e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent opening preview when clicking upload
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // 2MB Limit
        setToast({
          title: "File Terlalu Besar",
          message: "Maksimal ukuran foto adalah 2MB.",
          type: "warning",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Clear toast after 5 seconds
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setApiError(null);

      const storedEmail =
        typeof window !== "undefined"
          ? localStorage.getItem("user_email") || localStorage.getItem("email")
          : null;
      const storedProfileId =
        typeof window !== "undefined"
          ? localStorage.getItem("profile_id")
          : null;

      // Pre-fill email from login if session exists
      if (storedEmail) {
        setFormData((prev) => ({ ...prev, email: storedEmail }));
      }

      const { data, error } = await profileService.getById(
        storedProfileId || "",
      );

      if (error) {
        console.error("Profile Fetch Error:", error);
        setApiError(error);
      }

      if (data) {
        const p = data.data || data;
        const finalEmail = p.email || (data as any).email || storedEmail || "";

        setProfile(p as UserProfile);
        setFormData({
          username:
            p.full_name?.toLowerCase().replace(/\s+/g, "-") ||
            "user-" + (p.id?.toString().slice(0, 4) || "0000"),
          fullName: p.full_name || "",
          phone: p.phone || "",
          address: p.address || "",
          email: finalEmail,
        });
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setApiError(null);

    // Construct the data to update
    const updateData: any = {
      full_name: formData.fullName,
      phone: formData.phone,
      address: formData.address,
      email: formData.email,
    };

    // If user is trying to change password
    if (passwords.new) {
      if (passwords.new !== passwords.confirm) {
        setToast({
          title: "Password Tidak Cocok",
          message: "Konfirmasi password baru tidak sesuai.",
          type: "warning",
        });
        setIsSaving(false);
        return;
      }
      if (passwords.new.length < 8) {
        setToast({
          title: "Terlalu Pendek",
          message: "Password baru minimal 8 karakter.",
          type: "warning",
        });
        setIsSaving(false);
        return;
      }
      updateData.password = passwords.new;
    }

    const storedProfileId =
      typeof window !== "undefined" ? localStorage.getItem("profile_id") : null;

    if (!storedProfileId) {
      setToast({
        title: "Sesi Berakhir",
        message: "ID Profil tidak ditemukan. Silakan login kembali.",
        type: "warning",
      });
      setIsSaving(false);
      return;
    }

    const { data, error } = await profileService.update(storedProfileId, {
      ...updateData,
      avatar_url: avatarPreview || profile?.avatar_url || undefined,
    });

    setIsSaving(false);

    if (error) {
      console.error("Save Error:", error);
      setToast({
        title: "Gagal Menghubungi Server",
        message: error || "Terjadi kesalahan saat memperbarui profil.",
        type: "error",
      });
      return;
    }

    setToast({
      title: "Update Berhasil",
      message: "Profil dan keamanan Anda telah sukses diperbarui.",
      type: "success",
    });

    // Reset password fields if updated
    if (passwords.new) {
      setPasswords({ new: "", confirm: "" });
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" },
    },
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32 pt-40 selection:bg-black selection:text-white relative">
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
            className="group inline-flex items-center gap-2 text-sm font-bold text-[#a1a1a1] transition-all hover:text-black mb-2"
          >
            <ArrowLeft
              size={16}
              className="transition-transform group-hover:-translate-x-1"
            />
            Kembali
          </Link>

          {/* API Error Display / Hint */}
          {apiError && !profile && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 rounded-2xl border p-5 text-sm font-bold flex items-center gap-3 ${
                apiError.includes("Failed to fetch")
                  ? "border-blue-200 bg-blue-50 text-blue-600"
                  : "border-red-200 bg-red-50 text-red-600"
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full animate-pulse ${
                  apiError.includes("Failed to fetch")
                    ? "bg-blue-600"
                    : "bg-red-600"
                }`}
              />
              {apiError.includes("Failed to fetch")
                ? "Konfigurasi CORS Diperlukan: Backend Anda perlu mengizinkan header 'Authorization' untuk menampilkan data lengkap."
                : `API Error: ${apiError}`}
            </motion.div>
          )}

          {/* MINIMALIST HEADER */}
          <header className="flex items-center gap-5 border-b border-gray-100 pb-8">
            <div className="relative">
              <div
                onClick={() => setShowAvatarMenu(!showAvatarMenu)}
                className="group relative h-16 w-16 md:h-20 md:w-20 cursor-pointer overflow-hidden rounded-full bg-gray-100 border-2 border-white shadow-md transition-all hover:scale-105 active:scale-95"
              >
                {avatarPreview || profile?.avatar_url ? (
                  <Image
                    src={avatarPreview || profile?.avatar_url || ""}
                    alt="Avatar"
                    width={80}
                    height={80}
                    className="h-full w-full object-cover transition-all"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-[#f0f0f0]">
                    <User className="text-[#a1a1a1]" size={32} />
                  </div>
                )}

                {/* Subtle Click Hint */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 opacity-0 transition-opacity group-hover:opacity-100"></div>

                {/* Add Badge (Bottom Right) */}
                {!avatarPreview && !profile?.avatar_url && (
                  <div className="absolute bottom-1 right-1 h-5 w-5 bg-black rounded-full flex items-center justify-center border-2 border-white">
                    <Plus className="text-white" size={12} />
                  </div>
                )}
              </div>

              {/* AVATAR ACTION MENU */}
              <AnimatePresence>
                {showAvatarMenu && (
                  <>
                    {/* Backdrop for closing */}
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setShowAvatarMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 10 }}
                      className="absolute left-0 top-full mt-3 z-[70] w-52 overflow-hidden rounded-2xl border border-gray-100 bg-white p-2 shadow-2xl"
                    >
                      <button
                        onClick={() => {
                          setShowAvatarMenu(false);
                          if (avatarPreview || profile?.avatar_url)
                            setShowPhotoPreview(true);
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
                      >
                        <Eye size={18} className="text-gray-400" />
                        Lihat Foto
                      </button>
                      <button
                        onClick={() => {
                          setShowAvatarMenu(false);
                          handleTriggerUpload();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-bold text-gray-700 transition-colors hover:bg-gray-50 active:bg-gray-100"
                      >
                        <Camera size={18} className="text-gray-400" />
                        Ganti Foto
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xl font-medium tracking-tight">
                <span className="text-black font-semibold truncate max-w-[200px] md:max-w-none">
                  {formData.username || "User"}
                </span>
                <span className="text-gray-300 font-light">/</span>
                <span className="text-black font-semibold">General</span>
              </div>
              <p className="text-sm text-gray-400">
                Kelola foto dan informasi profil Anda.
              </p>
            </div>
          </header>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* FORM SECTIONS */}
          <div className="space-y-8">
            {/* General Section */}
            <section className="space-y-6">
              <h2 className="text-lg font-semibold text-black">General</h2>
              {/* Account Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Email Akun
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="email@example.com"
                />
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-4 w-4 rounded border border-gray-200 flex items-center justify-center bg-gray-50">
                    <span className="text-[10px] text-black">✓</span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    Gunakan email yang berbeda untuk notifikasi proyek
                  </span>
                </div>
              </div>
            </section>

            {/* Personal Info Section */}
            <section className="space-y-6 pt-4 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-black">
                Informasi Pribadi
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Nama lengkap Anda"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="+62 8..."
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Alamat Lengkap
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black resize-none"
                  placeholder="Alamat domisili Anda"
                />
              </div>
            </section>

            {/* Security Section */}
            <hr className="border-gray-100" />
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-black">
                    Keamanan Akun
                  </h2>
                  <p className="text-sm text-gray-400">
                    Ganti kata sandi Anda untuk meningkatkan keamanan akun.
                  </p>
                </div>
                <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50">
                  <Lock className="text-black" size={20} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">
                    Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwords.new}
                      onChange={(e) =>
                        setPasswords({ ...passwords, new: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          new: !showPasswords.new,
                        })
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showPasswords.new ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-black">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwords.confirm}
                      onChange={(e) =>
                        setPasswords({ ...passwords, confirm: e.target.value })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition-all focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPasswords({
                          ...showPasswords,
                          confirm: !showPasswords.confirm,
                        })
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black"
                    >
                      {showPasswords.confirm ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Linked Accounts */}
            <section className="space-y-6 pt-4 border-t border-gray-100">
              <h2 className="text-lg font-semibold text-black">
                Google Sign-In
              </h2>
              <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-[#fcfcfc] p-4 group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-sm font-bold">
                    G
                  </div>
                  <span className="text-sm font-semibold">Google</span>
                </div>
                <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="text-[11px] text-gray-400">
                Gunakan Google, selain username dan password Anda, untuk
                mengakses akun FixIt.
              </p>
            </section>

            {/* Premium / Pro Section */}
            <section className="space-y-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-black">
                  Matikan Iklan
                </h2>
                <span className="rounded-lg bg-gray-100 px-2 py-1 text-[9px] font-black uppercase text-gray-500 border border-gray-200">
                  PRO
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Dengan akun Pro, Anda dapat mematikan iklan di seluruh situs dan
                mendapatkan prioritas layanan.
              </p>
            </section>
          </div>

          {/* ACTIONS */}
          <div className="pt-8 border-t border-gray-100 flex flex-col gap-4">
            <div className="flex justify-end w-full">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center justify-center gap-2 rounded-xl bg-black px-10 py-4 text-sm font-bold text-white transition-all hover:bg-black/90 active:scale-95 disabled:bg-gray-400 shadow-xl shadow-black/10 w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    MENYIMPAN...
                  </>
                ) : (
                  "SIMPAN PERUBAHAN"
                )}
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 w-full mt-4 rounded-xl border border-red-100 bg-red-50/50 py-4 text-sm font-bold text-red-500 transition-all hover:bg-red-50 active:scale-95"
            >
              <LogOut size={18} />
              Keluar Akun
            </button>
          </div>
        </motion.div>
      </div>

      {/* PHOTO PREVIEW MODAL */}
      <AnimatePresence>
        {showPhotoPreview && (avatarPreview || profile?.avatar_url) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPhotoPreview(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 transition-all"
          >
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowPhotoPreview(false)}
              className="absolute right-8 top-8 z-[110] h-12 w-12 flex items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md hover:bg-white/20 transition-colors"
            >
              <Plus className="rotate-45" size={24} />
            </motion.button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-h-[80vh] max-w-[90vw] overflow-hidden rounded-3xl border border-white/10 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={avatarPreview || profile?.avatar_url || ""}
                alt="Profile Large Preview"
                width={600}
                height={600}
                className="h-full w-full object-contain"
                priority
              />

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 pb-8 text-center">
                <p className="text-sm font-bold tracking-widest text-white/50 uppercase">
                  Profile Photo
                </p>
                <h3 className="text-xl font-bold text-white mt-1">
                  {formData.fullName || "User"}
                </h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION (Unified Component) */}
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
