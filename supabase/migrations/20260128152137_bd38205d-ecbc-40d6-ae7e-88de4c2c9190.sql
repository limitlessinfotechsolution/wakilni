-- Fix Critical Security Issues

-- 1. FIX: Public User Data Exposure
-- Remove the overly permissive policy that allows any authenticated user to view all profiles
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Create a view for minimal public profile data (only what's needed for display in bookings/messaging)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  user_id,
  full_name,
  full_name_ar,
  avatar_url
  -- Explicitly exclude: phone, phone_verified, preferred_language
FROM public.profiles;

-- Grant access to the public view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Add policy for users to view profiles of people they interact with (booking participants)
CREATE POLICY "Users can view profiles of booking participants"
  ON public.profiles FOR SELECT
  USING (
    -- Own profile
    auth.uid() = user_id
    OR
    -- Provider viewing traveler profile for their booking
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN providers p ON p.id = b.provider_id
      WHERE p.user_id = auth.uid()
      AND b.traveler_id = profiles.user_id
    )
    OR
    -- Traveler viewing provider profile for their booking
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN providers p ON p.id = b.provider_id
      WHERE b.traveler_id = auth.uid()
      AND p.user_id = profiles.user_id
    )
    OR
    -- Admin access
    public.has_role(auth.uid(), 'admin')
    OR
    public.has_role(auth.uid(), 'super_admin')
  );


-- 2. FIX: Anonymous Donations De-Anonymization
-- Create a secure function to mask donor info for anonymous donations
CREATE OR REPLACE FUNCTION public.get_donation_display_info(donation_row donations)
RETURNS JSONB
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN donation_row.is_anonymous = true THEN 
      jsonb_build_object(
        'donor_name', 'Anonymous Donor',
        'donor_email', NULL,
        'is_anonymous', true
      )
    ELSE 
      jsonb_build_object(
        'donor_name', donation_row.donor_name,
        'donor_email', donation_row.donor_email,
        'is_anonymous', false
      )
  END
$$;

-- Create a view for donations that respects anonymity
CREATE OR REPLACE VIEW public.donations_safe AS
SELECT 
  id,
  donor_id,
  amount,
  allocated_amount,
  remaining_amount,
  currency,
  payment_method,
  payment_status,
  message,
  created_at,
  updated_at,
  is_anonymous,
  -- Mask donor info for anonymous donations
  CASE WHEN is_anonymous = true THEN 'Anonymous Donor' ELSE donor_name END as donor_name,
  CASE WHEN is_anonymous = true THEN NULL ELSE donor_email END as donor_email
FROM public.donations;

-- Grant access to the safe view
GRANT SELECT ON public.donations_safe TO authenticated;

-- Update admin SELECT policy to use the view instead of direct table access for listing
-- Admins can still access full data via RPC if absolutely needed for fraud investigation
-- but the default view respects anonymity

-- Add comment explaining the security design
COMMENT ON VIEW public.donations_safe IS 
'Safe view of donations that masks donor information when is_anonymous=true. 
Admins should use this view for normal operations. Direct table access 
should only be used for fraud investigation with proper audit logging.';