/**
 * Centralized Route Configuration
 * All application routes with role-based access definitions
 */

import { UserRole, USER_ROLES } from './constants';

// =============================================================================
// ROUTE PATHS
// =============================================================================

export const ROUTES = {
  // Public routes
  HOME: '/',
  LANDING: '/landing',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  SERVICES: '/services',
  DONATE: '/donate',
  VERIFY_CERTIFICATE: '/verify/:code',
  PROVIDER_PROFILE: '/providers/:id',
  NOT_FOUND: '/404',
  INSTALL_PWA: '/install',

  // Dashboard routes (role-specific entry points)
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/dashboard/admin',
  PROVIDER_DASHBOARD: '/dashboard/provider',
  TRAVELER_DASHBOARD: '/dashboard/traveler',
  VENDOR_DASHBOARD: '/dashboard/vendor',

  // Traveler routes
  BOOKINGS: '/bookings',
  BOOKING_DETAIL: '/bookings/:id',
  NEW_BOOKING: '/bookings/new',
  BENEFICIARIES: '/beneficiaries',

  // Provider routes
  PROVIDER_SERVICES: '/provider/services',
  PROVIDER_AVAILABILITY: '/provider/availability',
  PROVIDER_CALENDAR: '/provider/calendar',
  PROVIDER_KYC: '/provider/kyc',
  PROVIDER_REVIEWS: '/provider/reviews',
  PROVIDER_GALLERY: '/provider/gallery',

  // Vendor routes
  VENDOR_BOOKINGS: '/vendor/bookings',
  VENDOR_SERVICES: '/vendor/services',
  VENDOR_SUBSCRIPTION: '/vendor/subscription',
  VENDOR_KYC: '/vendor/kyc',

  // Admin routes
  ADMIN_USERS: '/admin/users',
  ADMIN_PROVIDERS: '/admin/providers',
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_KYC_QUEUE: '/admin/kyc-queue',
  ADMIN_BOOKING_ALLOCATION: '/admin/booking-allocation',
  ADMIN_DONATIONS: '/admin/donations',
  ADMIN_SUBSCRIPTIONS: '/admin/subscriptions',
  ADMIN_SCHOLAR_VERIFICATION: '/admin/scholar-verification',

  // Super Admin routes
  SUPER_ADMIN_MANAGEMENT: '/super-admin/admins',
  SUPER_ADMIN_ANALYTICS: '/super-admin/analytics',
  SUPER_ADMIN_AUDIT_LOGS: '/super-admin/audit-logs',
  SUPER_ADMIN_SYSTEM_SETTINGS: '/super-admin/system-settings',

  // Settings
  PROFILE_SETTINGS: '/settings/profile',
} as const;

// =============================================================================
// ROUTE ACCESS CONTROL
// =============================================================================

type RouteConfig = {
  path: string;
  allowedRoles: UserRole[] | 'public' | 'authenticated';
  redirectTo?: string;
  title: { en: string; ar: string };
};

