import { describe, it, expect } from 'vitest';
import { hasPermission, ROLE_PERMISSIONS, ROLE_HIERARCHY } from '@/modules/auth';
import { canAccessRoute, getDashboardRoute } from '@/config/routes';
import type { UserRole } from '@/config/constants';

describe('Auth Module - hasPermission', () => {
  it('should return false for null role', () => {
    expect(hasPermission(null, 'bookings:read')).toBe(false);
  });

  it('should grant all permissions to super_admin', () => {
    expect(hasPermission('super_admin', 'bookings:read')).toBe(true);
    expect(hasPermission('super_admin', 'users:write')).toBe(true);
    expect(hasPermission('super_admin', 'any:permission')).toBe(true);
  });

  it('should grant admin-specific permissions to admin', () => {
    expect(hasPermission('admin', 'users:read')).toBe(true);
    expect(hasPermission('admin', 'providers:approve')).toBe(true);
    expect(hasPermission('admin', 'bookings:allocate')).toBe(true);
  });

  it('should restrict traveler to own resources', () => {
    expect(hasPermission('traveler', 'bookings:read:own')).toBe(true);
    expect(hasPermission('traveler', 'bookings:create')).toBe(true);
    expect(hasPermission('traveler', 'users:write')).toBe(false);
  });

  it('should grant provider appropriate permissions', () => {
    expect(hasPermission('provider', 'services:write:own')).toBe(true);
    expect(hasPermission('provider', 'rituals:record')).toBe(true);
    expect(hasPermission('provider', 'users:write')).toBe(false);
  });

  it('should grant vendor appropriate permissions', () => {
    expect(hasPermission('vendor', 'bookings:manage')).toBe(true);
    expect(hasPermission('vendor', 'providers:read')).toBe(true);
    expect(hasPermission('vendor', 'users:write')).toBe(false);
  });
});

describe('Auth Module - ROLE_HIERARCHY', () => {
  it('should have correct hierarchy levels', () => {
    expect(ROLE_HIERARCHY.super_admin).toBeGreaterThan(ROLE_HIERARCHY.admin);
    expect(ROLE_HIERARCHY.admin).toBeGreaterThan(ROLE_HIERARCHY.vendor);
    expect(ROLE_HIERARCHY.vendor).toBeGreaterThan(ROLE_HIERARCHY.provider);
    expect(ROLE_HIERARCHY.provider).toBeGreaterThan(ROLE_HIERARCHY.traveler);
  });
});

describe('Routes - canAccessRoute', () => {
  it('should allow public routes for everyone', () => {
    expect(canAccessRoute('/', null, false)).toBe(true);
    expect(canAccessRoute('/services', null, false)).toBe(true);
    expect(canAccessRoute('/donate', null, false)).toBe(true);
  });

  it('should restrict admin routes to admin roles', () => {
    expect(canAccessRoute('/admin/users', 'traveler', true)).toBe(false);
    expect(canAccessRoute('/admin/users', 'admin', true)).toBe(true);
    expect(canAccessRoute('/admin/users', 'super_admin', true)).toBe(true);
  });

  it('should restrict super-admin routes', () => {
    expect(canAccessRoute('/super-admin/analytics', 'admin', true)).toBe(false);
    expect(canAccessRoute('/super-admin/analytics', 'super_admin', true)).toBe(true);
  });
});

describe('Routes - getDashboardRoute', () => {
  it('should return correct dashboard for each role', () => {
    expect(getDashboardRoute('super_admin')).toBe('/super-admin/analytics');
    expect(getDashboardRoute('admin')).toBe('/dashboard/admin');
    expect(getDashboardRoute('provider')).toBe('/dashboard/provider');
    expect(getDashboardRoute('vendor')).toBe('/dashboard/vendor');
    expect(getDashboardRoute('traveler')).toBe('/dashboard/traveler');
  });

  it('should return traveler dashboard for unknown role', () => {
    expect(getDashboardRoute(null)).toBe('/dashboard/traveler');
  });
});
