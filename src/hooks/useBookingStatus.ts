import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from './use-toast';
import { useLanguage } from '@/lib/i18n';

export interface BookingStatusInfo {
  id: string;
  status: string;
  scheduled_date: string | null;
  completed_at: string | null;
  service_type: string;
  service_title: string;
  provider_name: string | null;
  beneficiary_name: string | null;
  total_amount: number | null;
  progress_percentage: number;
  remaining_steps: string[];
  next_action: string | null;
}

const STATUS_ORDER = ['pending', 'accepted', 'in_progress', 'completed'];

export function useBookingStatus(bookingId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isRTL } = useLanguage();
  const [booking, setBooking] = useState<BookingStatusInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const calculateProgress = (status: string): number => {
    const statusIndex = STATUS_ORDER.indexOf(status);
    if (statusIndex === -1) return 0;
    return Math.round(((statusIndex + 1) / STATUS_ORDER.length) * 100);
  };

  const getRemainingSteps = (status: string): string[] => {
    const statusIndex = STATUS_ORDER.indexOf(status);
    if (statusIndex === -1) return STATUS_ORDER;
    return STATUS_ORDER.slice(statusIndex + 1);
  };

  const getNextAction = (status: string): string | null => {
    switch (status) {
      case 'pending':
        return isRTL ? 'في انتظار قبول المزود' : 'Waiting for provider acceptance';
      case 'accepted':
        return isRTL ? 'سيبدأ المزود قريباً' : 'Provider will start soon';
      case 'in_progress':
        return isRTL ? 'جاري تنفيذ الخدمة' : 'Service in progress';
      case 'completed':
        return isRTL ? 'مكتمل - يرجى ترك تقييم' : 'Complete - Please leave a review';
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!bookingId) {
      setIsLoading(false);
      return;
    }

    const fetchBooking = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          service:services(title, title_ar, service_type),
          provider:providers(company_name, company_name_ar),
          beneficiary:beneficiaries(full_name, full_name_ar)
        `)
        .eq('id', bookingId)
        .single();

      if (error) {
        console.error('Error fetching booking:', error);
        setIsLoading(false);
        return;
      }

      setBooking({
        id: data.id,
        status: data.status || 'pending',
        scheduled_date: data.scheduled_date,
        completed_at: data.completed_at,
        service_type: data.service?.service_type || 'umrah',
        service_title: isRTL ? data.service?.title_ar || data.service?.title : data.service?.title,
        provider_name: isRTL ? data.provider?.company_name_ar || data.provider?.company_name : data.provider?.company_name,
        beneficiary_name: isRTL ? data.beneficiary?.full_name_ar || data.beneficiary?.full_name : data.beneficiary?.full_name,
        total_amount: data.total_amount,
        progress_percentage: calculateProgress(data.status || 'pending'),
        remaining_steps: getRemainingSteps(data.status || 'pending'),
        next_action: getNextAction(data.status || 'pending'),
      });
      setIsLoading(false);
    };

    fetchBooking();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `id=eq.${bookingId}`,
        },
        (payload) => {
          const newStatus = payload.new.status;
          const oldStatus = payload.old?.status;

          if (newStatus !== oldStatus) {
            // Show toast for status change
            if (newStatus === 'completed') {
              toast({
                title: isRTL ? '🎉 تهانينا!' : '🎉 Congratulations!',
                description: isRTL 
                  ? 'تم إكمال الخدمة بنجاح'
                  : 'Service completed successfully',
              });
            } else if (newStatus === 'accepted') {
              toast({
                title: isRTL ? '✅ تم القبول' : '✅ Accepted',
                description: isRTL 
                  ? 'تم قبول الحجز من قبل المزود'
                  : 'Booking accepted by provider',
              });
            } else if (newStatus === 'in_progress') {
              toast({
                title: isRTL ? '🚀 جاري التنفيذ' : '🚀 In Progress',
                description: isRTL 
                  ? 'بدأ المزود تنفيذ الخدمة'
                  : 'Provider has started the service',
              });
            }
          }

          setBooking(prev => prev ? {
            ...prev,
            status: newStatus,
            completed_at: payload.new.completed_at,
            progress_percentage: calculateProgress(newStatus),
            remaining_steps: getRemainingSteps(newStatus),
            next_action: getNextAction(newStatus),
          } : null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, isRTL]);

  return { booking, isLoading };
}

export function useLiveBookings() {
  const { user, role } = useAuth();
  const [bookings, setBookings] = useState<BookingStatusInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchBookings = async () => {
      let query = supabase
        .from('bookings')
        .select(`
          *,
          service:services(title, title_ar, service_type),
          provider:providers(company_name, company_name_ar),
          beneficiary:beneficiaries(full_name, full_name_ar)
        `)
        .in('status', ['pending', 'accepted', 'in_progress'])
        .order('created_at', { ascending: false });

      if (role === 'traveler') {
        query = query.eq('traveler_id', user.id);
      } else if (role === 'provider') {
        // Get provider ID first
        const { data: providerData } = await supabase
          .from('providers')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (providerData) {
          query = query.eq('provider_id', providerData.id);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings:', error);
        setIsLoading(false);
        return;
      }

      const mappedBookings: BookingStatusInfo[] = (data || []).map((b: any) => ({
        id: b.id,
        status: b.status || 'pending',
        scheduled_date: b.scheduled_date,
        completed_at: b.completed_at,
        service_type: b.service?.service_type || 'umrah',
        service_title: b.service?.title || '',
        provider_name: b.provider?.company_name || null,
        beneficiary_name: b.beneficiary?.full_name || null,
        total_amount: b.total_amount,
        progress_percentage: STATUS_ORDER.indexOf(b.status || 'pending') >= 0 
          ? Math.round(((STATUS_ORDER.indexOf(b.status || 'pending') + 1) / STATUS_ORDER.length) * 100)
          : 0,
        remaining_steps: STATUS_ORDER.slice(STATUS_ORDER.indexOf(b.status || 'pending') + 1),
        next_action: null,
      }));

      setBookings(mappedBookings);
      setIsLoading(false);
    };

    fetchBookings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('live-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, role]);

  return { bookings, isLoading };
}
