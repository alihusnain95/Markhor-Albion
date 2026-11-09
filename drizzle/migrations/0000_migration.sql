
-- ========== Enums ==========
CREATE TYPE public.app_role AS ENUM ('admin');
CREATE TYPE public.destination_type AS ENUM ('sovereign','constituent','territory','sar','disputed','other');
CREATE TYPE public.visit_status AS ENUM ('visited','planned','not_visited','needs_confirmation');
CREATE TYPE public.wonder_status AS ENUM ('completed','planned','not_visited','needs_confirmation');
CREATE TYPE public.pk_status AS ENUM ('visited','planned','not_visited','not_confirmed');
CREATE TYPE public.unesco_type AS ENUM ('cultural','natural','mixed');
CREATE TYPE public.unesco_list AS ENUM ('inscribed','tentative');
CREATE TYPE public.article_status AS ENUM ('draft','published');
CREATE TYPE public.plan_status AS ENUM ('dreaming','researching','planned','booked','completed');

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ========== Roles ==========
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.admin_exists() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;
CREATE OR REPLACE FUNCTION public.claim_first_admin() RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  PERFORM pg_advisory_xact_lock(4242);
  IF EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN RETURN false; END IF;
  INSERT INTO public.user_roles(user_id, role) VALUES (auth.uid(), 'admin');
  RETURN true;
END; $$;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

-- ========== Destinations (general geography) ==========
CREATE TABLE public.destinations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  type public.destination_type NOT NULL DEFAULT 'sovereign',
  parent_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  map_key text,
  iso2 text,
  flag text,
  continent text,
  capital text,
  lat double precision,
  lng double precision,
  status_description text,
  general_info text,
  travel_tips text,
  custom_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_published boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX destinations_map_key_idx ON public.destinations(map_key);
CREATE INDEX destinations_parent_idx ON public.destinations(parent_id);
CREATE TRIGGER destinations_updated BEFORE UPDATE ON public.destinations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== Personal visit record (one per destination) ==========
CREATE TABLE public.destination_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id uuid NOT NULL UNIQUE REFERENCES public.destinations(id) ON DELETE CASCADE,
  status public.visit_status NOT NULL DEFAULT 'not_visited',
  visit_count integer CHECK (visit_count IS NULL OR visit_count >= 0),
  cities_explored text[] NOT NULL DEFAULT '{}',
  highlights text,
  personal_notes text,
  planning_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER destination_visits_updated BEFORE UPDATE ON public.destination_visits FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== Trips ==========
CREATE TABLE public.trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  start_date date,
  end_date date,
  cities text[] NOT NULL DEFAULT '{}',
  notes text,
  transport_notes text,
  is_public boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trips_updated BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TABLE public.trip_destinations (
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  destination_id uuid NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  PRIMARY KEY (trip_id, destination_id)
);

-- ========== Pakistan wonders ==========
CREATE TABLE public.pakistan_wonders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  region text NOT NULL,
  category text NOT NULL,
  description text,
  lat double precision,
  lng double precision,
  status public.pk_status NOT NULL DEFAULT 'not_confirmed',
  personal_notes text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER pakistan_wonders_updated BEFORE UPDATE ON public.pakistan_wonders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== UNESCO ==========
CREATE TABLE public.unesco_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  official_name text NOT NULL,
  countries text NOT NULL,
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  site_type public.unesco_type NOT NULL,
  list_status public.unesco_list NOT NULL DEFAULT 'inscribed',
  year_inscribed integer,
  unesco_ref text,
  description text,
  lat double precision,
  lng double precision,
  official_url text,
  status public.visit_status NOT NULL DEFAULT 'needs_confirmation',
  visit_date date,
  personal_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER unesco_updated BEFORE UPDATE ON public.unesco_sites FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== World wonders ==========
CREATE TABLE public.world_wonders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text,
  category text NOT NULL,
  description text,
  verified_facts text,
  status public.wonder_status NOT NULL DEFAULT 'needs_confirmation',
  visit_date date,
  personal_notes text,
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  source_url text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER world_wonders_updated BEFORE UPDATE ON public.world_wonders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== Articles ==========
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  cover_url text,
  intro text,
  body text,
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  city text,
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  published_at timestamptz,
  author text,
  categories text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  is_featured boolean NOT NULL DEFAULT false,
  status public.article_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX articles_destination_idx ON public.articles(destination_id);
