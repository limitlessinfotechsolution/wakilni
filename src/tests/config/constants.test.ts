/**
 * Constants & Configuration Test Suite
 */

import { describe, it, expect } from 'vitest';
import {
  APP_CONFIG,
  USER_ROLES,
  ROLE_HIERARCHY,
  BOOKING_STATUSES,
  SERVICE_TYPES,
  KYC_STATUSES,
} from '@/config/constants';
import { ROUTES, getDashboardRoute, canAccessRoute } from '@/config/routes';

describe('Configuration Constants', () => {
  describe('APP_CONFIG', () => {
    it('should have required app metadata', () => {
      expect(APP_CONFIG.name).toBe('Wakilni');
      expect(APP_CONFIG.defaultLanguage).toBe('en');
      expect(APP_CONFIG.supportedLanguages).toContain('en');
      expect(APP_CONFIG.supportedLanguages).toContain('ar');
    });
  });

  describe('USER_ROLES', () => {
    it('should define all required roles', () => {
      expect(USER_ROLES.SUPER_ADMIN).toBe('super_admin');
      expect(USER_ROLES.ADMIN).toBe('admin');
      expect(USER_ROLES.TRAVELER).toBe('traveler');
      expect(USER_ROLES.PROVIDER).toBe('provider');
      expect(USER_ROLES.VENDOR).toBe('vendor');
    });

    it('should have hierarchy for all roles', () => {
      Object.values(USER_ROLES).forEach((role) => {
        expect(ROLE_HIERARCHY[role]).toBeDefined();
        expect(typeof ROLE_HIERARCHY[role]).toBe('number');
      });
    });
  });

  describe('BOOKING_STATUSES', () => {
    it('should define all booking statuses', () => {
      expect(BOOKING_STATUSES.PENDING).toBe('pending');
      expect(BOOKING_STATUSES.ACCEPTED).toBe('accepted');
      expect(BOOKING_STATUSES.IN_PROGRESS).toBe('in_progress');
      expect(BOOKING_STATUSES.COMPLETED).toBe('completed');
      expect(BOOKING_STATUSES.CANCELLED).toBe('cancelled');
      expect(BOOKING_STATUSES.DISPUTED).toBe('disputed');
    });
  });

  describe('SERVICE_TYPES', () => {
    it('should define all service types', () => {
      expect(SERVICE_TYPES.UMRAH).toBe('umrah');
      expect(SERVICE_TYPES.HAJJ).toBe('hajj');
      expect(SERVICE_TYPES.ZIYARAT).toBe('ziyarat');
    });
  });

  describe('KYC_STATUSES', () => {
    it('should define all KYC statuses', () => {
      expect(KYC_STATUSES.PENDING).toBe('pending');
      expect(KYC_STATUSES.UNDER_REVIEW).toBe('under_review');
      expect(KYC_STATUSES.APPROVED).toBe('approved');
      expect(KYC_STATUSES.REJECTED).toBe('rejected');
    });
  });
});

describe('Route Configuration', () => {
  describe('ROUTES', () => {
    it('should define public routes', () => {
      expect(ROUTES.HOME).toBe('/');
      expect(ROUTES.LOGIN).toBe('/auth/login');
      expect(ROUTES.SIGNUP).toBe('/auth/signup');
      expect(ROUTES.SERVICES).toBe('/services');
    });

    it('should define dashboard routes', () => {
      expect(ROUTES.DASHBOARD).toBe('/dashboard');
      expect(ROUTES.ADMIN_DASHBOARD).toBe('/dashboard/admin');
      expect(ROUTES.PROVIDER_DASHBOARD).toBe('/dashboard/provider');
    });
  });

  describe('getDashboardRoute', () => {
    it('should return correct dashboard for each role', () => {
      expect(getDashboardRoute('super_admin')).toBe(ROUTES.SUPER_ADMIN_ANALYTICS);
      expect(getDashboardRoute('admin')).toBe(ROUTES.ADMIN_DASHBOARD);
      expect(getDashboardRoute('vendor')).toBe(ROUTES.VENDOR_DASHBOARD);
      expect(getDashboardRoute('provider')).toBe(ROUTES.PROVIDER_DASHBOARD);
      expect(getDashboardRoute('traveler')).toBe(ROUTES.TRAVELER_DASHBOARD);
      expect(getDashboardRoute(null)).toBe(ROUTES.TRAVELER_DASHBOARD);
    });
  });

  describe('canAccessRoute', () => {
    it('should allow public routes for everyone', () => {
      expect(canAccessRoute(ROUTES.HOME, null, false)).toBe(true);
      expect(canAccessRoute(ROUTES.SERVICES, 'traveler', true)).toBe(true);
    });

    it('should restrict admin routes', () => {
      expect(canAccessRoute(ROUTES.ADMIN_USERS, null, false)).toBe(false);
      expect(canAccessRoute(ROUTES.ADMIN_USERS, 'traveler', true)).toBe(false);
      expect(canAccessRoute(ROUTES.ADMIN_USERS, 'admin', true)).toBe(true);
      expect(canAccessRoute(ROUTES.ADMIN_USERS, 'super_admin', true)).toBe(true);
    });
  });
});