export const ROUTE_CONFIG: Record<string, RouteConfig> = {
  // Public routes
  [ROUTES.HOME]: {
    path: ROUTES.HOME,
    allowedRoles: 'public',
    title: { en: 'Home', ar: 'الرئيسية' },
  },
  [ROUTES.LANDING]: {
    path: ROUTES.LANDING,
    allowedRoles: 'public',
    title: { en: 'Welcome', ar: 'مرحبا' },
  },
  [ROUTES.LOGIN]: {
    path: ROUTES.LOGIN,
    allowedRoles: 'public',
    title: { en: 'Login', ar: 'تسجيل الدخول' },
  },
  [ROUTES.SIGNUP]: {
    path: ROUTES.SIGNUP,
    allowedRoles: 'public',
    title: { en: 'Sign Up', ar: 'إنشاء حساب' },
  },
  [ROUTES.SERVICES]: {
    path: ROUTES.SERVICES,
    allowedRoles: 'public',
    title: { en: 'Services', ar: 'الخدمات' },
  },
  [ROUTES.DONATE]: {
    path: ROUTES.DONATE,
    allowedRoles: 'public',
    title: { en: 'Donate', ar: 'تبرع' },
  },

  // Traveler routes
  [ROUTES.BOOKINGS]: {
    path: ROUTES.BOOKINGS,
    allowedRoles: [USER_ROLES.TRAVELER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    title: { en: 'My Bookings', ar: 'حجوزاتي' },
  },
  [ROUTES.BENEFICIARIES]: {
    path: ROUTES.BENEFICIARIES,
    allowedRoles: [USER_ROLES.TRAVELER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    title: { en: 'Beneficiaries', ar: 'المستفيدون' },
  },

  // Provider routes
  [ROUTES.PROVIDER_SERVICES]: {
    path: ROUTES.PROVIDER_SERVICES,
    allowedRoles: [USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    title: { en: 'My Services', ar: 'خدماتي' },
  },
  [ROUTES.PROVIDER_CALENDAR]: {
    path: ROUTES.PROVIDER_CALENDAR,
    allowedRoles: [USER_ROLES.PROVIDER, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    title: { en: 'Calendar', ar: 'التقويم' },
  },
  [ROUTES.PROVIDER_KYC]: {
    path: ROUTES.PROVIDER_KYC,
    allowedRoles: [USER_ROLES.PROVIDER],
    title: { en: 'Verification', ar: 'التحقق' },
  },

  // Vendor routes
  [ROUTES.VENDOR_BOOKINGS]: {
    path: ROUTES.VENDOR_BOOKINGS,
    allowedRoles: [USER_ROLES.VENDOR, USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    title: { en: 'Vendor Bookings', ar: 'حجوزات الوكالة' },
  },
  [ROUTES.VENDOR_SUBSCRIPTION]: {
    path: ROUTES.VENDOR_SUBSCRIPTION,
    allowedRoles: [USER_ROLES.VENDOR],
    title: { en: 'Subscription', ar: 'الاشتراك' },
  },

  // Admin routes
  [ROUTES.ADMIN_USERS]: {
    path: ROUTES.ADMIN_USERS,
    allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    title: { en: 'User Management', ar: 'إدارة المستخدمين' },
  },
  [ROUTES.ADMIN_PROVIDERS]: {
    path: ROUTES.ADMIN_PROVIDERS,
    allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    title: { en: 'Provider Management', ar: 'إدارة مقدمي الخدمات' },
  },
  [ROUTES.ADMIN_DONATIONS]: {
    path: ROUTES.ADMIN_DONATIONS,
    allowedRoles: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN],
    title: { en: 'Donations', ar: 'التبرعات' },
  },

  // Super Admin routes
  [ROUTES.SUPER_ADMIN_ANALYTICS]: {
    path: ROUTES.SUPER_ADMIN_ANALYTICS,
    allowedRoles: [USER_ROLES.SUPER_ADMIN],
    title: { en: 'Analytics', ar: 'التحليلات' },
  },
  [ROUTES.SUPER_ADMIN_AUDIT_LOGS]: {
    path: ROUTES.SUPER_ADMIN_AUDIT_LOGS,
    allowedRoles: [USER_ROLES.SUPER_ADMIN],
    title: { en: 'Audit Logs', ar: 'سجلات المراجعة' },
  },
  [ROUTES.SUPER_ADMIN_SYSTEM_SETTINGS]: {
    path: ROUTES.SUPER_ADMIN_SYSTEM_SETTINGS,
    allowedRoles: [USER_ROLES.SUPER_ADMIN],
    title: { en: 'System Settings', ar: 'إعدادات النظام' },
  },
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the default dashboard route for a user role
 */
export function getDashboardRoute(role: UserRole | null): string {
  switch (role) {
    case USER_ROLES.SUPER_ADMIN:
      return ROUTES.SUPER_ADMIN_ANALYTICS;
    case USER_ROLES.ADMIN:
      return ROUTES.ADMIN_DASHBOARD;
    case USER_ROLES.VENDOR:
      return ROUTES.VENDOR_DASHBOARD;
    case USER_ROLES.PROVIDER:
      return ROUTES.PROVIDER_DASHBOARD;
    case USER_ROLES.TRAVELER:
    default:
      return ROUTES.TRAVELER_DASHBOARD;
  }
}

/**
 * Check if a role has access to a route
 */
export function canAccessRoute(route: string, role: UserRole | null, isAuthenticated: boolean): boolean {
  const config = ROUTE_CONFIG[route];
  if (!config) return true; // Unknown routes are allowed (will 404)

  if (config.allowedRoles === 'public') return true;
  if (config.allowedRoles === 'authenticated') return isAuthenticated;
  if (!role) return false;

  return config.allowedRoles.includes(role);
}

/**
 * Build a dynamic route path with parameters
 */
export function buildRoute(route: string, params: Record<string, string>): string {
  let path = route;
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`:${key}`, value);
  });
  return path;
}
