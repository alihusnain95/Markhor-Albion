CREATE TABLE public.media_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL DEFAULT 'photo' CHECK (kind IN ('photo','video','embed')),
  url text NOT NULL,
  thumbnail_url text,
  caption text,
  alt_text text,
  location text,
  place text,
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  album text,
  is_featured boolean NOT NULL DEFAULT false,
  is_public boolean NOT NULL DEFAULT true,
  taken_on date,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_items TO authenticated;
GRANT ALL ON public.media_items TO service_role;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read public media" ON public.media_items FOR SELECT TO anon, authenticated USING (is_public);
CREATE POLICY "Admins manage media" ON public.media_items FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER media_items_updated BEFORE UPDATE ON public.media_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();