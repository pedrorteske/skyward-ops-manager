-- Create portal_settings table for public flight portal configuration
CREATE TABLE public.portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL UNIQUE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  display_name TEXT,
  logo_url TEXT,
  visible_columns JSONB NOT NULL DEFAULT '["aircraft", "route", "arrival_date", "arrival_time", "departure_date", "departure_time", "status"]'::jsonb,
  date_filters_enabled BOOLEAN NOT NULL DEFAULT true,
  access_type TEXT NOT NULL DEFAULT 'public' CHECK (access_type IN ('public', 'protected')),
  access_token TEXT,
  public_slug TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.portal_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies for portal_settings
CREATE POLICY "Deny anonymous access to portal_settings"
ON public.portal_settings
AS RESTRICTIVE
FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own company portal settings"
ON public.portal_settings
FOR SELECT
USING (company_id = get_user_company_id(auth.uid()));

CREATE POLICY "Admins can insert own company portal settings"
ON public.portal_settings
FOR INSERT
WITH CHECK (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update own company portal settings"
ON public.portal_settings
FOR UPDATE
USING (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete own company portal settings"
ON public.portal_settings
FOR DELETE
USING (company_id = get_user_company_id(auth.uid()) AND has_role(auth.uid(), 'admin'));

-- Trigger for updated_at
CREATE TRIGGER update_portal_settings_updated_at
BEFORE UPDATE ON public.portal_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get portal settings by slug (for public access)
CREATE OR REPLACE FUNCTION public.get_public_portal_by_slug(p_slug TEXT)
RETURNS TABLE (
  company_id UUID,
  display_name TEXT,
  logo_url TEXT,
  visible_columns JSONB,
  date_filters_enabled BOOLEAN,
  access_type TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    ps.company_id,
    ps.display_name,
    ps.logo_url,
    ps.visible_columns,
    ps.date_filters_enabled,
    ps.access_type
  FROM public.portal_settings ps
  WHERE ps.public_slug = p_slug
    AND ps.enabled = true;
$$;

-- Function to validate portal access token
CREATE OR REPLACE FUNCTION public.validate_portal_token(p_slug TEXT, p_token TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.portal_settings ps
    WHERE ps.public_slug = p_slug
      AND ps.enabled = true
      AND (ps.access_type = 'public' OR ps.access_token = p_token)
  );
$$;

-- Function to get public flights for a portal
CREATE OR REPLACE FUNCTION public.get_public_flights(p_company_id UUID)
RETURNS TABLE (
  id UUID,
  aircraft_prefix TEXT,
  aircraft_model TEXT,
  origin TEXT,
  destination TEXT,
  base TEXT,
  arrival_date DATE,
  arrival_time TIME,
  departure_date DATE,
  departure_time TIME,
  status flight_status
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    f.id,
    f.aircraft_prefix,
    f.aircraft_model,
    f.origin,
    f.destination,
    f.base,
    f.arrival_date,
    f.arrival_time,
    f.departure_date,
    f.departure_time,
    f.status
  FROM public.flights f
  WHERE f.company_id = p_company_id
  ORDER BY f.arrival_date DESC, f.arrival_time DESC;
$$;

-- Enable realtime for flights table
ALTER PUBLICATION supabase_realtime ADD TABLE public.flights;