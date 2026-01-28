import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import type { Json } from '@/integrations/supabase/types';

interface ProofItem {
  id: string;
  url: string;
  description: string;
  uploaded_by: string;
  uploaded_at: string;
  file_type?: 'image' | 'video';
}

export function useProofUpload(bookingId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadProof = async (
    file: File,
    description: string
  ): Promise<boolean> => {
    if (!user || !file) return false;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${bookingId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to storage bucket
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('proof-gallery')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      setUploadProgress(50);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('proof-gallery')
        .getPublicUrl(fileName);

      // Determine file type
      const fileType = file.type.startsWith('video/') ? 'video' : 'image';

      // Add to booking's proof_gallery JSON
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('proof_gallery')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      const existingProofs = (booking?.proof_gallery as unknown as ProofItem[]) || [];
      const newProof: ProofItem = {
        id: crypto.randomUUID(),
        url: publicUrl,
        description,
        uploaded_by: user.id,
        uploaded_at: new Date().toISOString(),
        file_type: fileType,
      };

      const updatedProofs = [...existingProofs, newProof];

      const { error: updateError } = await supabase
        .from('bookings')
        .update({ proof_gallery: updatedProofs as unknown as Json })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      setUploadProgress(100);

      // Log activity
      await supabase.from('booking_activities').insert({
        booking_id: bookingId,
        actor_id: user.id,
        action: 'proof_uploaded',
        details: { description, file_type: fileType },
      });

      toast({
        title: 'Success',
        description: 'Proof uploaded successfully',
      });

      return true;
    } catch (error) {
      console.error('Error uploading proof:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload proof',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteProof = async (proofId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: booking, error: fetchError } = await supabase
        .from('bookings')
        .select('proof_gallery')
        .eq('id', bookingId)
        .single();

      if (fetchError) throw fetchError;

      const existingProofs = (booking?.proof_gallery as unknown as ProofItem[]) || [];
      const proofToDelete = existingProofs.find(p => p.id === proofId);
      
      if (proofToDelete) {
        // Extract file path from URL
        const urlParts = proofToDelete.url.split('/');
        const filePath = urlParts.slice(-2).join('/');
        
        // Delete from storage
        await supabase.storage.from('proof-gallery').remove([filePath]);
      }

      const updatedProofs = existingProofs.filter(p => p.id !== proofId);

      const { error: updateError } = await supabase
        .from('bookings')
        .update({ proof_gallery: updatedProofs as unknown as Json })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Proof deleted successfully',
      });

      return true;
    } catch (error) {
      console.error('Error deleting proof:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete proof',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    uploadProof,
    deleteProof,
    isUploading,
    uploadProgress,
  };
}
