-- Create storage bucket for proof images/videos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'proof-gallery', 
  'proof-gallery', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
);

-- Storage policies for proof gallery
CREATE POLICY "Providers can upload proof images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'proof-gallery' AND
  EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.user_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view proof images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'proof-gallery');

CREATE POLICY "Providers can delete their own proof images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'proof-gallery' AND
  EXISTS (
    SELECT 1 FROM public.providers p
    WHERE p.user_id = auth.uid()
  )
);

-- Add user_location table for location sync
CREATE TABLE IF NOT EXISTS public.user_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  country_code VARCHAR(2),
  country_name VARCHAR(100),
  currency_code VARCHAR(3) DEFAULT 'USD',
  timezone VARCHAR(50),
  city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.user_locations ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own location
CREATE POLICY "Users can view own location"
ON public.user_locations FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own location"
ON public.user_locations FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own location"
ON public.user_locations FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Add offline_sync_queue for offline operations
CREATE TABLE IF NOT EXISTS public.offline_sync_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  operation VARCHAR(20) NOT NULL, -- 'create', 'update', 'delete'
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  payload JSONB NOT NULL,
  synced BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.offline_sync_queue ENABLE ROW LEVEL SECURITY;

-- Users can manage their own sync queue
CREATE POLICY "Users can view own sync queue"
ON public.offline_sync_queue FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert to sync queue"
ON public.offline_sync_queue FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own sync queue"
ON public.offline_sync_queue FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete from sync queue"
ON public.offline_sync_queue FOR DELETE
TO authenticated
USING (user_id = auth.uid());