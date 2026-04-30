"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, Variants } from "framer-motion";
import {
  Mail,
  Lock,
  Github,
  Chrome,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { authService } from "@/lib/api/auth.service";
import { apiClient } from "@/lib/api/api-client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Toast, ToastType } from "@/components/toast";
import Image from "next/image";
import { Suspense } from "react";

function LoginContent() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [toast, setToast] = useState<{
    title: string;
    message: string;
    type: ToastType;
  } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const message = searchParams.get("message");
    if (message) {
      setToast({
        title: "Pemberitahuan",
        message: message,
        type: "success",
      });
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setToast(null);

    const { data, error: apiError } = await authService.login(email, password);

    if (apiError || !data) {
      setToast({
        title: "Login Gagal",
        message: apiError || "Email atau password mungkin salah.",
        type: "error",
      });
      setIsLoading(false);
      return;
    }

    // Login Berhasil (Token sudah ada di HttpOnly Cookie)
    try {
      if (data.profile_id) {
        localStorage.setItem("profile_id", data.profile_id);
        
        // Fetch actual profile from /api/users because it includes role information
        const { data: userRes } = await apiClient(`/api/users/${data.profile_id}`);
        const userData = userRes?.data || userRes;
        
        if (userData && userData.role_name) {
          localStorage.setItem("user_role", userData.role_name.toLowerCase());
        } else {
          localStorage.setItem("user_role", "user biasa");
        }
      }

      localStorage.setItem("token", "true"); // UI flag for Navbar
      
      const nextPath = data.redirectPath || "/home";

      setToast({
        title: "Berhasil Masuk",
        message: "Selamat datang kembali! Menyiapkan dashboard Anda...",
        type: "success",
      });

      // Simpan path redirect untuk digunakan setelah toast ditutup
      (window as any)._nextRedirectPath = data.redirectPath || "/";
    } catch (err) {
      console.error("Login handling error:", err);
      setToast({
        title: "Error Sistem",
        message: "Gagal memproses data login.",
        type: "error",
      });
      setIsLoading(false);
    }
  };

  const handleToastClose = () => {
    const wasSuccess =
      toast?.type === "success" && toast.title === "Berhasil Masuk";
    const nextPath = (window as any)._nextRedirectPath || "/";

    setToast(null);
    if (wasSuccess) {
      router.push(nextPath);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
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
    <div className="flex min-h-screen flex-col bg-white text-black selection:bg-black selection:text-white">
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* LEFT COLUMN: CURATED IMAGE FULL */}
        <div className="w-full lg:w-1/2 h-48 sm:h-64 lg:h-auto relative overflow-hidden">
          <Image
            src="/images/card.png"
            alt="Architecture"
            fill
            priority
            className="object-cover grayscale brightness-95 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* RIGHT COLUMN: LOGIN FORM (FixIt Style) */}
        <div className="relative flex flex-1 flex-col justify-center px-6 py-12 lg:px-24 overflow-hidden bg-white lg:-ml-12 z-10">
          {/* Background Decorations */}
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

          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="relative z-10 w-full max-w-md mx-auto"
          >
            {/* Logo/Brand Section */}
            <motion.div variants={itemVariants} className="mb-10 text-center">
              <motion.div
                whileHover={{ scale: 1.15, rotate: 12 }}
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                className="mx-auto mb-6 flex h-16 w-16 cursor-pointer items-center justify-center bg-black text-3xl font-black text-white shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
              >
                F
              </motion.div>
              <h1 className="text-xs font-bold text-black sm:text-4xl">
                Welcome!
              </h1>
              <p className="mt-3 text-sm font-semibold text-[#666]">
                Masuk ke akun FixIt Anda
              </p>
            </motion.div>

            {/* Login Card */}
            <motion.div variants={itemVariants} className="p-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="email"
                    className="mb-2 ml-1 block text-sm font-bold text-black"
                  >
                    Email
                  </label>
                  <div className="group relative">
                    <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#a1a1a1] transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-black" />
                    <input
                      id="email"
                      type="email"
                      placeholder="nama@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-black/[0.3] bg-white/50 py-4 pr-4 pl-12 text-sm font-medium outline-none transition-all focus:border-black/30 focus:bg-white focus:ring-[6px] focus:ring-black/[0.04]"
                      required
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <label
                      htmlFor="password"
                      className="block text-sm font-bold text-black"
                    >
                      Kata Sandi
                    </label>
                    <Link
                      href="#"
                      className="text-xs font-bold text-[#737373] transition-colors hover:text-black"
                    >
                      Lupa sandi?
                    </Link>
                  </div>
                  <div className="group relative">
                    <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#a1a1a1] transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-black" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-2xl border border-black/[0.3] bg-white/50 py-4 pr-12 pl-12 text-sm font-medium outline-none transition-all focus:border-black/30 focus:bg-white focus:ring-[6px] focus:ring-black/[0.04]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-[#a1a1a1] transition-colors hover:text-black"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </motion.div>

                <div className="flex justify-center">
                  <motion.button
                    variants={itemVariants}
                    disabled={isLoading}
                    type="submit"
                    className="group relative mt-2 flex h-14 w-full items-center justify-center overflow-hidden rounded-full border border-black/[0.3] bg-white font-bold transition-all duration-300"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-black" />
                    ) : (
                      <>
                        <div className="flex h-full items-center justify-center gap-2 text-black transition duration-500 group-hover:-translate-y-[160%]">
                          Masuk Sekarang{" "}
                          <ArrowRight className="h-4 w-4 stroke-[3px]" />
                        </div>
                        <div className="absolute flex h-full w-full translate-y-[100%] items-center justify-center transition duration-500 group-hover:translate-y-0">
                          <span className="absolute h-full w-full translate-y-full scale-y-0 skew-y-12 bg-black transition duration-500 group-hover:translate-y-0 group-hover:scale-[2.5]"></span>
                          <span className="z-10 flex items-center gap-2 text-white">
                            Masuk Sekarang{" "}
                            <ArrowRight className="h-4 w-4 stroke-[3px]" />
                          </span>
                        </div>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>

              <motion.div variants={itemVariants} className="mt-5">
                <div className="relative flex items-center justify-center">
                  <span className="absolute w-full border-t border-black/[0.2]"></span>
                  <span className="relative bg-white px-4 text-sm font-medium tracking-[0.25em] text-[#a1a1a1]">
                    Atau
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4">
                  <motion.button
                    whileHover={{ y: -5, backgroundColor: "rgba(0,0,0,0.03)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center rounded-2xl border border-black/[0.1] bg-white/50 py-3.5 text-sm font-bold transition-all"
                  >
                    <Chrome className="mr-2 h-5 w-5 text-[#EA4335]" />
                    Google
                  </motion.button>
                  <motion.button
                    whileHover={{ y: -5, backgroundColor: "rgba(0,0,0,0.03)" }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center justify-center rounded-2xl border border-black/[0.1] bg-white/50 py-3.5 text-sm font-bold transition-all"
                  >
                    <Github className="mr-2 h-5 w-5" />
                    Github
                  </motion.button>
                </div>
              </motion.div>

              <motion.p
                variants={itemVariants}
                className="mt-5 text-center text-sm font-bold text-[#666]"
              >
                Belum punya akun?{" "}
                <Link
                  href="/auth/register"
                  className="font-black text-black hover:underline"
                >
                  Daftar sekarang
                </Link>
              </motion.p>
            </motion.div>
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

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <Loader2 className="h-10 w-10 animate-spin text-black" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
