import { apiClient } from '../api-client';
import { authService } from '../auth.service';

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
    const response = await apiClient('/api/tenants', {
      method: 'POST',
      body: tenantData,
    });
    
    // Refresh token secara rahasia jika berhasil, agar role otomatis update di session
    if (!response.error) {
      await authService.refreshToken().catch(e => console.error('Gagal merefresh session', e));
    }
    
    return response;
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

  /**
   * Menambahkan staf (Admin/Teknisi) ke tenant
   */
  async addStaff(email: string, role_name: 'admin tenant' | 'teknisi') {
    return apiClient('/api/tenants/staff', {
      method: 'POST',
      body: { email, role_name },
    });
  },

  /** 
   * Mengambil daftar staf yang ada di tenant saat ini.
   * Super Admin dapat menyertakan kode_tenant untuk melihat staf tenant lain.
   */
  async getStaff(kode_tenant?: string) {
    const url = kode_tenant 
      ? `/api/tenants/staff?kode_tenant=${kode_tenant}` 
      : '/api/tenants/staff';

    return apiClient(url, {
      method: 'GET',
    });
  },
};