CREATE TRIGGER articles_updated BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== Planned trips ==========
CREATE TABLE public.planned_trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  destination_id uuid REFERENCES public.destinations(id) ON DELETE SET NULL,
  intended_start date,
  intended_end date,
  status public.plan_status NOT NULL DEFAULT 'dreaming',
  itinerary text,
  budget text,
  transport_notes text,
  accommodation_notes text,
  goals text,
  packing jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER planned_trips_updated BEFORE UPDATE ON public.planned_trips FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== Site settings ==========
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER site_settings_updated BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ========== Grants + RLS ==========
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['destinations','destination_visits','trips','trip_destinations','pakistan_wonders','unesco_sites','world_wonders','articles','planned_trips','site_settings'] LOOP
    EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('CREATE POLICY "Admins manage %1$s" ON public.%1$I FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''admin'')) WITH CHECK (public.has_role(auth.uid(), ''admin''))', t);
  END LOOP;
END $$;

CREATE POLICY "Public read published destinations" ON public.destinations FOR SELECT TO anon, authenticated USING (is_published);
CREATE POLICY "Public read visits" ON public.destination_visits FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read public trips" ON public.trips FOR SELECT TO anon, authenticated USING (is_public);
CREATE POLICY "Public read trip links" ON public.trip_destinations FOR SELECT TO anon, authenticated USING (EXISTS (SELECT 1 FROM public.trips t WHERE t.id = trip_id AND t.is_public));
CREATE POLICY "Public read pk wonders" ON public.pakistan_wonders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read unesco" ON public.unesco_sites FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read world wonders" ON public.world_wonders FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public read published articles" ON public.articles FOR SELECT TO anon, authenticated USING (status = 'published' AND published_at IS NOT NULL AND published_at <= now());
CREATE POLICY "Public read public plans" ON public.planned_trips FOR SELECT TO anon, authenticated USING (is_public);
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT TO anon, authenticated USING (true);

