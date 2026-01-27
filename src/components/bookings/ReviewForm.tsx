import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string, commentAr?: string) => Promise<boolean>;
  existingReview?: {
    rating: number;
    comment: string | null;
    comment_ar: string | null;
  } | null;
  isSubmitting?: boolean;
}

export function ReviewForm({ onSubmit, existingReview, isSubmitting }: ReviewFormProps) {
  const { isRTL } = useLanguage();
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [commentAr, setCommentAr] = useState(existingReview?.comment_ar || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    await onSubmit(rating, comment, commentAr);
    setLoading(false);
  };

  const ratingLabels = {
    1: { en: 'Poor', ar: 'ضعيف' },
    2: { en: 'Fair', ar: 'مقبول' },
    3: { en: 'Good', ar: 'جيد' },
    4: { en: 'Very Good', ar: 'جيد جداً' },
    5: { en: 'Excellent', ar: 'ممتاز' },
  };

  const displayRating = hoveredRating || rating;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {existingReview 
            ? (isRTL ? 'تعديل التقييم' : 'Edit Your Review')
            : (isRTL ? 'قيّم مقدم الخدمة' : 'Rate the Provider')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      star <= displayRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <p className="text-sm text-muted-foreground">
                {ratingLabels[displayRating as keyof typeof ratingLabels][isRTL ? 'ar' : 'en']}
              </p>
            )}
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isRTL ? 'تعليقك (اختياري)' : 'Your Comment (Optional)'}
            </label>
            <Textarea
              value={isRTL ? commentAr : comment}
              onChange={(e) => isRTL ? setCommentAr(e.target.value) : setComment(e.target.value)}
              placeholder={isRTL 
                ? 'شاركنا تجربتك مع مقدم الخدمة...'
                : 'Share your experience with the provider...'}
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            disabled={rating === 0 || loading || isSubmitting}
            className="w-full"
          >
            {(loading || isSubmitting) && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
            {existingReview 
              ? (isRTL ? 'تحديث التقييم' : 'Update Review')
              : (isRTL ? 'إرسال التقييم' : 'Submit Review')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
