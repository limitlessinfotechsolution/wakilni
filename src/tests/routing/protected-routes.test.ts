import { describe, it, expect } from 'vitest';
import { ROUTE_CONFIG, canAccessRoute, getDashboardRoute } from '@/config/routes';
import type { UserRole } from '@/config/constants';

describe('Protected Routes', () => {
  describe('Route Configuration', () => {
    it('should have public routes defined', () => {
      expect(ROUTE_CONFIG['/']).toBeDefined();
      expect(ROUTE_CONFIG['/'].allowedRoles).toBe('public');
    });

    it('should have authenticated routes defined', () => {
      expect(ROUTE_CONFIG['/dashboard']).toBeDefined();
      expect(ROUTE_CONFIG['/dashboard'].allowedRoles).toBe('authenticated');
    });

    it('should have role-specific routes defined', () => {
      const adminRoute = ROUTE_CONFIG['/admin/users'];
      expect(adminRoute).toBeDefined();
      expect(Array.isArray(adminRoute.allowedRoles)).toBe(true);
    });
  });

  describe('Access Control', () => {
    const roles: UserRole[] = ['super_admin', 'admin', 'vendor', 'provider', 'traveler'];

    it('should allow all roles to access public routes', () => {
      roles.forEach(role => {
        expect(canAccessRoute('/', role, true)).toBe(true);
        expect(canAccessRoute('/services', role, true)).toBe(true);
      });
    });

    it('should allow unauthenticated users to access public routes', () => {
      expect(canAccessRoute('/', null, false)).toBe(true);
      expect(canAccessRoute('/services', null, false)).toBe(true);
    });

    it('should deny unauthenticated users from protected routes', () => {
      expect(canAccessRoute('/dashboard', null, false)).toBe(false);
      expect(canAccessRoute('/bookings', null, false)).toBe(false);
    });

    it('should restrict admin routes to admins only', () => {
      expect(canAccessRoute('/admin/users', 'traveler', true)).toBe(false);
      expect(canAccessRoute('/admin/users', 'provider', true)).toBe(false);
      expect(canAccessRoute('/admin/users', 'admin', true)).toBe(true);
    });

    it('should restrict super-admin routes to super_admin only', () => {
      expect(canAccessRoute('/super-admin/analytics', 'admin', true)).toBe(false);
      expect(canAccessRoute('/super-admin/analytics', 'super_admin', true)).toBe(true);
    });

    it('should restrict provider routes to providers', () => {
      expect(canAccessRoute('/provider/services', 'provider', true)).toBe(true);
      expect(canAccessRoute('/provider/services', 'traveler', true)).toBe(false);
    });

    it('should restrict vendor routes to vendors', () => {
      expect(canAccessRoute('/vendor/bookings', 'vendor', true)).toBe(true);
      expect(canAccessRoute('/vendor/bookings', 'traveler', true)).toBe(false);
    });
  });

  describe('Dashboard Routing', () => {
    it('should route super_admin to analytics dashboard', () => {
      expect(getDashboardRoute('super_admin')).toBe('/super-admin/analytics');
    });

    it('should route admin to bookings management', () => {
      expect(getDashboardRoute('admin')).toBe('/admin/bookings');
    });

    it('should route provider to provider dashboard', () => {
      expect(getDashboardRoute('provider')).toBe('/provider/dashboard');
    });

    it('should route vendor to vendor dashboard', () => {
      expect(getDashboardRoute('vendor')).toBe('/vendor/dashboard');
    });

    it('should route traveler to main dashboard', () => {
      expect(getDashboardRoute('traveler')).toBe('/dashboard');
    });

    it('should default to main dashboard for unknown roles', () => {
      expect(getDashboardRoute(null)).toBe('/dashboard');
      expect(getDashboardRoute(undefined as unknown as UserRole)).toBe('/dashboard');
    });
  });

  describe('Route Hierarchy', () => {
    it('should allow super_admin to access all admin routes', () => {
      expect(canAccessRoute('/admin/users', 'super_admin', true)).toBe(true);
      expect(canAccessRoute('/admin/providers', 'super_admin', true)).toBe(true);
      expect(canAccessRoute('/admin/kyc', 'super_admin', true)).toBe(true);
    });

    it('should allow admins to access their specific routes', () => {
      expect(canAccessRoute('/admin/users', 'admin', true)).toBe(true);
      expect(canAccessRoute('/admin/providers', 'admin', true)).toBe(true);
    });
  });
});