-- ========== Seed: destinations ==========
INSERT INTO public.destinations (slug,name,type,map_key,iso2,flag,continent,capital,lat,lng,status_description) VALUES
('pakistan','Pakistan','sovereign','586','PK','🇵🇰','Asia','Islamabad',30.4,69.3,NULL),
('united-kingdom','United Kingdom','sovereign','826','GB','🇬🇧','Europe','London',54.0,-2.5,'Sovereign state comprising England, Scotland, Wales and Northern Ireland.'),
('poland','Poland','sovereign','616','PL','🇵🇱','Europe','Warsaw',52.0,19.1,NULL),
('germany','Germany','sovereign','276','DE','🇩🇪','Europe','Berlin',51.2,10.4,NULL),
('czech-republic','Czech Republic','sovereign','203','CZ','🇨🇿','Europe','Prague',49.8,15.5,NULL),
('united-arab-emirates','United Arab Emirates','sovereign','784','AE','🇦🇪','Asia','Abu Dhabi',24.0,54.0,NULL),
('qatar','Qatar','sovereign','634','QA','🇶🇦','Asia','Doha',25.3,51.2,NULL),
('italy','Italy','sovereign','380','IT','🇮🇹','Europe','Rome',42.8,12.6,NULL),
('ukraine','Ukraine','sovereign','804','UA','🇺🇦','Europe','Kyiv',49.0,31.4,NULL),
('norway','Norway','sovereign','578','NO','🇳🇴','Europe','Oslo',61.0,8.5,NULL),
('bosnia-and-herzegovina','Bosnia and Herzegovina','sovereign','070','BA','🇧🇦','Europe','Sarajevo',44.2,17.8,NULL),
('serbia','Serbia','sovereign','688','RS','🇷🇸','Europe','Belgrade',44.0,20.9,NULL),
('slovakia','Slovakia','sovereign','703','SK','🇸🇰','Europe','Bratislava',48.7,19.7,NULL),
('albania','Albania','sovereign','008','AL','🇦🇱','Europe','Tirana',41.2,20.2,NULL),
('portugal','Portugal','sovereign','620','PT','🇵🇹','Europe','Lisbon',39.6,-8.0,NULL),
('spain','Spain','sovereign','724','ES','🇪🇸','Europe','Madrid',40.2,-3.7,NULL),
('vatican-city','Vatican City','sovereign','336','VA','🇻🇦','Europe','Vatican City',41.903,12.453,NULL),
('bahrain','Bahrain','sovereign','048','BH','🇧🇭','Asia','Manama',26.07,50.55,NULL),
('latvia','Latvia','sovereign','428','LV','🇱🇻','Europe','Riga',56.9,24.6,NULL),
('lithuania','Lithuania','sovereign','440','LT','🇱🇹','Europe','Vilnius',55.2,23.9,NULL),
('turkey','Turkey','sovereign','792','TR','🇹🇷','Asia','Ankara',39.0,35.2,'Transcontinental country (Europe and Asia); grouped under Asia for continent statistics.'),
('moldova','Moldova','sovereign','498','MD','🇲🇩','Europe','Chișinău',47.4,28.4,NULL),
('romania','Romania','sovereign','642','RO','🇷🇴','Europe','Bucharest',45.9,24.9,NULL),
('bulgaria','Bulgaria','sovereign','100','BG','🇧🇬','Europe','Sofia',42.7,25.5,NULL),
('hungary','Hungary','sovereign','348','HU','🇭🇺','Europe','Budapest',47.2,19.5,NULL),
('united-states','United States','sovereign','840','US','🇺🇸','North America','Washington, D.C.',39.8,-98.6,NULL),
('costa-rica','Costa Rica','sovereign','188','CR','🇨🇷','North America','San José',9.7,-83.8,NULL),
('colombia','Colombia','sovereign','170','CO','🇨🇴','South America','Bogotá',4.6,-74.3,NULL),
('belarus','Belarus','sovereign','112','BY','🇧🇾','Europe','Minsk',53.7,27.9,NULL),
('denmark','Denmark','sovereign','208','DK','🇩🇰','Europe','Copenhagen',56.0,10.0,NULL),
('sweden','Sweden','sovereign','752','SE','🇸🇪','Europe','Stockholm',62.0,15.0,NULL),
('finland','Finland','sovereign','246','FI','🇫🇮','Europe','Helsinki',64.0,26.0,NULL),
('estonia','Estonia','sovereign','233','EE','🇪🇪','Europe','Tallinn',58.6,25.0,NULL),
('morocco','Morocco','sovereign','504','MA','🇲🇦','Africa','Rabat',31.8,-7.1,NULL),
('cyprus','Cyprus','sovereign','196','CY','🇨🇾','Europe','Nicosia',34.9,33.0,'Grouped under Europe for continent statistics.'),
('russia','Russia','sovereign','643','RU','🇷🇺','Europe','Moscow',61.5,90.0,'Transcontinental country; grouped under Europe for continent statistics.'),
('kyrgyzstan','Kyrgyzstan','sovereign','417','KG','🇰🇬','Asia','Bishkek',41.2,74.8,NULL),
('kazakhstan','Kazakhstan','sovereign','398','KZ','🇰🇿','Asia','Astana',48.0,66.9,NULL),
('uzbekistan','Uzbekistan','sovereign','860','UZ','🇺🇿','Asia','Tashkent',41.4,64.6,NULL),
('austria','Austria','sovereign','040','AT','🇦🇹','Europe','Vienna',47.5,14.6,NULL),
('france','France','sovereign','250','FR','🇫🇷','Europe','Paris',46.2,2.2,NULL),
('netherlands','Netherlands','sovereign','528','NL','🇳🇱','Europe','Amsterdam',52.1,5.3,NULL),
('belgium','Belgium','sovereign','056','BE','🇧🇪','Europe','Brussels',50.5,4.5,NULL),
('croatia','Croatia','sovereign','191','HR','🇭🇷','Europe','Zagreb',45.1,15.2,NULL),
('china','China','sovereign','156','CN','🇨🇳','Asia','Beijing',35.9,104.2,'Mainland China. Hong Kong and Macau are tracked separately.'),
('isle-of-man','Isle of Man','territory','833','IM','🇮🇲','Europe','Douglas',54.24,-4.55,'Self-governing British Crown Dependency. Not part of the United Kingdom.'),
('gibraltar','Gibraltar','territory',NULL,'GI','🇬🇮','Europe',NULL,36.14,-5.35,'British Overseas Territory. Not part of the United Kingdom.'),
('northern-cyprus','Northern Cyprus','disputed','N. Cyprus',NULL,NULL,'Europe','North Nicosia',35.25,33.6,'Self-declared state recognised only by Turkey. Internationally regarded as part of the Republic of Cyprus. Not counted as a sovereign country.');

