import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, isToday, parseISO, isBefore, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, MapPin, 
  CheckCircle2, XCircle, Play, Star, Phone, MessageCircle, Eye, Sparkles,
  AlertCircle, CalendarDays, Users, DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/lib/i18n';
import { useProviderBookings, BookingStatus } from '@/hooks/useProviderBookings';
import { cn } from '@/lib/utils';

export function BookingCalendarView() {
  const { t, isRTL } = useLanguage();
  const { bookings, isLoading, updateBookingStatus } = useProviderBookings();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedBooking, setSelectedBooking] = useState<typeof bookings[0] | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<BookingStatus | null>(null);
  const [actionNote, setActionNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOffset = monthStart.getDay();
  const prefixDays = Array.from({ length: firstDayOffset }, (_, i) => null);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped: Record<string, typeof bookings> = {};
    bookings.forEach(booking => {
      if (booking.scheduled_date) {
        const dateKey = format(parseISO(booking.scheduled_date), 'yyyy-MM-dd');
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(booking);
      }
    });
    return grouped;
  }, [bookings]);

  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return bookingsByDate[dateKey] || [];
  }, [selectedDate, bookingsByDate]);

  // Stats
  const stats = useMemo(() => {
    const today = startOfDay(new Date());
    const pending = bookings.filter(b => b.status === 'pending').length;
    const inProgress = bookings.filter(b => b.status === 'in_progress').length;
    const upcoming = bookings.filter(b => 
      b.scheduled_date && 
      !isBefore(parseISO(b.scheduled_date), today) && 
      ['pending', 'accepted'].includes(b.status || '')
    ).length;
    const totalRevenue = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0);
    
    return { pending, inProgress, upcoming, totalRevenue };
  }, [bookings]);

  const getStatusConfig = (status: string | null) => {
    const configs: Record<string, { color: string; bg: string; icon: React.ReactNode; label: { en: string; ar: string } }> = {
      pending: { 
        color: 'text-amber-600', 
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        icon: <Clock className="h-3 w-3" />,
        label: { en: 'Pending', ar: 'قيد الانتظار' }
      },
      accepted: { 
        color: 'text-blue-600', 
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: { en: 'Accepted', ar: 'مقبول' }
      },
      in_progress: { 
        color: 'text-purple-600', 
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        icon: <Play className="h-3 w-3" />,
        label: { en: 'In Progress', ar: 'قيد التنفيذ' }
      },
      completed: { 
        color: 'text-emerald-600', 
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        icon: <CheckCircle2 className="h-3 w-3" />,
        label: { en: 'Completed', ar: 'مكتمل' }
      },
      cancelled: { 
        color: 'text-red-600', 
        bg: 'bg-red-100 dark:bg-red-900/30',
        icon: <XCircle className="h-3 w-3" />,
        label: { en: 'Cancelled', ar: 'ملغي' }
      },
      disputed: { 
        color: 'text-orange-600', 
        bg: 'bg-orange-100 dark:bg-orange-900/30',
        icon: <AlertCircle className="h-3 w-3" />,
        label: { en: 'Disputed', ar: 'متنازع عليه' }
      },
    };
    return configs[status || 'pending'] || configs.pending;
  };

  const handleQuickAction = (booking: typeof bookings[0], action: BookingStatus) => {
    setSelectedBooking(booking);
    setActionType(action);
    setActionNote('');
    setActionDialogOpen(true);
  };

  const confirmAction = async () => {
    if (!selectedBooking || !actionType) return;
    
    setIsUpdating(true);
    const success = await updateBookingStatus(selectedBooking.id, actionType);
    setIsUpdating(false);
    
    if (success) {
      setActionDialogOpen(false);
      setSelectedBooking(null);
      setActionType(null);
    }
  };

  const dayNames = isRTL 
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getActionLabel = (action: BookingStatus) => {
    const labels: Record<string, { en: string; ar: string }> = {
      accepted: { en: 'Accept Booking', ar: 'قبول الحجز' },
      in_progress: { en: 'Start Service', ar: 'بدء الخدمة' },
      completed: { en: 'Complete Service', ar: 'إكمال الخدمة' },
      cancelled: { en: 'Cancel Booking', ar: 'إلغاء الحجز' },
    };
    return isRTL ? labels[action]?.ar : labels[action]?.en;
  };

  return (
    <div className="space-y-6">
      {/* Islamic Header */}
      <div className="text-center mb-6">
        <p className="text-xs text-muted-foreground font-arabic mb-2">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
        <h2 className={cn('text-xl font-semibold', isRTL && 'font-arabic')}>
          {isRTL ? 'تقويم الحجوزات' : 'Booking Calendar'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isRTL ? 'إدارة جدولك وخدماتك بسهولة' : 'Manage your schedule and services with ease'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'قيد الانتظار' : 'Pending'}
                </p>
                <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{stats.pending}</p>
              </div>
              <div className="p-2 rounded-full bg-amber-200 dark:bg-amber-800">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'قيد التنفيذ' : 'In Progress'}
                </p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.inProgress}</p>
              </div>
              <div className="p-2 rounded-full bg-purple-200 dark:bg-purple-800">
                <Play className="h-5 w-5 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'القادمة' : 'Upcoming'}
                </p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.upcoming}</p>
              </div>
              <div className="p-2 rounded-full bg-blue-200 dark:bg-blue-800">
                <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'الإيرادات' : 'Revenue'}
                </p>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                  {stats.totalRevenue.toLocaleString()} <span className="text-sm">SAR</span>
                </p>
              </div>
              <div className="p-2 rounded-full bg-emerald-200 dark:bg-emerald-800">
                <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <CardTitle className={cn('text-lg', isRTL && 'font-arabic')}>
                {format(currentMonth, 'MMMM yyyy', { locale: isRTL ? ar : undefined })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-80 w-full" />
            ) : (
              <>
                {/* Day names */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {dayNames.map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {prefixDays.map((_, i) => (
                    <div key={`prefix-${i}`} className="h-20" />
                  ))}
                  {daysInMonth.map(day => {
                    const dateKey = format(day, 'yyyy-MM-dd');
                    const dayBookings = bookingsByDate[dateKey] || [];
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const hasBookings = dayBookings.length > 0;
                    const isPast = isBefore(day, startOfDay(new Date()));

                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          'h-20 p-1 rounded-lg border text-start transition-all relative',
                          'hover:border-primary hover:bg-primary/5',
                          isToday(day) && 'border-primary bg-primary/10',
                          isSelected && 'ring-2 ring-primary border-primary',
                          isPast && !isToday(day) && 'opacity-60'
                        )}
                      >
                        <div className={cn(
                          'text-sm font-medium mb-1 flex items-center gap-1',
                          isToday(day) && 'text-primary'
                        )}>
                          {format(day, 'd')}
                          {isToday(day) && <Sparkles className="h-3 w-3" />}
                        </div>
                        {hasBookings && (
                          <div className="space-y-0.5">
                            {dayBookings.slice(0, 2).map(booking => {
                              const config = getStatusConfig(booking.status);
                              return (
                                <div
                                  key={booking.id}
                                  className={cn(
                                    'text-[10px] px-1 py-0.5 rounded truncate flex items-center gap-1',
                                    config.bg, config.color
                                  )}
                                >
                                  {config.icon}
                                  <span className="truncate">{booking.service?.service_type}</span>
                                </div>
                              );
                            })}
                            {dayBookings.length > 2 && (
                              <div className="text-[10px] text-muted-foreground font-medium">
                                +{dayBookings.length - 2} {isRTL ? 'المزيد' : 'more'}
                              </div>
                            )}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Selected Date Bookings */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className={cn('text-base flex items-center gap-2', isRTL && 'font-arabic')}>
                <CalendarIcon className="h-4 w-4 text-primary" />
                {selectedDate ? format(selectedDate, 'EEEE, d MMMM', { locale: isRTL ? ar : undefined }) : (isRTL ? 'اختر تاريخ' : 'Select a date')}
              </CardTitle>
              <CardDescription>
                {selectedDateBookings.length} {isRTL ? 'حجز' : 'booking(s)'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {selectedDateBookings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <CalendarDays className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? 'لا توجد حجوزات لهذا التاريخ' : 'No bookings for this date'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateBookings.map(booking => {
                      const statusConfig = getStatusConfig(booking.status);
                      return (
                        <Card key={booking.id} className="border shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="min-w-0 flex-1">
                                <p className={cn('font-semibold text-sm truncate', isRTL && 'font-arabic')}>
                                  {isRTL && booking.service?.title_ar 
                                    ? booking.service.title_ar 
                                    : booking.service?.title || 'Service'}
                                </p>
                                <Badge 
                                  variant="outline" 
                                  className={cn('mt-1', statusConfig.bg, statusConfig.color, 'border-0')}
                                >
                                  {statusConfig.icon}
                                  <span className="ml-1">
                                    {isRTL ? statusConfig.label.ar : statusConfig.label.en}
                                  </span>
                                </Badge>
                              </div>
                              <p className="text-sm font-semibold text-primary whitespace-nowrap">
                                {booking.total_amount?.toLocaleString()} {booking.currency}
                              </p>
                            </div>

                            <Separator className="my-3" />

                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <User className="h-3.5 w-3.5" />
                                <span className={cn(isRTL && 'font-arabic')}>
                                  {isRTL && booking.beneficiary?.full_name_ar 
                                    ? booking.beneficiary.full_name_ar 
                                    : booking.beneficiary?.full_name || 'N/A'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-3.5 w-3.5" />
                                <span className="capitalize">{booking.service?.service_type}</span>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-wrap gap-2 mt-4">
                              {booking.status === 'pending' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    onClick={() => handleQuickAction(booking, 'accepted')}
                                    className="gap-1 bg-blue-600 hover:bg-blue-700"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    {isRTL ? 'قبول' : 'Accept'}
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => handleQuickAction(booking, 'cancelled')}
                                    className="gap-1"
                                  >
                                    <XCircle className="h-3.5 w-3.5" />
                                    {isRTL ? 'رفض' : 'Decline'}
                                  </Button>
                                </>
                              )}
                              {booking.status === 'accepted' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleQuickAction(booking, 'in_progress')}
                                  className="gap-1 bg-purple-600 hover:bg-purple-700"
                                >
                                  <Play className="h-3.5 w-3.5" />
                                  {isRTL ? 'بدء' : 'Start'}
                                </Button>
                              )}
                              {booking.status === 'in_progress' && (
                                <Button 
                                  size="sm" 
                                  onClick={() => handleQuickAction(booking, 'completed')}
                                  className="gap-1 bg-emerald-600 hover:bg-emerald-700"
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  {isRTL ? 'إكمال' : 'Complete'}
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" variant="outline" className="gap-1">
                                    <Eye className="h-3.5 w-3.5" />
                                    {isRTL ? 'التفاصيل' : 'Details'}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle className={cn(isRTL && 'font-arabic')}>
                                      {isRTL ? 'تفاصيل الحجز' : 'Booking Details'}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="text-muted-foreground">{isRTL ? 'الخدمة' : 'Service'}</Label>
                                        <p className="font-medium">
                                          {isRTL && booking.service?.title_ar ? booking.service.title_ar : booking.service?.title}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">{isRTL ? 'النوع' : 'Type'}</Label>
                                        <p className="font-medium capitalize">{booking.service?.service_type}</p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">{isRTL ? 'المستفيد' : 'Beneficiary'}</Label>
                                        <p className="font-medium">
                                          {isRTL && booking.beneficiary?.full_name_ar 
                                            ? booking.beneficiary.full_name_ar 
                                            : booking.beneficiary?.full_name}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-muted-foreground">{isRTL ? 'المبلغ' : 'Amount'}</Label>
                                        <p className="font-medium text-primary">
                                          {booking.total_amount?.toLocaleString()} {booking.currency}
                                        </p>
                                      </div>
                                    </div>
                                    {booking.special_requests && (
                                      <div>
                                        <Label className="text-muted-foreground">{isRTL ? 'طلبات خاصة' : 'Special Requests'}</Label>
                                        <p className="text-sm mt-1 p-3 bg-muted rounded-lg">{booking.special_requests}</p>
                                      </div>
                                    )}
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn('flex items-center gap-2', isRTL && 'font-arabic')}>
              {actionType === 'accepted' && <CheckCircle2 className="h-5 w-5 text-blue-500" />}
              {actionType === 'in_progress' && <Play className="h-5 w-5 text-purple-500" />}
              {actionType === 'completed' && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
              {actionType === 'cancelled' && <XCircle className="h-5 w-5 text-red-500" />}
              {actionType && getActionLabel(actionType)}
            </DialogTitle>
            <DialogDescription>
              {isRTL 
                ? 'هل أنت متأكد من هذا الإجراء؟'
                : 'Are you sure you want to perform this action?'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="py-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium">
                  {isRTL && selectedBooking.service?.title_ar 
                    ? selectedBooking.service.title_ar 
                    : selectedBooking.service?.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isRTL && selectedBooking.beneficiary?.full_name_ar 
                    ? selectedBooking.beneficiary.full_name_ar 
                    : selectedBooking.beneficiary?.full_name}
                </p>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label>{isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}</Label>
                <Textarea 
                  placeholder={isRTL ? 'أضف أي ملاحظات...' : 'Add any notes...'}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={confirmAction}
              disabled={isUpdating}
              className={cn(
                actionType === 'cancelled' && 'bg-red-600 hover:bg-red-700',
                actionType === 'completed' && 'bg-emerald-600 hover:bg-emerald-700',
                actionType === 'accepted' && 'bg-blue-600 hover:bg-blue-700',
                actionType === 'in_progress' && 'bg-purple-600 hover:bg-purple-700'
              )}
            >
              {isUpdating 
                ? (isRTL ? 'جاري التحديث...' : 'Updating...') 
                : (isRTL ? 'تأكيد' : 'Confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
