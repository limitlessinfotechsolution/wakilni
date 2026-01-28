import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { BookingCalendarView } from '@/components/provider/BookingCalendarView';

export default function CalendarPage() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <BookingCalendarView />
      </div>
    </DashboardLayout>
  );
}