INSERT INTO public.destinations (slug,name,type,parent_id,flag,continent,capital,lat,lng,status_description)
SELECT v.slug, v.name, v.type::public.destination_type, p.id, v.flag, v.continent, v.capital, v.lat, v.lng, v.descr
FROM (VALUES
  ('england','England','constituent','united-kingdom','🏴󠁧󠁢󠁥󠁮󠁧󠁿','Europe','London',52.5,-1.5,'Constituent country of the United Kingdom.'),
  ('scotland','Scotland','constituent','united-kingdom','🏴󠁧󠁢󠁳󠁣󠁴󠁿','Europe','Edinburgh',56.8,-4.2,'Constituent country of the United Kingdom.'),
  ('wales','Wales','constituent','united-kingdom','🏴󠁧󠁢󠁷󠁬󠁳󠁿','Europe','Cardiff',52.3,-3.7,'Constituent country of the United Kingdom.'),
  ('northern-ireland','Northern Ireland','constituent','united-kingdom',NULL,'Europe','Belfast',54.6,-6.7,'Part of the United Kingdom.'),
  ('hong-kong','Hong Kong','sar','china','🇭🇰','Asia',NULL,22.32,114.17,'Special Administrative Region of the People''s Republic of China.'),
  ('macau','Macau','sar','china','🇲🇴','Asia',NULL,22.2,113.55,'Special Administrative Region of the People''s Republic of China.')
) AS v(slug,name,type,parent_slug,flag,continent,capital,lat,lng,descr)
JOIN public.destinations p ON p.slug = v.parent_slug;

UPDATE public.destinations SET map_key='344' WHERE slug='hong-kong';
UPDATE public.destinations SET map_key='446' WHERE slug='macau';

-- Visit records
INSERT INTO public.destination_visits (destination_id, status, visit_count)
SELECT d.id, v.status::public.visit_status, v.cnt
FROM (VALUES
 ('pakistan','visited',NULL),('england','visited',NULL),('wales','visited',NULL),('scotland','visited',NULL),
 ('poland','visited',7),('germany','visited',NULL),('czech-republic','visited',3),('united-arab-emirates','visited',NULL),
 ('qatar','visited',NULL),('italy','visited',NULL),('ukraine','visited',5),('norway','visited',NULL),
 ('bosnia-and-herzegovina','visited',NULL),('serbia','visited',2),('slovakia','visited',NULL),('albania','visited',NULL),
 ('portugal','visited',2),('isle-of-man','visited',NULL),('spain','visited',NULL),('gibraltar','visited',NULL),
 ('vatican-city','visited',NULL),('bahrain','visited',NULL),('latvia','visited',3),('lithuania','visited',4),
 ('turkey','visited',3),('moldova','visited',NULL),('romania','visited',NULL),('bulgaria','visited',NULL),
 ('hungary','visited',NULL),('united-states','visited',NULL),('costa-rica','visited',NULL),('colombia','visited',NULL),
 ('belarus','visited',2),('denmark','visited',NULL),('sweden','visited',NULL),('finland','visited',NULL),
 ('estonia','visited',NULL),('morocco','visited',NULL),('cyprus','visited',NULL),('northern-cyprus','visited',NULL),
 ('russia','visited',NULL),('kyrgyzstan','visited',2),('kazakhstan','visited',2),('uzbekistan','visited',NULL),
 ('austria','visited',NULL),('france','visited',NULL),('netherlands','visited',NULL),('belgium','visited',NULL),
 ('croatia','visited',NULL),
 ('united-kingdom','visited',NULL),
 ('northern-ireland','not_visited',NULL),('china','not_visited',NULL),('hong-kong','not_visited',NULL),('macau','not_visited',NULL)
) AS v(slug,status,cnt)
JOIN public.destinations d ON d.slug = v.slug;

