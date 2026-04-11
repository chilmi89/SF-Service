import { apiClient } from './api-client';

/**
 * Service untuk mengelola profil pengguna.
 */
export const profileService = {
  /**
   * Mengambil semua daftar profil.
   */
  async getAll() {
    return apiClient('/api/profiles');
  },

  /**
   * Mengambil detail satu profil berdasarkan ID.
   */
  async getById(id: string) {
    return apiClient(`/api/profiles/${id}`);
  },

  /**
   * Membuat profil baru secara manual (Input: full_name, phone, address, avatar_url, user_id).
   */
  async create(data: {
    user_id: string;
    full_name?: string;
    phone?: string;
    address?: string;
    avatar_url?: string;
  }) {
    return apiClient('/api/profiles', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Memperbarui data profil (Hanya field personal sesuai permintaan).
   */
  async update(id: string, data: {
    full_name?: string;
    phone?: string;
    address?: string;
    avatar_url?: string;
    email?: string;
    password?: string;
  }) {
    return apiClient(`/api/profiles/${id}`, {
      method: 'PUT',
      body: data,
    });
  },

  /**
   * Menghapus profil.
   */
  async delete(id: string) {
    return apiClient(`/api/profiles/${id}`, {
      method: 'DELETE',
    });
  },
};
