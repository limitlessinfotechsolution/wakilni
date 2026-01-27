import { Bell, Check, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { useRealtimeNotifications, RealtimeNotification } from '@/hooks/useRealtimeNotifications';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  isRTL 
}: { 
  notification: RealtimeNotification; 
  onMarkAsRead: (id: string) => void;
  isRTL: boolean;
}) {
  const getIcon = () => {
    switch (notification.type) {
      case 'kyc_approved':
        return '✅';
      case 'kyc_rejected':
        return '❌';
      case 'booking_created':
      case 'booking_updated':
        return '📅';
      case 'message':
        return '💬';
      case 'review':
        return '⭐';
      default:
        return '🔔';
    }
  };

  const timeAgo = formatDistanceToNow(notification.createdAt, {
    addSuffix: true,
    locale: isRTL ? ar : undefined,
  });

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer',
        notification.isRead ? 'bg-transparent' : 'bg-primary/5',
        'hover:bg-muted'
      )}
      onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
    >
      <span className="text-lg shrink-0">{getIcon()}</span>
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm font-medium truncate',
          !notification.isRead && 'text-foreground'
        )}>
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
      </div>
      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </div>
  );
}

export function NotificationBell() {
  const { isRTL } = useLanguage();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useRealtimeNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align={isRTL ? 'start' : 'end'}
        sideOffset={8}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className={cn('font-semibold', isRTL && 'font-arabic')}>
            {isRTL ? 'الإشعارات' : 'Notifications'}
          </h3>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-xs"
                onClick={markAllAsRead}
              >
                <Check className="h-3.5 w-3.5 me-1" />
                {isRTL ? 'قراءة الكل' : 'Mark all read'}
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={clearNotifications}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm">{isRTL ? 'لا توجد إشعارات' : 'No notifications'}</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  isRTL={isRTL}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