UPDATE public.destination_visits SET personal_notes = 'Recorded as visited because England, Scotland and Wales are recorded as visited.'
WHERE destination_id = (SELECT id FROM public.destinations WHERE slug='united-kingdom');

-- ========== Seed: Pakistan 50 wonders ==========
INSERT INTO public.pakistan_wonders (slug,name,region,category,lat,lng,status,sort_order) VALUES
('k2','K2','Gilgit-Baltistan','Mountains',35.88,76.51,'not_confirmed',1),
('nanga-parbat','Nanga Parbat','Gilgit-Baltistan','Mountains',35.24,74.59,'not_confirmed',2),
('hunza-valley','Hunza Valley','Gilgit-Baltistan','Valleys',36.32,74.65,'not_confirmed',3),
('attabad-lake','Attabad Lake','Gilgit-Baltistan','Lakes',36.33,74.87,'not_confirmed',4),
('passu-cones','Passu Cones','Gilgit-Baltistan','Mountains',36.47,74.88,'not_confirmed',5),
('khunjerab-pass','Khunjerab Pass','Gilgit-Baltistan','Natural wonders',36.85,75.43,'not_confirmed',6),
('deosai-plains','Deosai Plains','Gilgit-Baltistan','Natural wonders',35.03,75.43,'not_confirmed',7),
('fairy-meadows','Fairy Meadows','Gilgit-Baltistan','Valleys',35.39,74.59,'not_confirmed',8),
('baltit-fort','Baltit Fort','Gilgit-Baltistan','Forts',36.32,74.67,'not_confirmed',9),
('altit-fort','Altit Fort','Gilgit-Baltistan','Forts',36.32,74.68,'not_confirmed',10),
('shigar-fort','Shigar Fort','Gilgit-Baltistan','Forts',35.42,75.73,'not_confirmed',11),
('upper-kachura-lake','Upper Kachura Lake','Gilgit-Baltistan','Lakes',35.43,75.47,'not_confirmed',12),
('sheosar-lake','Sheosar Lake','Gilgit-Baltistan','Lakes',34.99,75.24,'not_confirmed',13),
('baltoro-glacier','Baltoro Glacier','Gilgit-Baltistan','Natural wonders',35.73,76.38,'not_confirmed',14),
('swat-valley','Swat Valley','Khyber Pakhtunkhwa','Valleys',35.22,72.43,'not_confirmed',15),
('mahodand-lake','Mahodand Lake','Khyber Pakhtunkhwa','Lakes',35.75,72.59,'not_confirmed',16),
('lake-saiful-muluk','Lake Saiful Muluk','Khyber Pakhtunkhwa','Lakes',34.88,73.69,'not_confirmed',17),
('kaghan-valley','Kaghan Valley','Khyber Pakhtunkhwa','Valleys',34.78,73.53,'not_confirmed',18),
('kalash-valleys','Kalash Valleys','Khyber Pakhtunkhwa','Cultural experiences',35.69,71.68,'not_confirmed',19),
('tirich-mir','Tirich Mir','Khyber Pakhtunkhwa','Mountains',36.25,71.84,'not_confirmed',20),
('shandur-pass','Shandur Pass','Khyber Pakhtunkhwa','Natural wonders',36.07,72.52,'not_confirmed',21),
('mahabat-khan-mosque','Mahabat Khan Mosque','Khyber Pakhtunkhwa','Mosques',34.01,71.57,'not_confirmed',22),
('qissa-khwani-bazaar','Qissa Khwani Bazaar, Peshawar','Khyber Pakhtunkhwa','Cities',34.01,71.57,'not_confirmed',23),
('takht-i-bahi','Takht-i-Bahi','Khyber Pakhtunkhwa','Archaeological sites',34.29,71.95,'not_confirmed',24),
('badshahi-mosque','Badshahi Mosque','Punjab','Mosques',31.588,74.31,'not_confirmed',25),
('lahore-fort','Lahore Fort','Punjab','Forts',31.59,74.31,'not_confirmed',26),
('minar-e-pakistan','Minar-e-Pakistan','Punjab','Historical monuments',31.5925,74.3095,'visited',27),
('wazir-khan-mosque','Wazir Khan Mosque','Punjab','Mosques',31.583,74.323,'not_confirmed',28),
('khewra-salt-mine','Khewra Salt Mine','Punjab','Natural wonders',32.65,73.0,'visited',29),
('rohtas-fort','Rohtas Fort','Punjab','Forts',32.96,73.59,'not_confirmed',30),
('katas-raj-temples','Katas Raj Temples','Punjab','Religious heritage',32.72,72.95,'not_confirmed',31),
('taxila','Taxila','Punjab','Archaeological sites',33.75,72.82,'not_confirmed',32),
('derawar-fort','Derawar Fort','Punjab','Forts',28.77,71.33,'not_confirmed',33),
('cholistan-desert','Cholistan Desert','Punjab','Deserts',28.5,71.5,'not_confirmed',34),
('uch-sharif','Uch Sharif','Punjab','Religious heritage',29.24,71.06,'not_confirmed',35),
('tomb-of-shah-rukn-e-alam','Tomb of Shah Rukn-e-Alam, Multan','Punjab','Religious heritage',30.2,71.47,'not_confirmed',36),
('kartarpur-darbar-sahib','Gurdwara Darbar Sahib, Kartarpur','Punjab','Religious heritage',32.08,75.02,'not_confirmed',37),
('mohenjo-daro','Mohenjo-daro','Sindh','Archaeological sites',27.33,68.14,'not_confirmed',38),
('makli-necropolis','Makli Necropolis','Sindh','Historical monuments',24.75,67.9,'not_confirmed',39),
('ranikot-fort','Ranikot Fort','Sindh','Forts',25.9,67.9,'not_confirmed',40),
('shah-jahan-mosque-thatta','Shah Jahan Mosque, Thatta','Sindh','Mosques',24.75,67.92,'not_confirmed',41),
('mazar-e-quaid','Mazar-e-Quaid, Karachi','Sindh','Historical monuments',24.875,67.04,'not_confirmed',42),
('hingol-national-park','Hingol National Park','Balochistan','Natural wonders',25.5,65.5,'not_confirmed',43),
('kund-malir','Kund Malir Beach','Balochistan','Coastlines',25.4,65.47,'not_confirmed',44),
('astola-island','Astola Island','Balochistan','Coastlines',25.12,63.85,'not_confirmed',45),
('muzaffarabad','Muzaffarabad','Azad Jammu and Kashmir','Cities',34.37,73.47,'visited',46),
('neelum-valley','Neelum Valley','Azad Jammu and Kashmir','Valleys',34.6,73.9,'not_visited',47),
('rawalakot','Rawalakot','Azad Jammu and Kashmir','Cities',33.86,73.76,'not_visited',48),
('faisal-mosque','Faisal Mosque','Islamabad Capital Territory','Mosques',33.73,73.04,'not_confirmed',49),
('margalla-hills','Margalla Hills','Islamabad Capital Territory','Natural wonders',33.75,73.05,'not_confirmed',50);

