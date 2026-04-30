import { apiClient } from '../api-client';

/**
 * Tenant Service Library
 * Digunakan oleh komponen frontend untuk berinteraksi dengan API /api/tenants.
 */
export const tenantService = {
  /**
   * Mengambil semua daftar tenant
   */
  async getAllTenants() {
    return apiClient('/api/tenants', {
      method: 'GET',
    });
  },

  /**
   * Membuat tenant baru
   * Syarat: User harus memiliki profil yang lengkap.
   */
  async createTenant(tenantData: {
    name: string;
    slug: string;
    kode_tenant: string;
    address?: string;
    phone?: string;
    image_url?: string;
  }) {
    return apiClient('/api/tenants', {
      method: 'POST',
      body: tenantData,
    });
  },

  /**
   * Mengambil detail tenant berdasarkan ID
   */
  async getTenantDetails(id: string) {
    return apiClient(`/api/tenants/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Memperbarui data tenant
   */
  async updateTenant(id: string, tenantData: any) {
    return apiClient(`/api/tenants/${id}`, {
      method: 'PUT',
      body: tenantData,
    });
  },

  /**
   * Menghapus tenant
   */
  async deleteTenant(id: string) {
    return apiClient(`/api/tenants/${id}`, {
      method: 'DELETE',
    });
  },
};
