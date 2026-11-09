-- Places named in the owner's own homepage design, plus the December 2026 itinerary it shows.
-- Everything here is transcribed from the owner's mockup; nothing is invented, and all of it stays editable from the admin dashboard.

insert into public.destinations
  (slug, name, type, parent_id, map_key, iso2, flag, continent, capital, lat, lng, status_description, general_info, travel_tips, custom_sections, is_published)
select
  v.slug, v.name, v.type::public.destination_type, p.id,
  null, null, null, v.continent, null, v.lat, v.lng,
  null, null, null, '{}'::jsonb, true
from (values
  ('saudi-arabia', 'Saudi Arabia', 'sovereign', null,        'Asia',  24.0000,  45.0000),
  ('london',       'London',       'other',     'united-kingdom', 'Europe', 51.5072,  -0.1276),
  ('beijing',      'Beijing',      'other',     'china',     'Asia',  39.9042, 116.4074),
  ('shanghai',     'Shanghai',     'other',     'china',     'Asia',  31.2304, 121.4737),
  ('kartarpur',    'Kartarpur',    'other',     'pakistan',  'Asia',  31.9280,  74.5960),
  ('faisalabad',   'Faisalabad',   'other',     'pakistan',  'Asia',  31.4187,  73.0833),
  ('doha',         'Doha',         'other',     'qatar',     'Asia',  25.2854,  51.5310),
  ('lahore',       'Lahore',       'other',     'pakistan',  'Asia',  31.5204,  74.3587)
) as v(slug, name, type, parent_slug, continent, lat, lng)
left join public.destinations p on p.slug = v.parent_slug
where not exists (select 1 from public.destinations d where d.slug = v.slug);

insert into public.planned_trips
  (title, destination_id, intended_start, intended_end, status, itinerary, is_public)
select
  t.title, d.id, t.starts::date, t.ends::date, t.status::public.plan_status, t.itinerary, true
from (values
  ('London to Beijing',           'beijing',    '2026-12-02', '2026-12-02', 'planned', 'Depart London 21:00.'),
  ('Beijing to Hong Kong',        'hong-kong',  '2026-12-03', '2026-12-03', 'planned', 'Arrive Hong Kong 23:00.'),
  ('Hong Kong',                   'hong-kong',  '2026-12-04', '2026-12-07', 'planned', 'Sightseeing, OZONE, nightlife.'),
  ('Macau',                       'macau',      '2026-12-08', '2026-12-08', 'planned', 'Historic centre, nightlife.'),
  ('Hong Kong to Shanghai',       'shanghai',   '2026-12-09', '2026-12-09', 'planned', 'High-speed train.'),
  ('Shanghai',                    'shanghai',   '2026-12-10', '2026-12-11', 'planned', 'The Bund, skyscrapers, clubs.'),
  ('Shanghai to Doha to Lahore',  'lahore',     '2026-12-12', '2026-12-12', 'planned', 'Depart evening.')
) as t(title, slug, starts, ends, status, itinerary)
left join public.destinations d on d.slug = t.slug
where not exists (
  select 1 from public.planned_trips pt where pt.title = t.title and pt.intended_start = t.starts::date
);