UPDATE public.pakistan_wonders SET description = 'Part of the UNESCO World Heritage property "Fort and Shalamar Gardens in Lahore".' WHERE slug='lahore-fort';
UPDATE public.pakistan_wonders SET description = 'A national monument in Lahore. Not an individually inscribed UNESCO World Heritage property.' WHERE slug='minar-e-pakistan';
UPDATE public.pakistan_wonders SET description = 'A working salt mine in the Salt Range. Not an individually inscribed UNESCO World Heritage property.' WHERE slug='khewra-salt-mine';

-- ========== Seed: UNESCO (Pakistan, inscribed) ==========
INSERT INTO public.unesco_sites (official_name,countries,destination_id,site_type,list_status,year_inscribed,unesco_ref,lat,lng,official_url,status)
SELECT v.n,'Pakistan',(SELECT id FROM public.destinations WHERE slug='pakistan'),'cultural','inscribed',v.y,v.r,v.lat,v.lng,'https://whc.unesco.org/en/list/'||v.r,'needs_confirmation'
FROM (VALUES
 ('Archaeological Ruins at Moenjodaro',1980,'138',27.33,68.14),
 ('Taxila',1980,'139',33.75,72.82),
 ('Buddhist Ruins of Takht-i-Bahi and Neighbouring City Remains at Sahr-i-Bahlol',1980,'140',34.29,71.95),
 ('Fort and Shalamar Gardens in Lahore',1981,'171',31.59,74.31),
 ('Historical Monuments at Makli, Thatta',1981,'143',24.75,67.9),
 ('Rohtas Fort',1997,'586',32.96,73.59)
) AS v(n,y,r,lat,lng);

