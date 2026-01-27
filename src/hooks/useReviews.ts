import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Review = Tables<'reviews'>;

interface ReviewWithProfile extends Review {
  reviewer_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

export function useReviews(providerId?: string, bookingId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [existingReview, setExistingReview] = useState<Review | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!providerId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('provider_id', providerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately for reviewers
      const reviewsWithProfiles: ReviewWithProfile[] = [];
      for (const review of data || []) {
        if (review.reviewer_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('user_id', review.reviewer_id)
            .maybeSingle();
          
          reviewsWithProfiles.push({
            ...review,
            reviewer_profile: profile,
          });
        } else {
          reviewsWithProfiles.push(review);
        }
      }
      
      setReviews(reviewsWithProfiles);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  }, [providerId]);

  const checkExistingReview = useCallback(async () => {
    if (!bookingId || !user) return;

    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('booking_id', bookingId)
        .maybeSingle();

      if (error) throw error;
      setExistingReview(data);
    } catch (error) {
      console.error('Error checking existing review:', error);
    }
  }, [bookingId, user]);

  const submitReview = async (
    rating: number,
    comment: string,
    commentAr?: string
  ) => {
    if (!user || !bookingId || !providerId) return false;

    try {
      const { error } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        provider_id: providerId,
        reviewer_id: user.id,
        rating,
        comment: comment || null,
        comment_ar: commentAr || null,
      });

      if (error) throw error;

      // Update provider's rating
      await updateProviderRating(providerId);

      toast({
        title: 'Review Submitted',
        description: 'Thank you for your feedback!',
      });

      await checkExistingReview();
      return true;
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateReview = async (
    reviewId: string,
    rating: number,
    comment: string,
    commentAr?: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('reviews')
        .update({
          rating,
          comment: comment || null,
          comment_ar: commentAr || null,
        })
        .eq('id', reviewId)
        .eq('reviewer_id', user.id);

      if (error) throw error;

      if (providerId) {
        await updateProviderRating(providerId);
      }

      toast({
        title: 'Review Updated',
        description: 'Your review has been updated',
      });

      await checkExistingReview();
      return true;
    } catch (error: any) {
      console.error('Error updating review:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update review',
        variant: 'destructive',
      });
      return false;
    }
  };

  useEffect(() => {
    fetchReviews();
    checkExistingReview();
  }, [fetchReviews, checkExistingReview]);

  return {
    reviews,
    existingReview,
    isLoading,
    submitReview,
    updateReview,
    refetch: fetchReviews,
  };
}

async function updateProviderRating(providerId: string) {
  try {
    // Calculate new average rating
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('provider_id', providerId);

    if (reviewsError) throw reviewsError;

    if (reviews && reviews.length > 0) {
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / reviews.length;

      await supabase
        .from('providers')
        .update({
          rating: Math.round(avgRating * 10) / 10,
          total_reviews: reviews.length,
        })
        .eq('id', providerId);
    }
  } catch (error) {
    console.error('Error updating provider rating:', error);
  }
}

export function useProviderReviews(providerId: string | undefined) {
  const [reviews, setReviews] = useState<ReviewWithProfile[]>([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!providerId) {
      setIsLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .eq('provider_id', providerId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const reviewsData = data || [];
        setReviews(reviewsData);

        // Calculate stats
        if (reviewsData.length > 0) {
          const total = reviewsData.reduce((sum, r) => sum + r.rating, 0);
          const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
          reviewsData.forEach((r) => {
            if (r.rating >= 1 && r.rating <= 5) {
              distribution[r.rating as keyof typeof distribution]++;
            }
          });

          setStats({
            averageRating: Math.round((total / reviewsData.length) * 10) / 10,
            totalReviews: reviewsData.length,
            ratingDistribution: distribution,
          });
        }
      } catch (error) {
        console.error('Error fetching provider reviews:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, [providerId]);

  return { reviews, stats, isLoading };
}
