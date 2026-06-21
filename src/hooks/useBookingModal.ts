"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/lib/api/profile.service";
import { orderService } from "@/lib/api/order.service";
import { apiClient } from "@/lib/api/api-client";
import { ToastType } from "@/components/toast";

interface UseBookingModalProps {
  isOpen: boolean;
  serviceId: string | undefined;
  serviceTenantId?: string | undefined;
  onClose: () => void;
}

export function useBookingModal({ isOpen, serviceId, serviceTenantId, onClose }: UseBookingModalProps) {
  const { profileId, userRole } = useAuth();
  const [profileName, setProfileName] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [userTenantId, setUserTenantId] = useState<string | null>(null);

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

  // Fetch profile and resolve tenant ID when modal opens
  useEffect(() => {
    const fetchProfile = async () => {
      if (isOpen && profileId) {
        try {
          const storedTenantId = localStorage.getItem("my_tenant_id");
          if (storedTenantId) {
            setUserTenantId(storedTenantId);
          }

          const { data } = await profileService.getById(profileId);
          if (data) {
            const p = data.data || data;
            setProfileName(p.full_name || "");
            setProfileAddress(p.address || "");

            if (p.kode_tenant) {
              const tenantsRes = await apiClient('/api/tenants');
              const tenants = tenantsRes?.data?.data || tenantsRes?.data || [];
              const myTenant = tenants.find((t: any) => t.kode_tenant === p.kode_tenant);
              if (myTenant) {
                setUserTenantId(myTenant.id);
                localStorage.setItem("my_tenant_id", myTenant.id);
              }
            }
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

    // Check if owner is booking their own service
    const isOwner = ["owner", "owner tunggal", "owner_tunggal"].includes(userRole?.toLowerCase() || "");
    if (isOwner && userTenantId && serviceTenantId && userTenantId === serviceTenantId) {
      setToast({
        show: true,
        title: "Pemesanan Dibatalkan",
        message: "Anda tidak dapat memesan layanan milik tenant Anda sendiri.",
        type: "error"
      });
      return;
    }

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
    handleSubmit,
    userRole,
    userTenantId,
    isOwnService: !!(
      ["owner", "owner tunggal", "owner_tunggal"].includes(userRole?.toLowerCase() || "") &&
      userTenantId &&
      serviceTenantId &&
      userTenantId === serviceTenantId
    )
  };
}
