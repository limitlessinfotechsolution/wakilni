/**
 * Bookings Module
 * Consolidates booking-related functionality
 */

export { useBookings } from '@/hooks/useBookings';
export { useBookingDetail } from '@/hooks/useBookingDetail';
export { useBookingStatus } from '@/hooks/useBookingStatus';
export * as BookingsAPI from '@/api/services/bookings.service';
export { BOOKING_STATUSES, BOOKING_STATUS_LABELS, BOOKING_STATUS_COLORS } from '@/config/constants';
