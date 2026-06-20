"use client";

import React from "react";
import { motion } from "framer-motion";
import { useSubscription } from "@/hooks/owner/useSubscription";
import { PricingCard } from "@/components/dashboard/owner/subscription/PricingCard";
import { ActivePlanCard } from "@/components/dashboard/owner/subscription/ActivePlanCard";
import { Loader2, AlertCircle, Sparkles } from "lucide-react";
import { Toast, ToastType } from "@/components/toast";

export default function SubscriptionPage() {
  const { 
    plans, 
    activeSubscription, 
    isLoading, 
    error, 
    handleSubscribe,
    handleCancelSubscription,
    isSubscribed 
  } = useSubscription();

  const [toast, setToast] = React.useState<{ show: boolean; title: string; message: string; type: ToastType } | null>(null);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isCancelling, setIsCancelling] = React.useState(false);

  const onSubscribe = async (planId: string | number) => {
    setIsProcessing(true);
    const result = await handleSubscribe(planId);
    setIsProcessing(false);

    if (result.success) {
      setToast({
        show: true,
        title: "Berhasil Berlangganan",
        message: "Paket Anda telah aktif. Sekarang Anda dapat menambah karyawan.",
        type: "success"
      });
    } else {
      setToast({
        show: true,
        title: "Gagal Berlangganan",
        message: result.message || "Terjadi kesalahan saat memproses langganan.",
        type: "error"
      });
    }
  };

  const onCancelClick = async () => {
    setIsCancelling(true);
    const result = await handleCancelSubscription();
    setIsCancelling(false);

    if (result.success) {
      setToast({
        show: true,
        title: "Langganan Dibatalkan",
        message: "Paket langganan Anda berhasil dibatalkan.",
        type: "success"
      });
    } else {
      setToast({
        show: true,
        title: "Gagal Membatalkan",
        message: result.message || "Terjadi kesalahan saat membatalkan langganan.",
        type: "error"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-black" />
        <p className="text-sm font-medium text-gray-400">Menyiapkan penawaran terbaik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center p-6">
        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center text-red-500">
          <AlertCircle size={32} />
        </div>
        <h2 className="text-xl font-black text-black">Terjadi Kesalahan</h2>
        <p className="text-sm text-gray-500 max-w-xs">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 h-11 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-12 max-w-7xl mx-auto">
      {/* HEADER SECTION */}
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">
          {isSubscribed ? "Langganan Saya" : "Pilih Paket Langganan"}
        </h1>
        <p className="text-[12px] font-small text-gray-400 max-w-xl">
          {isSubscribed 
            ? "Kelola paket langganan aktif Anda dan nikmati fitur manajemen tim tanpa batas."
            : "Tingkatkan akun Anda ke paket premium untuk membuka fitur manajemen karyawan dan optimasi performa tenant."
          }
        </p>
      </section>

      {/* ACTIVE SUBSCRIPTION VIEW */}
      {isSubscribed && activeSubscription && (
        <section>
          <ActivePlanCard 
            subscription={activeSubscription} 
            onCancel={onCancelClick}
            isCancelling={isCancelling}
          />
        </section>
      )}

      {/* PRICING SECTION */}
      <section className="space-y-6">
        {!isSubscribed && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <PricingCard 
                key={plan.id}
                plan={plan}
                isPopular={index === 1} // Mark the second plan as popular
                onSubscribe={onSubscribe}
                isLoading={isProcessing}
              />
            ))}
          </div>
        )}

        {isSubscribed && plans.length > 0 && (
          <div className="space-y-6 pt-10 border-t border-gray-100">
            <div>
              <h3 className="text-lg font-black text-black mb-1">Paket Lainnya</h3>
              <p className="text-xs font-medium text-gray-400">Anda dapat beralih ke paket lain kapan saja.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
              {plans.map((plan) => (
                <PricingCard 
                  key={plan.id}
                  plan={plan}
                  onSubscribe={() => {}} // Disable for active view for now
                  isLoading={false}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* TOAST NOTIFICATION */}
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
