import { apiClient } from './api-client';

/**
 * Layanan Service Library (Global/User)
 * Digunakan oleh komponen frontend publik/user untuk mengambil daftar layanan.
 */
export const layananService = {
  /**
   * Mengambil semua daftar layanan secara keseluruhan
   */
  async getAllLayanan() {
    return apiClient('/api/layanan', {
      method: 'GET',
    });
  },

  /**
   * Mengambil detail satu layanan berdasarkan ID
   */
  async getLayananDetails(id: string) {
    return apiClient(`/api/layanan/${id}`, {
      method: 'GET',
    });
  },
};
