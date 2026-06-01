import { apiClient } from '../api-client';

/**
 * Task Service Library
 * Menghubungkan frontend ke API /api/tasks untuk pembuatan, pengambilan,
 * pembaruan status, dan penghapusan tugas.
 */
export const taskService = {
  /**
   * Mengambil daftar tugas (task)
   * - Jika login sebagai User Biasa: Mengambil task terkait order miliknya.
   * - Jika login sebagai Teknisi: Mengambil task yang di-assign kepadanya.
   * - Jika login sebagai Tenant (Owner/Admin): Mengambil semua task di tenant-nya.
   */
  async getTasks() {
    return apiClient('/api/tasks', {
      method: 'GET',
    });
  },

  /**
   * Membuat tugas baru (Khusus Owner/Admin Tenant)
   * @param payload Data tugas (order_id dan nama_tugas wajib)
   */
  async createTask(payload: {
    order_id: string;
    technician_id?: string;
    nama_tugas: string;
    deskripsi?: string;
    deadline?: string;
  }) {
    return apiClient('/api/tasks', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Mengupdate status / progres tugas (Khusus Owner/Teknisi)
   * @param id ID Task
   * @param status_tugas Status tugas terbaru (contoh: 'Dikerjakan', 'Selesai')
   */
  async updateTaskStatus(id: string, status_tugas: string) {
    return apiClient(`/api/tasks/${id}`, {
      method: 'PUT',
      body: { status_tugas },
    });
  },

  /**
   * Menghapus tugas (Khusus Owner/Admin Tenant)
   * @param id ID Task
   */
  async deleteTask(id: string) {
    return apiClient(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
