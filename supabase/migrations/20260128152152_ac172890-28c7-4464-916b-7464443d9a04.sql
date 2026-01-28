-- Fix Security Definer View warnings by explicitly setting SECURITY INVOKER

-- Recreate public_profiles view with SECURITY INVOKER (safe - uses caller's permissions)
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  full_name,
  full_name_ar,
  avatar_url
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.public_profiles TO anon, authenticated;

-- Recreate donations_safe view with SECURITY INVOKER (safe - uses caller's permissions)  
DROP VIEW IF EXISTS public.donations_safe;
CREATE VIEW public.donations_safe
WITH (security_invoker = true)
AS
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

-- Add comment explaining the security design
COMMENT ON VIEW public.donations_safe IS 
'Safe view of donations that masks donor information when is_anonymous=true. 
Uses SECURITY INVOKER so RLS policies on the donations table still apply.';