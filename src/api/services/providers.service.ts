/**
 * Providers API Service
 * CRUD operations for providers and provider_availability tables
 */

import {
  supabase,
  ApiResponse,
  handleError,
  createSuccessResponse,
  createErrorResponse,
} from '../base';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import type { KycStatus } from '@/config/constants';

export type Provider = Tables<'providers'>;
export type ProviderInsert = TablesInsert<'providers'>;
export type ProviderUpdate = TablesUpdate<'providers'>;
export type ProviderAvailability = Tables<'provider_availability'>;

export interface ProviderWithProfile extends Provider {
  profile?: {
    full_name: string | null;
    avatar_url: string | null;
    phone: string | null;
  } | null;
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

export async function getProvider(
  userId: string
): Promise<ApiResponse<Provider>> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getProviderById(
  providerId: string
): Promise<ApiResponse<Provider>> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('id', providerId)
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getPublicProviders(): Promise<ApiResponse<Provider[]>> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .select('*')
      .eq('kyc_status', 'approved')
      .eq('is_active', true)
      .eq('is_suspended', false)
      .order('rating', { ascending: false });

    if (error) throw error;
    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

export async function createProvider(
  provider: ProviderInsert
): Promise<ApiResponse<Provider>> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .insert(provider)
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function updateProvider(
  providerId: string,
  updates: ProviderUpdate
): Promise<ApiResponse<Provider>> {
  try {
    const { data, error } = await supabase
      .from('providers')
      .update(updates)
      .eq('id', providerId)
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function submitProviderKyc(
  providerId: string
): Promise<ApiResponse<Provider>> {
  return updateProvider(providerId, {
    kyc_status: 'under_review',
    kyc_submitted_at: new Date().toISOString(),
  });
}

// =============================================================================
// AVAILABILITY OPERATIONS
// =============================================================================

export async function getProviderAvailability(
  providerId: string,
  dateFrom?: string,
  dateTo?: string
): Promise<ApiResponse<ProviderAvailability[]>> {
  try {
    let query = supabase
      .from('provider_availability')
      .select('*')
      .eq('provider_id', providerId)
      .order('date', { ascending: true });

    if (dateFrom) {
      query = query.gte('date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('date', dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;

    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function setProviderAvailability(
  providerId: string,
  date: string,
  isAvailable: boolean,
  maxBookings = 1
): Promise<ApiResponse<ProviderAvailability>> {
  try {
    const { data, error } = await supabase
      .from('provider_availability')
      .upsert({
        provider_id: providerId,
        date,
        is_available: isAvailable,
        max_bookings: maxBookings,
      }, {
        onConflict: 'provider_id,date',
      })
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// ADMIN OPERATIONS
// =============================================================================

export async function getAllProviders(
  kycStatus?: KycStatus
): Promise<ApiResponse<Provider[]>> {
  try {
    let query = supabase
      .from('providers')
      .select('*')
      .order('created_at', { ascending: false });

    if (kycStatus) {
      query = query.eq('kyc_status', kycStatus);
    }

    const { data, error } = await query;
    if (error) throw error;

    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function approveProviderKyc(
  providerId: string,
  notes?: string
): Promise<ApiResponse<Provider>> {
  return updateProvider(providerId, {
    kyc_status: 'approved',
    kyc_notes: notes,
    kyc_reviewed_at: new Date().toISOString(),
    is_active: true,
  });
}

export async function rejectProviderKyc(
  providerId: string,
  notes: string
): Promise<ApiResponse<Provider>> {
  return updateProvider(providerId, {
    kyc_status: 'rejected',
    kyc_notes: notes,
    kyc_reviewed_at: new Date().toISOString(),
  });
}

export async function suspendProvider(
  providerId: string,
  reason: string
): Promise<ApiResponse<Provider>> {
  return updateProvider(providerId, {
    is_suspended: true,
    suspension_reason: reason,
    is_active: false,
  });
}

export async function unsuspendProvider(
  providerId: string
): Promise<ApiResponse<Provider>> {
  return updateProvider(providerId, {
    is_suspended: false,
    suspension_reason: null,
    is_active: true,
  });
}
