"use client";

import { useState, useEffect, useCallback } from "react";
import { subscriptionService } from "@/lib/api/(tenant)/subscription.service";

export const useManageSubscription = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await subscriptionService.getAllPlans();
      if (!response.error && response.data) {
        // Handle nested data if necessary
        const plansData = Array.isArray(response.data) 
          ? response.data 
          : Array.isArray(response.data.data) 
            ? response.data.data 
            : [];
        setPlans(plansData);
      } else if (response.error) {
        setError(response.error);
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat paket langganan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreatePlan = async (data: { harga: number; durasi: number; nama_paket?: string; deskripsi?: string }) => {
    try {
      const response = await subscriptionService.createPlan(data);
      if (!response.error) {
        await fetchPlans();
        return { success: true };
      }
      return { success: false, message: response.error };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const handleUpdatePlan = async (id: string | number, data: { harga?: number; durasi?: number; nama_paket?: string; deskripsi?: string }) => {
    try {
      const response = await subscriptionService.updatePlan(id, data);
      if (!response.error) {
        await fetchPlans();
        return { success: true };
      }
      return { success: false, message: response.error };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  const handleDeletePlan = async (id: string | number) => {
    try {
      const response = await subscriptionService.deletePlan(id);
      if (!response.error) {
        await fetchPlans();
        return { success: true };
      }
      return { success: false, message: response.error };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  return {
    plans,
    isLoading,
    error,
    refresh: fetchPlans,
    createPlan: handleCreatePlan,
    updatePlan: handleUpdatePlan,
    deletePlan: handleDeletePlan,
  };
};
