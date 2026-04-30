import { apiClient } from '../api-client';

export const superAdminService = {
  /**
   * Fetch all roles
   */
  async getRoles() {
    return apiClient('/api/super-admin/roles', {
      method: 'GET',
    });
  },

  /**
   * Fetch permissions for a specific role
   */
  async getRolePermissions(roleId: string) {
    return apiClient(`/api/super-admin/role-permissions?role_id=${roleId}`, {
      method: 'GET',
    });
  },

  /**
   * Save (assign/unassign) permissions for a role
   */
  async saveRolePermissions(payload: { role_id: string; permissions: { id: string; assigned: boolean }[] }) {
    return apiClient('/api/super-admin/role-permissions', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Add a new permission and assign to roles
   */
  async addPermission(payload: { name: string; role_ids: string[] }) {
    return apiClient('/api/super-admin/role-permissions', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Update an existing permission's name
   */
  async updatePermission(payload: { permission_id: string; name: string }) {
    return apiClient('/api/super-admin/role-permissions', {
      method: 'PUT',
      body: payload,
    });
  },

  /**
   * Delete a permission
   */
  async deletePermission(permissionId: string) {
    return apiClient(`/api/super-admin/role-permissions?permission_id=${permissionId}`, {
      method: 'DELETE',
    });
  },
};
