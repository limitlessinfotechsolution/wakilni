/**
 * Auth Module
 * Re-exports auth utilities and adds module-specific helpers
 */

export { useAuth, AuthProvider } from '@/lib/auth';
export { USER_ROLES, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '@/config/constants';
export { ROUTES, getDashboardRoute, canAccessRoute } from '@/config/routes';

/**
 * Check if user has a specific permission
 */
export function hasPermission(userRole: string | null, permission: string): boolean {
  if (!userRole) return false;
  
  const rolePermissions = (ROLE_PERMISSIONS as Record<string, string[]>)[userRole];
  if (!rolePermissions) return false;
  
  // Super admin has all permissions
  if (rolePermissions.includes('*')) return true;
  
  return rolePermissions.includes(permission);
}
