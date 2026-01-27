import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ArrowLeft, 
  ArrowRight,
  Calendar, 
  User, 
  DollarSign,
  CheckCircle,
  Clock,
  PlayCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MainLayout } from '@/components/layout';
import { BookingTimeline } from '@/components/bookings/BookingTimeline';
import { BookingMessages } from '@/components/bookings/BookingMessages';
import { ProofGallery } from '@/components/bookings/ProofGallery';
import { ReviewForm } from '@/components/bookings/ReviewForm';
import { ReviewDisplay } from '@/components/bookings/ReviewDisplay';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useBookingDetail, type BookingStatus } from '@/hooks/useBookingDetail';
import { useReviews } from '@/hooks/useReviews';
import { cn } from '@/lib/utils';

const statusConfig: Record<BookingStatus, { icon: typeof Clock; color: string; bgColor: string; label: { en: string; ar: string } }> = {
  pending: { 
    icon: Clock, 
    color: 'text-muted-foreground', 
    bgColor: 'bg-muted',
    label: { en: 'Pending', ar: 'معلق' }
  },
  accepted: { 
    icon: CheckCircle, 
    color: 'text-blue-600', 
    bgColor: 'bg-blue-100',
    label: { en: 'Accepted', ar: 'مقبول' }
  },
  in_progress: { 
    icon: PlayCircle, 
    color: 'text-yellow-600', 
    bgColor: 'bg-yellow-100',
    label: { en: 'In Progress', ar: 'قيد التنفيذ' }
  },
  completed: { 
    icon: CheckCircle, 
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    label: { en: 'Completed', ar: 'مكتمل' }
  },
  cancelled: { 
    icon: XCircle, 
    color: 'text-destructive', 
    bgColor: 'bg-destructive/10',
    label: { en: 'Cancelled', ar: 'ملغي' }
  },
  disputed: { 
    icon: AlertTriangle, 
    color: 'text-orange-600', 
    bgColor: 'bg-orange-100',
    label: { en: 'Disputed', ar: 'متنازع عليه' }
  },
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isRTL } = useLanguage();
  const { user, role } = useAuth();
  const { 
    booking, 
    activities, 
    messages, 
    isLoading, 
    updateStatus,
    sendMessage,
    uploadProof,
    markMessagesAsRead 
  } = useBookingDetail(id);
  
  const providerId = booking?.provider?.id;
  const { existingReview, submitReview, updateReview } = useReviews(providerId, id);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </MainLayout>
    );
  }

  if (!booking) {
    return (
      <MainLayout>
        <div className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                {isRTL ? 'الحجز غير موجود' : 'Booking not found'}
              </p>
              <Button asChild className="mt-4">
                <Link to="/bookings">
                  {isRTL ? 'العودة للحجوزات' : 'Back to Bookings'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const status = (booking.status as BookingStatus) || 'pending';
  const config = statusConfig[status];
  const StatusIcon = config.icon;

  const isProvider = role === 'provider' && booking.provider?.user_id === user?.id;
  const isTraveler = booking.traveler_id === user?.id;
  const isAdmin = role === 'admin' || role === 'super_admin';

  const canUpdateStatus = isProvider || isAdmin;
  const canUploadProof = isProvider && status === 'in_progress';
  const canMessage = (isTraveler || isProvider) && booking.provider?.user_id;

  const recipientId = isTraveler 
    ? booking.provider?.user_id 
    : booking.traveler_id;

  const proofs = (booking.proof_gallery as any[]) || [];

  const handleStatusUpdate = async (newStatus: BookingStatus) => {
    await updateStatus(newStatus);
  };

  return (
    <MainLayout>
      <div className="container py-8 px-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/bookings">
              {isRTL ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className={cn("text-2xl font-bold", isRTL && "font-arabic")}>
              {isRTL ? 'تفاصيل الحجز' : 'Booking Details'}
            </h1>
            <p className="text-muted-foreground text-sm">
              #{booking.id.slice(0, 8)}
            </p>
          </div>
          <Badge className={cn(config.bgColor, config.color, "border-0")}>
            <StatusIcon className="h-3 w-3 me-1" />
            {config.label[isRTL ? 'ar' : 'en']}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Service Info */}
            <Card>
              <CardHeader>
                <CardTitle>{booking.service?.title || 'Service'}</CardTitle>
                <CardDescription>
                  {booking.service?.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {booking.scheduled_date 
                        ? format(new Date(booking.scheduled_date), 'PPP')
                        : (isRTL ? 'غير محدد' : 'Not scheduled')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {booking.currency || 'SAR'} {booking.total_amount?.toLocaleString() || '0'}
                    </span>
                  </div>
                </div>

                {booking.special_requests && (
                  <div>
                    <p className="text-sm font-medium mb-1">
                      {isRTL ? 'طلبات خاصة' : 'Special Requests'}
                    </p>
                    <p className="text-sm text-muted-foreground">{booking.special_requests}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="timeline">
              <TabsList className="w-full">
                <TabsTrigger value="timeline" className="flex-1">
                  {isRTL ? 'الجدول الزمني' : 'Timeline'}
                </TabsTrigger>
                <TabsTrigger value="proofs" className="flex-1">
                  {isRTL ? 'الإثباتات' : 'Proofs'} ({proofs.length})
                </TabsTrigger>
                {canMessage && recipientId && (
                  <TabsTrigger value="messages" className="flex-1">
                    {isRTL ? 'الرسائل' : 'Messages'} ({messages.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="timeline" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <BookingTimeline 
                      activities={activities} 
                      bookingCreatedAt={booking.created_at} 
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="proofs" className="mt-4">
                <Card>
                  <CardContent className="pt-6">
                    <ProofGallery
                      proofs={proofs}
                      canUpload={canUploadProof}
                      onUpload={uploadProof}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {canMessage && recipientId && (
                <TabsContent value="messages" className="mt-4">
                  <BookingMessages
                    messages={messages}
                    recipientId={recipientId}
                    recipientName={
                      isTraveler 
                        ? (booking.provider?.company_name || 'Provider')
                        : 'Traveler'
                    }
                    onSendMessage={sendMessage}
                    onMarkAsRead={markMessagesAsRead}
                  />
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Beneficiary Info */}
            {booking.beneficiary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {isRTL ? 'المستفيد' : 'Beneficiary'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.beneficiary.full_name}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {booking.beneficiary.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Provider Info */}
            {booking.provider && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {isRTL ? 'مقدم الخدمة' : 'Service Provider'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {booking.provider.company_name || 'Provider'}
                      </p>
                      {booking.provider.rating !== null && (
                        <p className="text-sm text-muted-foreground">
                          ⭐ {booking.provider.rating.toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Status Actions */}
            {canUpdateStatus && status !== 'completed' && status !== 'cancelled' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {isRTL ? 'إجراءات' : 'Actions'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {status === 'pending' && (
                    <>
                      <Button 
                        className="w-full" 
                        onClick={() => handleStatusUpdate('accepted')}
                      >
                        {isRTL ? 'قبول الحجز' : 'Accept Booking'}
                      </Button>
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={() => handleStatusUpdate('cancelled')}
                      >
                        {isRTL ? 'رفض الحجز' : 'Decline Booking'}
                      </Button>
                    </>
                  )}
                  {status === 'accepted' && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusUpdate('in_progress')}
                    >
                      {isRTL ? 'بدء الخدمة' : 'Start Service'}
                    </Button>
                  )}
                  {status === 'in_progress' && (
                    <Button 
                      className="w-full"
                      onClick={() => handleStatusUpdate('completed')}
                    >
                      {isRTL ? 'إكمال الخدمة' : 'Complete Service'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Review Section - For completed bookings */}
            {status === 'completed' && isTraveler && booking.provider && (
              existingReview ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      {isRTL ? 'تقييمك' : 'Your Review'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn(
                              'h-5 w-5',
                              star <= existingReview.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-muted-foreground'
                            )}
                          />
                        ))}
                      </div>
                      {(existingReview.comment || existingReview.comment_ar) && (
                        <p className="text-sm text-muted-foreground">
                          {isRTL && existingReview.comment_ar 
                            ? existingReview.comment_ar 
                            : existingReview.comment}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'شكراً لتقييمك!' : 'Thank you for your review!'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ReviewForm
                  onSubmit={(rating, comment, commentAr) => 
                    submitReview(rating, comment, commentAr)
                  }
                />
              )
            )}

            {/* Booking Dates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {isRTL ? 'التواريخ' : 'Dates'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {isRTL ? 'تم الإنشاء' : 'Created'}
                  </span>
                  <span>{format(new Date(booking.created_at), 'PP')}</span>
                </div>
                {booking.scheduled_date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isRTL ? 'موعد الخدمة' : 'Scheduled'}
                    </span>
                    <span>{format(new Date(booking.scheduled_date), 'PP')}</span>
                  </div>
                )}
                {booking.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {isRTL ? 'تم الإكمال' : 'Completed'}
                    </span>
                    <span>{format(new Date(booking.completed_at), 'PP')}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
