import { apiClient } from '@/lib/api/api-client';

/**
 * Auth Service Library
 * Used by the frontend components to interact with /api/auth routes.
 */
export const authService = {
  /**
   * Register a new user
   */
  async register(email: string, password: string) {
    return apiClient('/api/auth/register', {
      method: 'POST',
      body: { email, password },
    });
  },

  /**
   * Login an existing user
   */
  async login(email: string, password: string) {
    return apiClient('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  /**
   * Get user profile details
   */
  async getProfile(id?: string) {
    const endpoint = id ? `/api/profiles/${id}` : '/api/profiles';
    return apiClient(endpoint, {
      method: 'GET',
    });
  },

  /**
   * Update user profile details
   */
  async updateProfile(id: string | null, profileData: any) {
    const endpoint = id ? `/api/profiles/${id}` : '/api/profiles';
    return apiClient(endpoint, {
      method: 'PUT',
      body: profileData,
    });
  },

  /**
   * Change user password
   */
  async changePassword(data: { current_password?: string; new_password: string }) {
    return apiClient('/api/auth/update-password', {
      method: 'POST',
      body: data,
    });
  },

  /**
   * Logout the user
   */
  async logout() {
    return apiClient('/api/auth/logout', {
      method: 'POST',
    });
  },
};
