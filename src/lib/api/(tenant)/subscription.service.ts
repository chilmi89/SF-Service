import { apiClient } from '../api-client';
import { authService } from '../auth.service';

export const subscriptionService = {
  // --- Paket Langganan (Global) ---
  
  /**
   * Mengambil semua daftar paket langganan yang tersedia
   */
  async getAllPlans() {
    return apiClient('/api/langganan');
  },

  /**
   * Mendapatkan detail paket langganan berdasarkan ID
   */
  async getPlanById(id: string | number) {
    return apiClient(`/api/langganan/${id}`);
  },

  /**
   * Membuat paket langganan baru (Khusus Super Admin)
   */
  async createPlan(data: { harga: number; durasi: number }) {
    return apiClient('/api/langganan', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Memperbarui paket langganan (Khusus Super Admin)
   */
  async updatePlan(id: string | number, data: { harga?: number; durasi?: number }) {
    return apiClient(`/api/langganan/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * Menghapus paket langganan (Khusus Super Admin)
   */
  async deletePlan(id: string | number) {
    return apiClient(`/api/langganan/${id}`, {
      method: 'DELETE',
    });
  },

  // --- Langganan Tenant (Spesifik Tenant) ---

  /**
   * Mengambil semua data langganan tenant. 
   * Jika dipanggil oleh tenant, hanya akan mengembalikan data miliknya.
   */
  async getTenantSubscriptions() {
    return apiClient('/api/langganan-tenant');
  },

  /**
   * Mendaftarkan tenant ke sebuah paket langganan
   */
  async subscribeTenant(data: { kode_tenant: number | string; id_langganan: number | string }) {
    const response = await apiClient('/api/langganan-tenant', {
      method: 'POST',
      body: data,
    });

    if (!response.error) {
      await authService.refreshToken().catch(e => console.error('Gagal merefresh session', e));
    }

    return response;
  },

  /**
   * Mengambil detail langganan tenant tertentu
   */
  async getTenantSubscriptionDetail(id: string | number) {
    return apiClient(`/api/langganan-tenant/${id}`);
  },

  /**
   * Memperbarui data langganan tenant
   */
  async updateTenantSubscription(id: string | number, data: { id_langganan?: number; kode_tenant?: number }) {
    return apiClient(`/api/langganan-tenant/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * Menghapus/Membatalkan langganan tenant
   */
  async deleteTenantSubscription(id: string | number) {
    const response = await apiClient(`/api/langganan-tenant/${id}`, {
      method: 'DELETE',
    });

    if (!response.error) {
      await authService.refreshToken().catch(e => console.error('Gagal merefresh session', e));
    }

    return response;
  }
};
