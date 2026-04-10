import { apiClient } from './api-client';

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
};
