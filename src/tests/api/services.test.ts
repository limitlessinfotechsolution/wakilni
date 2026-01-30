/**
 * API Services Test Suite
 * Unit tests for API service layer
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      range: vi.fn().mockReturnThis(),
    })),
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe('API Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Base API utilities', () => {
    it('should handle errors correctly', async () => {
      const { handleError } = await import('@/api/base');
      
      const error = new Error('Test error');
      const result = handleError(error);
      
      expect(result.message).toBe('Test error');
      expect(result.code).toBe('UNKNOWN_ERROR');
    });

    it('should create success response', async () => {
      const { createSuccessResponse } = await import('@/api/base');
      
      const data = { id: '123', name: 'Test' };
      const result = createSuccessResponse(data);
      
      expect(result.success).toBe(true);
      expect(result.data).toEqual(data);
      expect(result.error).toBeNull();
    });

    it('should create error response', async () => {
      const { createErrorResponse } = await import('@/api/base');
      
      const error = { message: 'Failed', code: 'ERR_001' };
      const result = createErrorResponse(error);
      
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toEqual(error);
    });
  });

  describe('Bookings Service', () => {
    it('should export required functions', async () => {
      const BookingsService = await import('@/api/services/bookings.service');
      
      expect(BookingsService.getBookings).toBeDefined();
      expect(BookingsService.getBookingById).toBeDefined();
      expect(BookingsService.createBooking).toBeDefined();
      expect(BookingsService.updateBooking).toBeDefined();
      expect(BookingsService.updateBookingStatus).toBeDefined();
    });
  });

  describe('Services Service', () => {
    it('should export required functions', async () => {
      const ServicesService = await import('@/api/services/services.service');
      
      expect(ServicesService.getServices).toBeDefined();
      expect(ServicesService.getServiceById).toBeDefined();
      expect(ServicesService.createService).toBeDefined();
      expect(ServicesService.updateService).toBeDefined();
    });
  });

  describe('Providers Service', () => {
    it('should export required functions', async () => {
      const ProvidersService = await import('@/api/services/providers.service');
      
      expect(ProvidersService.getProvider).toBeDefined();
      expect(ProvidersService.getProviderById).toBeDefined();
      expect(ProvidersService.createProvider).toBeDefined();
      expect(ProvidersService.updateProvider).toBeDefined();
      expect(ProvidersService.submitProviderKyc).toBeDefined();
    });
  });
});