-- ========== Seed: World wonders ==========
INSERT INTO public.world_wonders (name,location,category,source_url,sort_order) VALUES
('Great Wall of China','China','New Seven Wonders of the World','https://world.new7wonders.com/',1),
('Petra','Jordan','New Seven Wonders of the World','https://world.new7wonders.com/',2),
('Christ the Redeemer','Rio de Janeiro, Brazil','New Seven Wonders of the World','https://world.new7wonders.com/',3),
('Machu Picchu','Peru','New Seven Wonders of the World','https://world.new7wonders.com/',4),
('Chichén Itzá','Yucatán, Mexico','New Seven Wonders of the World','https://world.new7wonders.com/',5),
('Colosseum','Rome, Italy','New Seven Wonders of the World','https://world.new7wonders.com/',6),
('Taj Mahal','Agra, India','New Seven Wonders of the World','https://world.new7wonders.com/',7),
('Great Pyramid of Giza','Giza, Egypt','Seven Wonders of the Ancient World',NULL,10),
('Hanging Gardens of Babylon','Babylon, Iraq (existence debated)','Seven Wonders of the Ancient World',NULL,11),
('Temple of Artemis at Ephesus','Selçuk, Turkey (ruins)','Seven Wonders of the Ancient World',NULL,12),
('Statue of Zeus at Olympia','Olympia, Greece (lost)','Seven Wonders of the Ancient World',NULL,13),
('Mausoleum at Halicarnassus','Bodrum, Turkey (ruins)','Seven Wonders of the Ancient World',NULL,14),
('Colossus of Rhodes','Rhodes, Greece (lost)','Seven Wonders of the Ancient World',NULL,15),
('Lighthouse of Alexandria','Alexandria, Egypt (lost)','Seven Wonders of the Ancient World',NULL,16);

UPDATE public.world_wonders SET destination_id=(SELECT id FROM public.destinations WHERE slug='china') WHERE name='Great Wall of China';
UPDATE public.world_wonders SET destination_id=(SELECT id FROM public.destinations WHERE slug='italy') WHERE name='Colosseum';
UPDATE public.world_wonders SET destination_id=(SELECT id FROM public.destinations WHERE slug='turkey') WHERE name IN ('Temple of Artemis at Ephesus','Mausoleum at Halicarnassus');
UPDATE public.world_wonders SET verified_facts='The only one of the Seven Wonders of the Ancient World still largely intact.' WHERE name='Great Pyramid of Giza';

-- ========== Seed: settings ==========
INSERT INTO public.site_settings (key, value) VALUES
('counting', '{"count_disputed_as_sovereign": false, "count_uk_via_constituents": true}'::jsonb),
('about', '{"who_i_am":"","why_i_travel":"","what_travel_means":"","cultural_discoveries":"","architecture":"","personal_experiences":"","life_beyond_work":"","future_ambitions":"","favourite_destinations":""}'::jsonb),
('social', '{"instagram":"","youtube":"","x":"","email":""}'::jsonb);
