import { apiClient } from './api-client';

/**
 * Order Service Library (Global/User & Tenant)
 * Menghubungkan frontend ke API /api/orders untuk pembuatan, pengambilan,
 * dan pembaruan status pesanan.
 */
export const orderService = {
  /**
   * Membuat pesanan (order) baru
   * @param payload Data pesanan yang dikirim (layanan_id wajib)
   */
  async createOrder(payload: {
    layanan_id: string;
    customer_name?: string;
    catatan?: string;
  }) {
    return apiClient('/api/orders', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Mengambil daftar pesanan (order)
   * - Jika login sebagai User Biasa: Mengambil order miliknya sendiri.
   * - Jika login sebagai Tenant (Owner/Owner Tunggal): Mengambil semua order di tenant-nya.
   */
  async getOrders() {
    return apiClient('/api/orders', {
      method: 'GET',
    });
  },

  /**
   * Mengambil detail satu pesanan berdasarkan ID
   * @param id ID Pesanan
   */
  async getOrderDetails(id: string) {
    return apiClient(`/api/orders/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Memperbarui status pesanan (Khusus Owner/Admin Tenant)
   * @param id ID Pesanan
   * @param statusOrder Status pesanan baru (contoh: 'Diterima', 'Ditolak', 'Selesai')
   */
  async updateOrderStatus(id: string, statusOrder: string) {
    return apiClient(`/api/orders/${id}`, {
      method: 'PUT',
      body: { status_order: statusOrder },
    });
  },
};
