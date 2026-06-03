import { apiClient } from './api-client';

/**
 * Layanan Service Library (Global/User)
 * Digunakan oleh komponen frontend publik/user untuk mengambil daftar layanan.
 */
export const layananService = {
  /**
   * Mengambil semua daftar layanan secara keseluruhan
   * Bisa difilter berdasarkan id_kategori
   */
  async getAllLayanan(id_kategori?: number) {
    const url = id_kategori ? `/api/layanan?id_kategori=${id_kategori}` : '/api/layanan';
    return apiClient(url, {
      method: 'GET',
    });
  },

  /**
   * Mengambil daftar kategori layanan
   */
  async getAllKategori() {
    return apiClient('/api/kategori', {
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
