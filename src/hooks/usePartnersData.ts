"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/api-client";
import { tenantService } from "@/lib/api/(tenant)/tenant.service";
import { layananService } from "@/lib/api/layanan.service";

export function usePartnersData() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [allServices, setAllServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 1. Fetch categories
        let categoryMap: Record<number, string> = {};
        try {
          const catRes = await layananService.getAllKategori();
          const catData = catRes?.data || catRes;
          const categoriesList = Array.isArray(catData) ? catData : (Array.isArray(catData.data) ? catData.data : []);
          categoriesList.forEach((c: any) => {
            if (c.id && c.nama) categoryMap[c.id] = c.nama;
          });
        } catch (e) {
          console.error("Error categories mapping:", e);
        }

        // 2. Fetch all services
        let servicesList: any[] = [];
        try {
          const res = await layananService.getAllLayanan();
          let rawData = res?.data;
          if (rawData && !Array.isArray(rawData)) {
            if (Array.isArray(rawData.data)) rawData = rawData.data;
            else if (Array.isArray(rawData.layanan)) rawData = rawData.layanan;
            else rawData = [rawData];
          }
          servicesList = Array.isArray(rawData) ? rawData : [];
        } catch (e) {
          console.error("Gagal memuat layanan:", e);
        }

        // 3. Fetch current user role and completed orders count (if logged in as owner)
        let myCompletedCount = 0;
        let myTenantId: string | null = null;
        const userRole = typeof window !== "undefined" ? (localStorage.getItem("user_role")?.toLowerCase() || "") : "";
        const isOwner = ["owner", "owner tunggal", "owner_tunggal", "admin tenant"].includes(userRole);
        if (isOwner) {
          try {
            const profileId = typeof window !== "undefined" ? localStorage.getItem("profile_id") : null;
            if (profileId) {
              const profileRes = await apiClient(`/api/profiles/${profileId}`);
              const p = profileRes?.data?.data || profileRes?.data || profileRes;
              if (p && p.kode_tenant) {
                const tenantsRes = await apiClient('/api/tenants');
                const tenantsList = tenantsRes?.data?.data || tenantsRes?.data || [];
                const myTenant = tenantsList.find((t: any) => t.kode_tenant === p.kode_tenant);
                if (myTenant) {
                  myTenantId = myTenant.id;
                }
              }
            }
            const ordersRes = await apiClient("/api/orders?as=tenant");
            const ordersList = ordersRes?.data?.data || ordersRes?.data || [];
            if (Array.isArray(ordersList)) {
              myCompletedCount = ordersList.filter((o: any) => o.status === 8).length;
            }
          } catch (e) {
            console.error("Gagal mendeteksi jumlah order selesai pemilik:", e);
          }
        }

        // 4. Fetch all tenants
        const tenantsRes = await tenantService.getAllTenants();
        let rawTenants = tenantsRes?.data;
        if (rawTenants && !Array.isArray(rawTenants)) {
          if (Array.isArray(rawTenants.data)) rawTenants = rawTenants.data;
          else rawTenants = [rawTenants];
        }
        const tenantsArray = Array.isArray(rawTenants) ? rawTenants : [];

        if (tenantsArray.length > 0) {
          const mapped = tenantsArray.map((item: any) => {
            const hasValidImage = item.image_url && typeof item.image_url === "string" && 
              (item.image_url.startsWith("http") || item.image_url.startsWith("/"));
            
            // Filter services belonging to this tenant
            const tenantServicesList = servicesList.filter((s: any) => 
              s.tenant_id === item.id || s.tenants?.name?.toLowerCase() === item.name.toLowerCase()
            );

            // Calculate dynamic categories from actual services
            const dynamicCategories = Array.from(
              new Set(tenantServicesList.map((s: any) => categoryMap[s.id_kategori] || s.kategori).filter(Boolean))
            ) as string[];

            // Determine completed orders count (if it's owner's tenant, use actual count, else generate deterministic count)
            const hash = item.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            let finalOrdersCount = 15 + (hash % 65);

            if (isOwner && myTenantId === item.id) {
              finalOrdersCount = myCompletedCount;
            }

            return {
              id: item.id,
              name: item.name,
              slug: item.slug,
              address: item.address || "Alamat tidak dicantumkan",
              phone: item.phone || "No telepon tidak dicantumkan",
              image_url: hasValidImage ? item.image_url : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800",
              kode_tenant: item.kode_tenant,
              rating: item.rating || 5.0,
              ordersCount: finalOrdersCount,
              categories: dynamicCategories.length > 0 ? dynamicCategories : ["Umum"],
              desc: item.descripsi || "Mitra Service Terpercaya",
              servicesCount: tenantServicesList.length
            };
          });
          setTenants(mapped);
        } else {
          setTenants([]);
        }

        // Map and save all services for quick client-side filtering
        const mappedServices = servicesList.map((item: any) => {
          const hasValidImg = item.gambar && typeof item.gambar === "string" && 
            (item.gambar.startsWith("http") || item.gambar.startsWith("/"));
          return {
            id: item.layanan_id || item.id,
            tenantId: item.tenant_id,
            title: item.nama_layanan || "Layanan",
            category: categoryMap[item.id_kategori] || item.kategori || "Servis AC",
            img: hasValidImg ? item.gambar : "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800",
            price: item.harga_dasar || 0,
            desc: item.descripsi || "Dapatkan pengerjaan service rumah rapi, aman, dan bergaransi.",
            tech: item.tenants?.name || "Mitra",
            avatar: item.tenants?.image_url || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=150"
          };
        });
        setAllServices(mappedServices);

      } catch (err) {
        console.error("Gagal memuat data mitra:", err);
        setTenants([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    tenants,
    allServices,
    loading
  };
}
