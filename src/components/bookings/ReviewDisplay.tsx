import { Star, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  comment_ar: string | null;
  created_at: string;
  reviewer_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface ReviewDisplayProps {
  review: Review;
  isOwn?: boolean;
}

export function ReviewDisplay({ review, isOwn }: ReviewDisplayProps) {
  const { isRTL } = useLanguage();
  const displayComment = isRTL && review.comment_ar ? review.comment_ar : review.comment;
  const reviewerName = review.reviewer_profile?.full_name || (isRTL ? 'مستخدم' : 'User');

  return (
    <div className="flex gap-4 py-4 border-b last:border-0">
      <Avatar className="h-10 w-10">
        <AvatarFallback>{reviewerName.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium">{reviewerName}</span>
            {isOwn && (
              <Badge variant="secondary" className="text-xs">
                {isRTL ? 'تقييمك' : 'Your Review'}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            {format(new Date(review.created_at), 'PP')}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'h-4 w-4',
                star <= review.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-muted-foreground'
              )}
            />
          ))}
        </div>
        {displayComment && (
          <p className="text-sm text-muted-foreground">{displayComment}</p>
        )}
      </div>
    </div>
  );
}

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export function ReviewSummary({ averageRating, totalReviews, ratingDistribution }: ReviewSummaryProps) {
  const { isRTL } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isRTL ? 'ملخص التقييمات' : 'Rating Summary'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <div className="text-4xl font-bold">{averageRating.toFixed(1)}</div>
            <div className="flex items-center gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    'h-4 w-4',
                    star <= Math.round(averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  )}
                />
              ))}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              {totalReviews} {isRTL ? 'تقييم' : 'reviews'}
            </div>
          </div>

          {/* Distribution Bars */}
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingDistribution[rating] || 0;
              const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2 text-sm">
                  <span className="w-3">{rating}</span>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-8 text-muted-foreground text-xs">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface VerifiedReviewBadgeProps {
  className?: string;
}

export function VerifiedReviewBadge({ className }: VerifiedReviewBadgeProps) {
  const { isRTL } = useLanguage();
  
  return (
    <Badge variant="outline" className={cn("gap-1", className)}>
      <CheckCircle className="h-3 w-3 text-green-600" />
      {isRTL ? 'حجز موثق' : 'Verified Booking'}
    </Badge>
  );
}
