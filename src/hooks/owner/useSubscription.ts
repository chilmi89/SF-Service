"use client";

import { useState, useEffect, useCallback } from "react";
import { subscriptionService } from "@/lib/api/(tenant)/subscription.service";
import { useAuth } from "@/hooks/useAuth";

export const useSubscription = () => {
  const { profileId } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch available plans
      const plansResponse = await subscriptionService.getAllPlans();
      if (!plansResponse.error && plansResponse.data) {
        // Handle cases where data might be nested in plansResponse.data.data
        const plansData = Array.isArray(plansResponse.data) 
          ? plansResponse.data 
          : Array.isArray(plansResponse.data.data) 
            ? plansResponse.data.data 
            : [];
        setPlans(plansData);
      }

      // 2. Fetch tenant active subscription
      const subResponse = await subscriptionService.getTenantSubscriptions();
      if (!subResponse.error && subResponse.data) {
        const subData = Array.isArray(subResponse.data) 
          ? subResponse.data 
          : Array.isArray(subResponse.data.data) 
            ? subResponse.data.data 
            : [];
            
        if (subData.length > 0) {
          setActiveSubscription(subData[0]);
        }
      }
    } catch (err: any) {
      setError(err.message || "Gagal memuat data langganan");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptionData();
  }, [fetchSubscriptionData]);

  const handleSubscribe = async (planId: string | number) => {
    try {
      // Get the current profile to find kode_tenant
      if (!profileId) return { success: false, message: "Profil tidak ditemukan" };
      
      const { profileService } = await import("@/lib/api/profile.service");
      const profileResponse = await profileService.getById(profileId);
      
      const profileData = profileResponse.data?.data || profileResponse.data;
      const kodeTenant = profileData?.kode_tenant;

      if (profileResponse.error || !kodeTenant) {
        return { success: false, message: "Kode Tenant tidak ditemukan" };
      }

      const response = await subscriptionService.subscribeTenant({
        kode_tenant: kodeTenant,
        id_langganan: planId,
      });

      if (!response.error) {
        await fetchSubscriptionData();
        return { success: true };
      }
      return { success: false, message: response.error };
    } catch (err: any) {
      return { success: false, message: err.message };
    }
  };

  return {
    plans,
    activeSubscription,
    isLoading,
    error,
    handleSubscribe,
    refresh: fetchSubscriptionData,
    isSubscribed: !!activeSubscription,
  };
};
