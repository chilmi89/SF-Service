import { apiClient } from '../api-client';

/**
 * Service untuk mengelola data pengguna (Users)
 * Mencakup pengambilan daftar user, detail user, update role, dan penghapusan user.
 */
export const userService = {
  /**
   * Mengambil semua daftar user beserta profile dan role-nya.
   */
  async getAll() {
    return apiClient('/api/users', {
      method: 'GET',
    });
  },

  /**
   * Mengambil detail satu user beserta profile dan role-nya berdasarkan ID profil.
   */
  async getById(id: string) {
    return apiClient(`/api/users/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Memperbarui role user berdasarkan ID profil.
   */
  async updateRole(id: string, roleId: string) {
    return apiClient(`/api/users/${id}`, {
      method: 'PUT',
      body: { role_id: roleId },
    });
  },

  /**
   * Menghapus user secara permanen berdasarkan ID profil.
   * Ini juga akan menghapus auth_user terkait jika ada.
   */
  async delete(id: string) {
    return apiClient(`/api/users/${id}`, {
      method: 'DELETE',
    });
  },
};
