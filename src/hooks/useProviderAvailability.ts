import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { format } from 'date-fns';

export interface AvailabilitySlot {
  id: string;
  provider_id: string;
  date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  max_bookings: number;
  current_bookings: number;
  notes: string | null;
  notes_ar: string | null;
  created_at: string;
  updated_at: string;
}

export interface AvailabilityInput {
  date: string;
  is_available: boolean;
  start_time?: string | null;
  end_time?: string | null;
  max_bookings?: number;
  notes?: string | null;
  notes_ar?: string | null;
}

export function useProviderAvailability() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [providerId, setProviderId] = useState<string | null>(null);

  // Fetch provider ID
  useEffect(() => {
    async function fetchProviderId() {
      if (!user) return;
      const { data } = await supabase
        .from('providers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setProviderId(data.id);
    }
    fetchProviderId();
  }, [user]);

  // Fetch availability
  const { data: availability = [], isLoading, refetch } = useQuery({
    queryKey: ['provider-availability', providerId],
    queryFn: async () => {
      if (!providerId) return [];
      const { data, error } = await supabase
        .from('provider_availability')
        .select('*')
        .eq('provider_id', providerId)
        .order('date', { ascending: true });

      if (error) throw error;
      return data as AvailabilitySlot[];
    },
    enabled: !!providerId,
  });

  // Set availability for a date
  const setAvailability = useMutation({
    mutationFn: async (input: AvailabilityInput) => {
      if (!providerId) throw new Error('Provider not found');

      const { data: existing } = await supabase
        .from('provider_availability')
        .select('id')
        .eq('provider_id', providerId)
        .eq('date', input.date)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('provider_availability')
          .update({
            is_available: input.is_available,
            start_time: input.start_time,
            end_time: input.end_time,
            max_bookings: input.max_bookings || 1,
            notes: input.notes,
            notes_ar: input.notes_ar,
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('provider_availability')
          .insert({
            provider_id: providerId,
            date: input.date,
            is_available: input.is_available,
            start_time: input.start_time,
            end_time: input.end_time,
            max_bookings: input.max_bookings || 1,
            notes: input.notes,
            notes_ar: input.notes_ar,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-availability', providerId] });
      toast.success('Availability updated');
    },
    onError: (error) => {
      toast.error('Failed to update availability');
      console.error(error);
    },
  });

  // Bulk set availability for date range
  const setBulkAvailability = useMutation({
    mutationFn: async ({ dates, is_available, start_time, end_time, max_bookings }: {
      dates: string[];
      is_available: boolean;
      start_time?: string | null;
      end_time?: string | null;
      max_bookings?: number;
    }) => {
      if (!providerId) throw new Error('Provider not found');

      // Delete existing entries for these dates
      await supabase
        .from('provider_availability')
        .delete()
        .eq('provider_id', providerId)
        .in('date', dates);

      // Insert new entries
      const entries = dates.map(date => ({
        provider_id: providerId,
        date,
        is_available,
        start_time,
        end_time,
        max_bookings: max_bookings || 1,
      }));

      const { error } = await supabase
        .from('provider_availability')
        .insert(entries);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-availability', providerId] });
      toast.success('Availability updated for selected dates');
    },
    onError: (error) => {
      toast.error('Failed to update availability');
      console.error(error);
    },
  });

  // Delete availability for a date
  const deleteAvailability = useMutation({
    mutationFn: async (date: string) => {
      if (!providerId) throw new Error('Provider not found');

      const { error } = await supabase
        .from('provider_availability')
        .delete()
        .eq('provider_id', providerId)
        .eq('date', date);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-availability', providerId] });
      toast.success('Availability removed');
    },
    onError: (error) => {
      toast.error('Failed to remove availability');
      console.error(error);
    },
  });

  // Get availability for a specific date
  const getAvailabilityForDate = (date: Date): AvailabilitySlot | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availability.find(a => a.date === dateStr);
  };

  // Check if a date is available
  const isDateAvailable = (date: Date): boolean => {
    const slot = getAvailabilityForDate(date);
    if (!slot) return true; // Default to available if no record
    return slot.is_available && slot.current_bookings < slot.max_bookings;
  };

  // Check if a date is blocked
  const isDateBlocked = (date: Date): boolean => {
    const slot = getAvailabilityForDate(date);
    return slot ? !slot.is_available : false;
  };

  return {
    availability,
    isLoading,
    providerId,
    setAvailability: setAvailability.mutate,
    setBulkAvailability: setBulkAvailability.mutate,
    deleteAvailability: deleteAvailability.mutate,
    getAvailabilityForDate,
    isDateAvailable,
    isDateBlocked,
    isSettingAvailability: setAvailability.isPending || setBulkAvailability.isPending,
    refetch,
  };
}
