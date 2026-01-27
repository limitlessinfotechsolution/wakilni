import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore, startOfDay, addDays } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, Clock, Ban, Check, Trash2, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/lib/i18n';
import { useProviderAvailability, AvailabilityInput } from '@/hooks/useProviderAvailability';
import { cn } from '@/lib/utils';

export function AvailabilityManager() {
  const { t, isRTL } = useLanguage();
  const { 
    availability, 
    isLoading, 
    setAvailability, 
    setBulkAvailability,
    deleteAvailability,
    getAvailabilityForDate,
    isSettingAvailability 
  } = useProviderAvailability();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<{
    is_available: boolean;
    start_time: string;
    end_time: string;
    max_bookings: number;
    notes: string;
  }>({
    is_available: true,
    start_time: '09:00',
    end_time: '17:00',
    max_bookings: 3,
    notes: '',
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOffset = monthStart.getDay();
  const prefixDays = Array.from({ length: firstDayOffset }, (_, i) => null);

  // Group availability by date for quick lookup
  const availabilityMap = useMemo(() => {
    const map: Record<string, typeof availability[0]> = {};
    availability.forEach(a => {
      map[a.date] = a;
    });
    return map;
  }, [availability]);

  const handleDateClick = (day: Date) => {
    if (isBefore(day, startOfDay(new Date()))) return; // Can't modify past dates

    if (isBulkMode) {
      setSelectedDates(prev => {
        const exists = prev.some(d => isSameDay(d, day));
        if (exists) {
          return prev.filter(d => !isSameDay(d, day));
        }
        return [...prev, day];
      });
    } else {
      setSelectedDates([day]);
      const existing = getAvailabilityForDate(day);
      if (existing) {
        setFormData({
          is_available: existing.is_available,
          start_time: existing.start_time || '09:00',
          end_time: existing.end_time || '17:00',
          max_bookings: existing.max_bookings,
          notes: existing.notes || '',
        });
      } else {
        setFormData({
          is_available: true,
          start_time: '09:00',
          end_time: '17:00',
          max_bookings: 3,
          notes: '',
        });
      }
      setIsDialogOpen(true);
    }
  };

  const handleSave = () => {
    if (selectedDates.length === 0) return;

    if (selectedDates.length === 1) {
      const input: AvailabilityInput = {
        date: format(selectedDates[0], 'yyyy-MM-dd'),
        is_available: formData.is_available,
        start_time: formData.start_time,
        end_time: formData.end_time,
        max_bookings: formData.max_bookings,
        notes: formData.notes || null,
      };
      setAvailability(input);
    } else {
      setBulkAvailability({
        dates: selectedDates.map(d => format(d, 'yyyy-MM-dd')),
        is_available: formData.is_available,
        start_time: formData.start_time,
        end_time: formData.end_time,
        max_bookings: formData.max_bookings,
      });
    }

    setIsDialogOpen(false);
    setSelectedDates([]);
    setIsBulkMode(false);
  };

  const handleDelete = () => {
    if (selectedDates.length === 1) {
      deleteAvailability(format(selectedDates[0], 'yyyy-MM-dd'));
      setIsDialogOpen(false);
      setSelectedDates([]);
    }
  };

  const handleBulkConfirm = () => {
    if (selectedDates.length > 0) {
      setFormData({
        is_available: true,
        start_time: '09:00',
        end_time: '17:00',
        max_bookings: 3,
        notes: '',
      });
      setIsDialogOpen(true);
    }
  };

  const dayNames = isRTL 
    ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayStatus = (day: Date) => {
    const dateKey = format(day, 'yyyy-MM-dd');
    const slot = availabilityMap[dateKey];
    
    if (!slot) return 'default';
    if (!slot.is_available) return 'blocked';
    if (slot.current_bookings >= slot.max_bookings) return 'full';
    return 'available';
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className={cn('text-lg flex items-center gap-2', isRTL && 'font-arabic')}>
              <Calendar className="h-5 w-5" />
              {isRTL ? 'إدارة التوفر' : 'Availability Management'}
            </CardTitle>
            <CardDescription>
              {isRTL ? 'حدد أيام عملك وأوقات الحظر' : 'Set your working days and block times'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isBulkMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                setSelectedDates([]);
              }}
              className="gap-1"
            >
              <CalendarRange className="h-4 w-4" />
              {isRTL ? 'تحديد متعدد' : 'Multi-select'}
            </Button>
            {isBulkMode && selectedDates.length > 0 && (
              <Button size="sm" onClick={handleBulkConfirm}>
                {isRTL ? `تعديل ${selectedDates.length} أيام` : `Edit ${selectedDates.length} days`}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <>
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <span className={cn('text-lg font-semibold', isRTL && 'font-arabic')}>
                {format(currentMonth, 'MMMM yyyy', { locale: isRTL ? ar : undefined })}
              </span>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

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
                <div key={`prefix-${i}`} className="h-16" />
              ))}
              {daysInMonth.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const status = getDayStatus(day);
                const slot = availabilityMap[dateKey];
                const isSelected = selectedDates.some(d => isSameDay(d, day));
                const isPast = isBefore(day, startOfDay(new Date()));

                return (
                  <button
                    key={dateKey}
                    onClick={() => handleDateClick(day)}
                    disabled={isPast}
                    className={cn(
                      'h-16 p-1 rounded-lg border text-start transition-all relative',
                      'hover:border-primary hover:bg-primary/5',
                      isToday(day) && 'border-primary bg-primary/10',
                      isSelected && 'ring-2 ring-primary border-primary bg-primary/20',
                      !isSameMonth(day, currentMonth) && 'opacity-50',
                      isPast && 'opacity-40 cursor-not-allowed',
                      status === 'blocked' && 'bg-destructive/10 border-destructive/30',
                      status === 'available' && 'bg-emerald-500/10 border-emerald-500/30',
                      status === 'full' && 'bg-amber-500/10 border-amber-500/30'
                    )}
                  >
                    <div className={cn(
                      'text-sm font-medium',
                      isToday(day) && 'text-primary'
                    )}>
                      {format(day, 'd')}
                    </div>
                    {slot && (
                      <div className="mt-0.5">
                        {!slot.is_available ? (
                          <Badge variant="destructive" className="text-[9px] px-1 py-0">
                            <Ban className="h-2 w-2 mr-0.5" />
                            {isRTL ? 'محظور' : 'Blocked'}
                          </Badge>
                        ) : slot.current_bookings >= slot.max_bookings ? (
                          <Badge variant="secondary" className="text-[9px] px-1 py-0">
                            {isRTL ? 'ممتلئ' : 'Full'}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] px-1 py-0 bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
                            <Check className="h-2 w-2 mr-0.5" />
                            {slot.current_bookings}/{slot.max_bookings}
                          </Badge>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
                <span>{isRTL ? 'متاح' : 'Available'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-destructive/10 border border-destructive/30" />
                <span>{isRTL ? 'محظور' : 'Blocked'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/30" />
                <span>{isRTL ? 'ممتلئ' : 'Full'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded border" />
                <span>{isRTL ? 'افتراضي' : 'Default'}</span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={cn(isRTL && 'font-arabic')}>
              {selectedDates.length === 1 
                ? format(selectedDates[0], 'EEEE, d MMMM yyyy', { locale: isRTL ? ar : undefined })
                : isRTL ? `تعديل ${selectedDates.length} أيام` : `Edit ${selectedDates.length} days`}
            </DialogTitle>
            <DialogDescription>
              {isRTL ? 'حدد حالة التوفر وتفاصيل الوقت' : 'Set availability status and time details'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Available toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="available" className={cn(isRTL && 'font-arabic')}>
                {isRTL ? 'متاح للحجز' : 'Available for bookings'}
              </Label>
              <Switch
                id="available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
              />
            </div>

            {formData.is_available && (
              <>
                {/* Time range */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time" className={cn(isRTL && 'font-arabic')}>
                      {isRTL ? 'وقت البدء' : 'Start Time'}
                    </Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time" className={cn(isRTL && 'font-arabic')}>
                      {isRTL ? 'وقت الانتهاء' : 'End Time'}
                    </Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Max bookings */}
                <div className="space-y-2">
                  <Label htmlFor="max_bookings" className={cn(isRTL && 'font-arabic')}>
                    {isRTL ? 'الحد الأقصى للحجوزات' : 'Maximum Bookings'}
                  </Label>
                  <Input
                    id="max_bookings"
                    type="number"
                    min={1}
                    max={20}
                    value={formData.max_bookings}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_bookings: parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </>
            )}

            {/* Notes (only for single date) */}
            {selectedDates.length === 1 && (
              <div className="space-y-2">
                <Label htmlFor="notes" className={cn(isRTL && 'font-arabic')}>
                  {isRTL ? 'ملاحظات' : 'Notes'}
                </Label>
                <Textarea
                  id="notes"
                  placeholder={isRTL ? 'ملاحظات اختيارية...' : 'Optional notes...'}
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            )}
          </div>

          <DialogFooter className="flex-row gap-2">
            {selectedDates.length === 1 && getAvailabilityForDate(selectedDates[0]) && (
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={isSettingAvailability}
                className="gap-1"
              >
                <Trash2 className="h-4 w-4" />
                {isRTL ? 'حذف' : 'Delete'}
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedDates([]);
              }}
            >
              {isRTL ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSettingAvailability}
            >
              {isSettingAvailability 
                ? (isRTL ? 'جاري الحفظ...' : 'Saving...') 
                : (isRTL ? 'حفظ' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
