"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/lib/api/profile.service";
import { orderService } from "@/lib/api/order.service";
import { ToastType } from "@/components/toast";

interface UseBookingModalProps {
  isOpen: boolean;
  serviceId: string | undefined;
  onClose: () => void;
}

export function useBookingModal({ isOpen, serviceId, onClose }: UseBookingModalProps) {
  const { profileId } = useAuth();
  const [profileName, setProfileName] = useState("");
  const [profileAddress, setProfileAddress] = useState("");

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: ToastType;
  } | null>(null);

  // Fetch profile when modal opens
  useEffect(() => {
    const fetchProfile = async () => {
      if (isOpen && profileId) {
        try {
          const { data } = await profileService.getById(profileId);
          if (data) {
            const p = data.data || data;
            setProfileName(p.full_name || "");
            setProfileAddress(p.address || "");
          }
        } catch (err) {
          console.error("Failed to fetch profile in booking modal:", err);
        }
      }
    };
    fetchProfile();
  }, [isOpen, profileId]);

  // Reset state ketika modal dibuka kembali
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setDate("");
      setTime("");
      setNotes("");
      setToast(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceId) return;
    setIsSubmitting(true);
    
    try {
      // Menggabungkan data address, date, dan time ke dalam catatan agar informatif bagi teknisi
      const combinedNotes = `Tgl: ${date} Jam: ${time}\nAlamat: ${profileAddress}\nCatatan: ${notes}`;
      
      const { data, error } = await orderService.createOrder({
        layanan_id: serviceId,
        customer_name: profileName,
        catatan: combinedNotes,
        ...({
          tanggal: date,
          jam: time
        } as any)
      });

      if (error || !data) {
        throw new Error(error || "Gagal membuat pesanan");
      }

      setIsSuccess(true);
      
      // Tutup otomatis setelah sukses
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (err: any) {
      console.warn("Booking error:", err);
      setToast({
        show: true,
        title: "Gagal Membuat Pesanan",
        message: err.message || "Maaf, terjadi kesalahan saat memproses pesanan Anda.",
        type: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    date,
    setDate,
    time,
    setTime,
    notes,
    setNotes,
    isSubmitting,
    isSuccess,
    toast,
    setToast,
    handleSubmit
  };
}
