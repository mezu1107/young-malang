ALTER TABLE public.website_settings
  ADD COLUMN IF NOT EXISTS maintenance_mode boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS maintenance_message text NOT NULL DEFAULT 'We are upgrading our kitchen systems. Online ordering will be back very soon.',
  ADD COLUMN IF NOT EXISTS logo_url text;

ALTER TABLE public.rider_settings
  ADD COLUMN IF NOT EXISTS points_per_order integer NOT NULL DEFAULT 10,
  ADD COLUMN IF NOT EXISTS per_km_rate numeric NOT NULL DEFAULT 20;

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS delivery_lat numeric,
  ADD COLUMN IF NOT EXISTS delivery_lng numeric,
  ADD COLUMN IF NOT EXISTS distance_km numeric,
  ADD COLUMN IF NOT EXISTS assigned_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;