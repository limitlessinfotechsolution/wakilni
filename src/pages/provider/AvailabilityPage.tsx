import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AvailabilityManager } from '@/components/provider/AvailabilityManager';
import { useLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export default function AvailabilityPage() {
  const { isRTL } = useLanguage();

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className={cn('text-2xl font-bold mb-1', isRTL && 'font-arabic')}>
            {isRTL ? 'إدارة التوفر' : 'Availability Management'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'حدد أيام عملك، أوقات الحظر، والحد الأقصى للحجوزات اليومية'
              : 'Set your working days, block times, and maximum daily bookings'}
          </p>
        </div>

        {/* Availability Manager Component */}
        <AvailabilityManager />

        {/* Quick Tips */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-emerald-600 text-lg">1</span>
              </div>
              <h3 className={cn('font-semibold', isRTL && 'font-arabic')}>
                {isRTL ? 'حدد الأيام' : 'Select Days'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'انقر على أي يوم لتعديل توفره، أو استخدم التحديد المتعدد لتعديل عدة أيام معاً'
                : 'Click any day to edit its availability, or use multi-select to edit multiple days at once'}
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-blue-600 text-lg">2</span>
              </div>
              <h3 className={cn('font-semibold', isRTL && 'font-arabic')}>
                {isRTL ? 'حدد الأوقات' : 'Set Times'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'حدد ساعات العمل والحد الأقصى للحجوزات المسموح بها في اليوم'
                : 'Define your working hours and the maximum number of bookings allowed per day'}
            </p>
          </div>

          <div className="p-4 rounded-lg border bg-card">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-600 text-lg">3</span>
              </div>
              <h3 className={cn('font-semibold', isRTL && 'font-arabic')}>
                {isRTL ? 'حظر الأيام' : 'Block Days'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {isRTL 
                ? 'قم بإيقاف تشغيل "متاح للحجز" لحظر أي أيام لا تستطيع فيها قبول الحجوزات'
                : 'Toggle off "Available for bookings" to block any days when you cannot accept bookings'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
