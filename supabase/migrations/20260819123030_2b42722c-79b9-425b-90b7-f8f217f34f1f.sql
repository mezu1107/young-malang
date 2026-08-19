-- Integration / API keys managed from the admin panel
CREATE TABLE public.integration_keys (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key_name text NOT NULL UNIQUE,
  label text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  description text,
  value text NOT NULL DEFAULT '',
  is_public boolean NOT NULL DEFAULT true,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.integration_keys TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_keys TO authenticated;
GRANT ALL ON public.integration_keys TO service_role;

ALTER TABLE public.integration_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read public active integration keys"
ON public.integration_keys FOR SELECT
USING (is_public = true AND active = true);

CREATE POLICY "Admins can read all integration keys"
ON public.integration_keys FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert integration keys"
ON public.integration_keys FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update integration keys"
ON public.integration_keys FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete integration keys"
ON public.integration_keys FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER integration_keys_updated_at
BEFORE UPDATE ON public.integration_keys
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.integration_keys REPLICA IDENTITY FULL;

-- Live rider GPS positions for order tracking
CREATE TABLE public.rider_locations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rider_id uuid NOT NULL UNIQUE,
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  heading numeric,
  speed numeric,
  is_online boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.rider_locations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rider_locations TO authenticated;
GRANT ALL ON public.rider_locations TO service_role;

ALTER TABLE public.rider_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view rider locations"
ON public.rider_locations FOR SELECT
USING (true);

CREATE POLICY "Riders can insert their own location"
ON public.rider_locations FOR INSERT TO authenticated
WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Riders can update their own location"
ON public.rider_locations FOR UPDATE TO authenticated
USING (auth.uid() = rider_id)
WITH CHECK (auth.uid() = rider_id);

CREATE POLICY "Admins can manage rider locations"
ON public.rider_locations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER rider_locations_updated_at
BEFORE UPDATE ON public.rider_locations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.rider_locations REPLICA IDENTITY FULL;