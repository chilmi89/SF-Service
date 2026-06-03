"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LayoutGrid,
  Loader2,
  AlertCircle,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import Image from "next/image";
import { authService } from "@/lib/api/auth.service";
import { Toast, ToastType } from "@/components/toast";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [toast, setToast] = useState<{
    title: string;
    message: string;
    type: ToastType;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setToast({
        title: "Validasi Gagal",
        message: "Password dan Konfirmasi Password tidak cocok.",
        type: "warning",
      });
      return;
    }
    if (!agreed) {
      setToast({
        title: "Persetujuan",
        message: "Anda harus menyetujui Ketentuan Layanan.",
        type: "warning",
      });
      return;
    }

    setToast(null);
    setIsLoading(true);

    try {
      const { data, error: authError } = await authService.register(
        formData.email,
        formData.password,
      );

      if (authError || !data) {
        setToast({
          title: "Registrasi Gagal",
          message:
            typeof authError === "string"
              ? authError
              : "Gagal mendaftar. Silakan coba lagi.",
          type: "error",
        });
        return;
      }

      setToast({
        title: "Berhasil Daftar",
        message: data.message || "Akun Anda berhasil dibuat. Silakan login.",
        type: "success",
      });
    } catch (err: any) {
      setToast({
        title: "Error Sistem",
        message: "Terjadi kesalahan pada server saat mencoba mendaftar.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToastClose = () => {
    const wasSuccess =
      toast?.type === "success" && toast.title === "Berhasil Daftar";
    setToast(null);
    if (wasSuccess) {
      router.push("/auth/login?registered=true");
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
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
        stiffness: 120,
        damping: 15,
      },
    },
  };

  const blobVariants: Variants = {
    animate1: {
      x: [0, 60, 0],
      y: [0, 40, 0],
      scale: [1, 1.2, 1],
      transition: { duration: 12, repeat: Infinity, ease: "easeInOut" },
    },
    animate2: {
      x: [0, -50, 0],
      y: [0, 60, 0],
      scale: [1, 1.3, 1],
      transition: { duration: 15, repeat: Infinity, ease: "easeInOut" },
    },
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white text-black selection:bg-black selection:text-white">
      <div className="flex h-full w-full flex-col lg:flex-row">
        {/* LEFT COLUMN: CURATED IMAGE FULL */}
        <div className="hidden lg:block lg:w-1/2 h-full relative overflow-hidden">
          <Image
            src="/images/card.png"
            alt="Architecture"
            fill
            priority
            className="object-cover grayscale brightness-95 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* RIGHT COLUMN: REGISTER FORM (FixIt Style) */}
        <div className="relative flex flex-1 flex-col justify-center px-10 sm:px-16 lg:px-20 overflow-hidden bg-white h-full">
          {/* Background Blobs (Same as Login) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <motion.div
              variants={blobVariants}
              animate="animate1"
              className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-black/[0.04] blur-[100px]"
            />
            <motion.div
              variants={blobVariants}
              animate="animate2"
              className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-black/[0.04] blur-[100px]"
            />
          </div>

          {/* Back Button - Fixed at top left of the form section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute top-8 left-8 lg:top-12 lg:left-12 z-20"
          >
            <Link
              href="/home"
              className="group flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-black transition-colors"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Kembali ke Beranda
            </Link>
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative z-10 mx-auto w-full max-w-sm pt-10 lg:pt-12"
          >
            {/* Logo/Brand Section */}
            <motion.div variants={itemVariants} className="mb-4 text-center">
              <div
                className="mx-auto mb-2 flex h-16 w-auto cursor-pointer items-center justify-center"
                onClick={() => router.push("/home")}
              >
                <img
                  src="/images/logo.png"
                  alt="FixIt Logo"
                  className="h-16 w-auto object-contain"
                />
              </div>
            </motion.div>

            {/* Header */}
            <div className="mb-4 text-center space-y-0.5">
              <motion.h1
                variants={itemVariants}
                className="text-lg font-black tracking-tighter"
              >
                REGISTER
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-[11px] font-semibold leading-relaxed text-gray-400"
              >
                Daftar akun FixIt Anda untuk manajemen perawatan rumah yang presisi dan modern.
              </motion.p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Social Login */}
              <motion.div variants={itemVariants} className="space-y-3">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-black/[0.1] bg-white py-2.5 text-xs font-bold transition-all hover:bg-black/[0.02] active:scale-[0.98]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Daftar dengan Google
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="absolute w-full border-t border-black/[0.05]" />
                  <span className="relative bg-white px-4 text-[9px] font-bold tracking-[0.2em] text-[#a1a1a1] uppercase">
                    Atau
                  </span>
                </div>
              </motion.div>

              {/* Email Address */}
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1">
                  Email Address
                </label>
                <div className="group relative">
                  <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
                  <input
                    name="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-black/[0.2] bg-white/50 py-2.5 pr-4 pl-12 text-xs font-semibold outline-none transition-all focus:border-black/30 focus:bg-white"
                    required
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1">
                  Password
                </label>
                <div className="group relative">
                  <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-black/[0.2] bg-white/50 py-2.5 pr-12 pl-12 text-xs font-semibold outline-none transition-all focus:border-black/30 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-[#a1a1a1]"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password */}
              <motion.div variants={itemVariants} className="space-y-1">
                <label className="text-xs font-bold text-gray-400 ml-1">
                  Confirm Password
                </label>
                <div className="group relative">
                  <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#a1a1a1]" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-black/[0.2] bg-white/50 py-2.5 pr-12 pl-12 text-xs font-semibold outline-none transition-all focus:border-black/30 focus:bg-white"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-[#a1a1a1]"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </motion.div>

              {/* Agreement */}
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-3 py-1"
              >
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    id="agreed"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="h-4.5 w-4.5 appearance-none rounded-lg border-2 border-black/[0.15] checked:bg-black checked:border-black transition-all cursor-pointer"
                  />
                  {agreed && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    </div>
                  )}
                </div>
                <label
                  htmlFor="agreed"
                  className="text-[9px] font-bold leading-normal text-[#666] cursor-pointer uppercase"
                >
                  I ACCEPT THE{" "}
                  <span className="font-black text-black underline">
                    TERMS OF SERVICE
                  </span>{" "}
                  AND PRIVACY POLICY.
                </label>
              </motion.div>

              {/* Submit Button (Animated FixIt Style) */}
              <motion.div
                variants={itemVariants}
                className="flex justify-center pt-2"
              >
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-full border border-black/[0.2] bg-white font-black uppercase tracking-[0.2em] transition-all duration-300 active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <div className="flex h-full items-center justify-center gap-2 text-black text-xs transition duration-500 group-hover:-translate-y-[160%]">
                        Daftar Sekarang <LayoutGrid className="h-4 w-4" />
                      </div>
                      <div className="absolute flex h-full w-full translate-y-[100%] items-center justify-center transition duration-500 group-hover:translate-y-0 text-xs">
                        <span className="absolute h-full w-full translate-y-full scale-y-0 skew-y-12 bg-black transition duration-500 group-hover:translate-y-0 group-hover:scale-[3.5]"></span>
                        <span className="z-10 flex items-center gap-2 text-white">
                          Daftar Sekarang{" "}
                          <ArrowRight className="h-4 w-4 stroke-[3px]" />
                        </span>
                      </div>
                    </>
                  )}
                </button>
              </motion.div>

              {/* Secondary Link */}
              <motion.p
                variants={itemVariants}
                className="text-center text-xs font-medium text-gray-400 pt-1"
              >
                Sudah punya akun?{" "}
                <Link
                  href="/auth/login"
                  className="font-black text-black hover:underline"
                >
                  Masuk
                </Link>
              </motion.p>
            </form>
          </motion.div>
        </div>
      </div>

      <Toast
        show={!!toast}
        title={toast?.title}
        message={toast?.message || ""}
        type={toast?.type}
        duration={toast?.type === "success" ? 2000 : 5000}
        onClose={handleToastClose}
      />
    </div>
  );
}
