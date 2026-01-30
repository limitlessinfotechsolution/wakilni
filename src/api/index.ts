/**
 * API Services Index
 * Central export point for all API services
 */

// Base utilities
export * from './base';

// Entity services
export * as BookingsAPI from './services/bookings.service';
export * as ServicesAPI from './services/services.service';
export * as BeneficiariesAPI from './services/beneficiaries.service';
export * as ProvidersAPI from './services/providers.service';
export * as DonationsAPI from './services/donations.service';
export * as ReviewsAPI from './services/reviews.service';
export * as AuditAPI from './services/audit.service';

// Re-export types
export type { Booking, BookingWithDetails, CreateBookingRequest } from './services/bookings.service';
export type { Service, ServiceWithProvider, ServiceFilters } from './services/services.service';
export type { Beneficiary } from './services/beneficiaries.service';
export type { Provider, ProviderWithProfile, ProviderAvailability } from './services/providers.service';
export type { Donation, CharityRequest, CharityRequestWithBeneficiary, DonationStats } from './services/donations.service';
export type { Review, ReviewWithDetails } from './services/reviews.service';
export type { AuditLog, AuditLogFilters } from './services/audit.service';
