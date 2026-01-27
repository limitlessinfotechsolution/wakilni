import { format } from 'date-fns';
import { 
  Clock, 
  CheckCircle, 
  PlayCircle, 
  XCircle, 
  AlertTriangle,
  FileImage,
  MessageSquare,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';

interface Activity {
  id: string;
  action: string;
  details: Record<string, any> | null;
  created_at: string;
  actor_id: string | null;
}

interface BookingTimelineProps {
  activities: Activity[];
  bookingCreatedAt: string;
}

const actionConfig: Record<string, { icon: typeof Clock; color: string; bgColor: string }> = {
  created: { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  status_changed_to_pending: { icon: Clock, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  status_changed_to_accepted: { icon: CheckCircle, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  status_changed_to_in_progress: { icon: PlayCircle, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  status_changed_to_completed: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  status_changed_to_cancelled: { icon: XCircle, color: 'text-destructive', bgColor: 'bg-destructive/10' },
  status_changed_to_disputed: { icon: AlertTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  proof_uploaded: { icon: FileImage, color: 'text-primary', bgColor: 'bg-primary/10' },
  message_sent: { icon: MessageSquare, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  provider_assigned: { icon: User, color: 'text-primary', bgColor: 'bg-primary/10' },
};

export function BookingTimeline({ activities, bookingCreatedAt }: BookingTimelineProps) {
  const { isRTL } = useLanguage();

  const getActionLabel = (action: string): string => {
    const labels: Record<string, { en: string; ar: string }> = {
      created: { en: 'Booking Created', ar: 'تم إنشاء الحجز' },
      status_changed_to_pending: { en: 'Status: Pending', ar: 'الحالة: معلق' },
      status_changed_to_accepted: { en: 'Booking Accepted', ar: 'تم قبول الحجز' },
      status_changed_to_in_progress: { en: 'Service In Progress', ar: 'الخدمة قيد التنفيذ' },
      status_changed_to_completed: { en: 'Service Completed', ar: 'تم إكمال الخدمة' },
      status_changed_to_cancelled: { en: 'Booking Cancelled', ar: 'تم إلغاء الحجز' },
      status_changed_to_disputed: { en: 'Dispute Opened', ar: 'تم فتح نزاع' },
      proof_uploaded: { en: 'Proof Uploaded', ar: 'تم رفع الإثبات' },
      message_sent: { en: 'Message Sent', ar: 'تم إرسال رسالة' },
      provider_assigned: { en: 'Provider Assigned', ar: 'تم تعيين مقدم الخدمة' },
    };

    return labels[action]?.[isRTL ? 'ar' : 'en'] || action.replace(/_/g, ' ');
  };

  // Add initial creation event if not in activities
  const allEvents = [
    ...(!activities.find(a => a.action === 'created') ? [{
      id: 'initial',
      action: 'created',
      details: null,
      created_at: bookingCreatedAt,
      actor_id: null,
    }] : []),
    ...activities,
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">
        {isRTL ? 'الجدول الزمني' : 'Timeline'}
      </h3>
      
      <div className="relative">
        {/* Timeline line */}
        <div className={cn(
          "absolute top-0 bottom-0 w-0.5 bg-border",
          isRTL ? "right-4" : "left-4"
        )} />

        <div className="space-y-6">
          {allEvents.map((activity, index) => {
            const config = actionConfig[activity.action] || actionConfig.created;
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className={cn(
                  "relative flex gap-4",
                  isRTL && "flex-row-reverse"
                )}
              >
                {/* Icon */}
                <div className={cn(
                  "relative z-10 flex h-8 w-8 items-center justify-center rounded-full",
                  config.bgColor
                )}>
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>

                {/* Content */}
                <div className={cn(
                  "flex-1 pb-2",
                  isRTL && "text-right"
                )}>
                  <p className="font-medium">{getActionLabel(activity.action)}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(activity.created_at), 'PPp')}
                  </p>
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {activity.details.description || 
                       (activity.details.old_status && activity.details.new_status && 
                        `${activity.details.old_status} → ${activity.details.new_status}`)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
