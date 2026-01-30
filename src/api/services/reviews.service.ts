/**
 * Reviews API Service
 * CRUD operations for reviews table
 */

import {
  supabase,
  ApiResponse,
  handleError,
  createSuccessResponse,
  createErrorResponse,
} from '../base';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

export type Review = Tables<'reviews'>;
export type ReviewInsert = TablesInsert<'reviews'>;

export interface ReviewWithDetails extends Review {
  reviewer?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
  booking?: {
    service?: {
      title: string;
      service_type: string;
    } | null;
    beneficiary?: {
      full_name: string;
    } | null;
  } | null;
}

// =============================================================================
// READ OPERATIONS
// =============================================================================

export async function getProviderReviews(
  providerId: string
): Promise<ApiResponse<ReviewWithDetails[]>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        booking:bookings(
          service:services(title, service_type),
          beneficiary:beneficiaries(full_name)
        )
      `)
      .eq('provider_id', providerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function getReviewStats(
  providerId: string
): Promise<ApiResponse<{
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
}>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', providerId);

    if (error) throw error;

    const reviews = data || [];
    const total = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    return createSuccessResponse({
      averageRating: total > 0 ? sum / total : 0,
      totalReviews: total,
      distribution,
    });
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

// =============================================================================
// WRITE OPERATIONS
// =============================================================================

export async function createReview(
  review: ReviewInsert
): Promise<ApiResponse<Review>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();

    if (error) throw error;

    // Update provider's rating stats
    await updateProviderRatingStats(review.provider_id);

    return createSuccessResponse(data);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

async function updateProviderRatingStats(providerId: string) {
  const stats = await getReviewStats(providerId);
  
  if (stats.success && stats.data) {
    await supabase
      .from('providers')
      .update({
        rating: stats.data.averageRating,
        total_reviews: stats.data.totalReviews,
      })
      .eq('id', providerId);
  }
}

// =============================================================================
// ADMIN OPERATIONS
// =============================================================================

export async function getAllReviews(): Promise<ApiResponse<ReviewWithDetails[]>> {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        booking:bookings(
          service:services(title, service_type),
          beneficiary:beneficiaries(full_name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return createSuccessResponse(data || []);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}

export async function deleteReview(
  reviewId: string
): Promise<ApiResponse<boolean>> {
  try {
    // Get the provider_id before deletion
    const { data: review } = await supabase
      .from('reviews')
      .select('provider_id')
      .eq('id', reviewId)
      .single();

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    // Update provider stats after deletion
    if (review?.provider_id) {
      await updateProviderRatingStats(review.provider_id);
    }

    return createSuccessResponse(true);
  } catch (error) {
    return createErrorResponse(handleError(error));
  }
}
