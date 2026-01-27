-- Create provider availability table
CREATE TABLE public.provider_availability (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL REFERENCES public.providers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  start_time TIME,
  end_time TIME,
  max_bookings INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  notes TEXT,
  notes_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(provider_id, date)
);

-- Enable RLS
ALTER TABLE public.provider_availability ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Providers can manage their own availability"
ON public.provider_availability
FOR ALL
USING (EXISTS (
  SELECT 1 FROM providers
  WHERE providers.id = provider_availability.provider_id
  AND providers.user_id = auth.uid()
));

CREATE POLICY "Admins can view all availability"
ON public.provider_availability
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view available slots"
ON public.provider_availability
FOR SELECT
USING (is_available = true);

-- Create trigger for updated_at
CREATE TRIGGER update_provider_availability_updated_at
BEFORE UPDATE ON public.provider_availability
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_provider_availability_provider_date ON public.provider_availability(provider_id, date);
CREATE INDEX idx_provider_availability_date ON public.provider_availability(date);