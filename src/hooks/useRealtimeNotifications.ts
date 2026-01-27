import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeNotification {
  id: string;
  type: 'booking_created' | 'booking_updated' | 'kyc_approved' | 'kyc_rejected' | 'kyc_submitted' | 'message' | 'review';
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  createdAt: Date;
}

export function useRealtimeNotifications() {
  const { user, role } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'isRead' | 'createdAt'>) => {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: crypto.randomUUID(),
      isRead: false,
      createdAt: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 50));
    setUnreadCount(prev => prev + 1);

    toast({
      title: notification.title,
      description: notification.message,
    });
  }, [toast]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    if (!user) return;

    const channels: ReturnType<typeof supabase.channel>[] = [];

    // Provider/Vendor: KYC status updates
    if (role === 'provider' || role === 'vendor') {
      const tableName = role === 'provider' ? 'providers' : 'vendors';
      const kycChannel = supabase
        .channel(`${role}-kyc-updates`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: tableName,
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newStatus = payload.new.kyc_status;
            const oldStatus = payload.old?.kyc_status;

            if (newStatus !== oldStatus) {
              if (newStatus === 'approved') {
                addNotification({
                  type: 'kyc_approved',
                  title: 'KYC Approved! 🎉',
                  message: 'Your verification has been approved. You can now start accepting bookings.',
                  entityId: payload.new.id,
                  entityType: role,
                });
              } else if (newStatus === 'rejected') {
                addNotification({
                  type: 'kyc_rejected',
                  title: 'KYC Rejected',
                  message: payload.new.kyc_notes || 'Your verification was rejected. Please review and resubmit.',
                  entityId: payload.new.id,
                  entityType: role,
                });
              }
            }
          }
        )
        .subscribe();

      channels.push(kycChannel);

      // Provider: New booking assignments
      if (role === 'provider') {
        const bookingChannel = supabase
          .channel('provider-bookings')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'service_allocations',
            },
            async (payload) => {
              // Check if this allocation is for the current provider
              const { data: provider } = await supabase
                .from('providers')
                .select('id')
                .eq('user_id', user.id)
                .single();

              if (provider && payload.new.provider_id === provider.id) {
                addNotification({
                  type: 'booking_created',
                  title: 'New Booking Assignment',
                  message: 'You have a new booking request waiting for your review.',
                  entityId: payload.new.booking_id,
                  entityType: 'booking',
                });
              }
            }
          )
          .subscribe();

        channels.push(bookingChannel);
      }
    }

    // Traveler: Booking updates
    if (role === 'traveler' || !role) {
      const travelerBookingChannel = supabase
        .channel('traveler-bookings')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'bookings',
            filter: `traveler_id=eq.${user.id}`,
          },
          (payload) => {
            const newStatus = payload.new.status;
            const oldStatus = payload.old?.status;

            if (newStatus !== oldStatus) {
              const statusMessages: Record<string, { title: string; message: string }> = {
                accepted: { title: 'Booking Accepted', message: 'Your booking has been accepted by the provider.' },
                in_progress: { title: 'Booking In Progress', message: 'Your pilgrimage is now being performed.' },
                completed: { title: 'Booking Completed 🎉', message: 'Your pilgrimage has been completed. Please check proof photos.' },
                cancelled: { title: 'Booking Cancelled', message: 'Your booking has been cancelled.' },
              };

              const statusMessage = statusMessages[newStatus];
              if (statusMessage) {
                addNotification({
                  type: 'booking_updated',
                  ...statusMessage,
                  entityId: payload.new.id,
                  entityType: 'booking',
                });
              }
            }
          }
        )
        .subscribe();

      channels.push(travelerBookingChannel);
    }

    // All users: New messages
    const messageChannel = supabase
      .channel('user-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`,
        },
        (payload) => {
          addNotification({
            type: 'message',
            title: 'New Message',
            message: payload.new.content.substring(0, 100) + (payload.new.content.length > 100 ? '...' : ''),
            entityId: payload.new.booking_id,
            entityType: 'message',
          });
        }
      )
      .subscribe();

    channels.push(messageChannel);

    // Provider: New reviews
    if (role === 'provider') {
      const reviewChannel = supabase
        .channel('provider-reviews')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'reviews',
          },
          async (payload) => {
            const { data: provider } = await supabase
              .from('providers')
              .select('id')
              .eq('user_id', user.id)
              .single();

            if (provider && payload.new.provider_id === provider.id) {
              addNotification({
                type: 'review',
                title: 'New Review ⭐',
                message: `You received a ${payload.new.rating}-star review!`,
                entityId: payload.new.id,
                entityType: 'review',
              });
            }
          }
        )
        .subscribe();

      channels.push(reviewChannel);
    }

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, role, addNotification]);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}
