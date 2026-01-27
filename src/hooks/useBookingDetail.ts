import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

export type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

interface BookingDetail extends Tables<'bookings'> {
  service?: {
    id: string;
    title: string;
    title_ar: string | null;
    service_type: string;
    price: number;
    currency: string | null;
    description: string | null;
    description_ar: string | null;
  } | null;
  beneficiary?: {
    id: string;
    full_name: string;
    full_name_ar: string | null;
    status: string;
    nationality: string | null;
  } | null;
  provider?: {
    id: string;
    user_id: string;
    company_name: string | null;
    company_name_ar: string | null;
    rating: number | null;
    bio: string | null;
  } | null;
}

interface BookingActivity {
  id: string;
  booking_id: string;
  actor_id: string | null;
  action: string;
  details: any;
  created_at: string;
}

interface Message {
  id: string;
  booking_id: string | null;
  sender_id: string;
  recipient_id: string;
  content: string;
  is_read: boolean | null;
  created_at: string;
}

export function useBookingDetail(bookingId: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [activities, setActivities] = useState<BookingActivity[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBooking = useCallback(async () => {
    if (!bookingId || !user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(
            id,
            title,
            title_ar,
            service_type,
            price,
            currency,
            description,
            description_ar
          ),
          beneficiary:beneficiaries(
            id,
            full_name,
            full_name_ar,
            status,
            nationality
          ),
          provider:providers(
            id,
            user_id,
            company_name,
            company_name_ar,
            rating,
            bio
          )
        `)
        .eq('id', bookingId)
        .maybeSingle();

      if (error) throw error;
      setBooking(data as BookingDetail | null);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch booking details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, user, toast]);

  const fetchActivities = useCallback(async () => {
    if (!bookingId) return;

    try {
      const { data, error } = await supabase
        .from('booking_activities')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    }
  }, [bookingId]);

  const fetchMessages = useCallback(async () => {
    if (!bookingId) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('booking_id', bookingId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }, [bookingId]);

  const updateStatus = async (newStatus: BookingStatus) => {
    if (!booking || !user) return false;

    try {
      const updates: Record<string, any> = { status: newStatus };
      if (newStatus === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('bookings')
        .update(updates)
        .eq('id', booking.id);

      if (error) throw error;

      // Log activity
      await supabase.from('booking_activities').insert({
        booking_id: booking.id,
        actor_id: user.id,
        action: `status_changed_to_${newStatus}`,
        details: { old_status: booking.status, new_status: newStatus },
      });

      toast({
        title: 'Success',
        description: `Booking status updated to ${newStatus}`,
      });

      await fetchBooking();
      await fetchActivities();
      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status',
        variant: 'destructive',
      });
      return false;
    }
  };

  const sendMessage = async (content: string, recipientId: string) => {
    if (!booking || !user) return false;

    try {
      const { error } = await supabase.from('messages').insert({
        booking_id: booking.id,
        sender_id: user.id,
        recipient_id: recipientId,
        content,
      });

      if (error) throw error;

      await fetchMessages();
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      return false;
    }
  };

  const uploadProof = async (proofUrl: string, description: string) => {
    if (!booking || !user) return false;

    try {
      const currentGallery = (booking.proof_gallery as any[]) || [];
      const newProof = {
        id: Date.now().toString(),
        url: proofUrl,
        description,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('bookings')
        .update({
          proof_gallery: [...currentGallery, newProof],
        })
        .eq('id', booking.id);

      if (error) throw error;

      // Log activity
      await supabase.from('booking_activities').insert({
        booking_id: booking.id,
        actor_id: user.id,
        action: 'proof_uploaded',
        details: { description },
      });

      toast({
        title: 'Success',
        description: 'Proof uploaded successfully',
      });

      await fetchBooking();
      await fetchActivities();
      return true;
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload proof',
        variant: 'destructive',
      });
      return false;
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || messages.length === 0) return;

    const unreadMessages = messages.filter(
      m => m.recipient_id === user.id && !m.is_read
    );

    if (unreadMessages.length === 0) return;

    try {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .in('id', unreadMessages.map(m => m.id));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  useEffect(() => {
    fetchBooking();
    fetchActivities();
    fetchMessages();
  }, [fetchBooking, fetchActivities, fetchMessages]);

  // Real-time subscriptions
  useEffect(() => {
    if (!bookingId) return;

    const messagesChannel = supabase
      .channel(`messages-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`,
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    const activitiesChannel = supabase
      .channel(`activities-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'booking_activities',
          filter: `booking_id=eq.${bookingId}`,
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(activitiesChannel);
    };
  }, [bookingId, fetchMessages, fetchActivities]);

  return {
    booking,
    activities,
    messages,
    isLoading,
    updateStatus,
    sendMessage,
    uploadProof,
    markMessagesAsRead,
    refetch: fetchBooking,
  };
}
