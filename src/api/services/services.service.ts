/**
 * Services API Service
 * CRUD operations for services table
 */

import {
  supabase,
  ApiResponse,
  handleError,
  createSuccessResponse,
  createErrorResponse,
} from '../base';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import type { ServiceType } from '@/config/constants';

export type Service = Tables<'services'>;
export type ServiceInsert = TablesInsert<'services'>;
export type ServiceUpdate = TablesUpdate<'services'>;

export interface ServiceWithProvider extends Service {
  provider?: {
    id: string;
    company_name: string | null;
    company_name_ar: string | null;
    rating: number | null;
    total_reviews: number | null;
    bio: string | null;
    bio_ar: string | null;
  } | null;
}

export interface ServiceFilters {
  serviceType?: ServiceType;
  providerId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

export async function getServices(
  filters?: ServiceFilters
): Promise<ApiResponse<ServiceWithProvider[]>> {
  try {
    let query = supabase
      .from('services')
      .select(`
        *,
        provider:providers(
          id,
          company_name,
          company_name_ar,
          rating,
          total_reviews,
          bio,
          bio_ar
        )
      `)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters?.isActive !== false) {
      query = query.eq('is_active', true);
    }

    if (filters?.serviceType) {
      query = query.eq('service_type', filters.serviceType);
    }

    if (filters?.providerId) {
      query = query.eq('provider_id', filters.providerId);
    }

    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }

    const { data, error } = await query;
    if (error) throw error;

    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getServiceById(
  serviceId: string
): Promise<ApiResponse<ServiceWithProvider>> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select(`
        *,
        provider:providers(
          id,
          company_name,
          company_name_ar,
          rating,
          total_reviews,
          bio,
          bio_ar
        )
      `)
      .eq('id', serviceId)
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getProviderServices(
  providerId: string,
  includeInactive = false
): Promise<ApiResponse<Service[]>> {
  try {
    let query = supabase
      .from('services')
      .select('*')
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;
    if (error) throw error;

    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// WRITE OPERATIONS (Provider)
// =============================================================================

export async function createService(
  service: ServiceInsert
): Promise<ApiResponse<Service>> {
  try {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function updateService(
  serviceId: string,
  updates: ServiceUpdate
): Promise<ApiResponse<Service>> {
  try {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', serviceId)
      .select()
      .single();

    if (error) throw error;
    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function toggleServiceActive(
  serviceId: string,
  isActive: boolean
): Promise<ApiResponse<Service>> {
  return updateService(serviceId, { is_active: isActive });
}

export async function deleteService(
  serviceId: string
): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', serviceId);

    if (error) throw error;
    return createSuccessResponse(true);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// AGGREGATIONS
// =============================================================================

export async function getServiceStats(): Promise<ApiResponse<{
  total: number;
  byType: Record<string, number>;
  avgPrice: number;
}>> {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('service_type, price')
      .eq('is_active', true);

    if (error) throw error;

    const byType: Record<string, number> = {};
    let totalPrice = 0;

    (data || []).forEach((service) => {
      byType[service.service_type] = (byType[service.service_type] || 0) + 1;
      totalPrice += service.price;
    });

    return createSuccessResponse({
      total: data?.length || 0,
      byType,
      avgPrice: data?.length ? totalPrice / data.length : 0,
    });
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}
