import { apiClient } from '../api-client';

/**
 * Layanan Tenant Service Library
 * Digunakan oleh komponen frontend di dashboard Tenant (Owner) untuk mengelola layanannya.
 */
export const layananTenantService = {
  /**
   * Mengambil daftar layanan khusus milik tenant yang sedang login
   */
  async getLayananTenant() {
    return apiClient('/api/layanan/tenant', {
      method: 'GET',
    });
  },

  /**
   * Membuat layanan baru
   * @param data Bisa berupa object { nama_layanan, harga_dasar, descripsi, gambar } atau FormData
   */
  async createLayanan(data: any | FormData) {
    return apiClient('/api/layanan', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Mengubah layanan yang ada
   * @param data Bisa berupa object { nama_layanan, harga_dasar, descripsi, gambar } atau FormData
   */
  async updateLayanan(id: string, data: any | FormData) {
    return apiClient(`/api/layanan/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * Menghapus layanan
   */
  async deleteLayanan(id: string) {
    return apiClient(`/api/layanan/${id}`, {
      method: 'DELETE',
    });
  },
};
