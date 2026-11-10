import { Link } from "@tanstack/react-router";
import { ArrowRight, Images, Plane, Search, Compass } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorldMap, type MapArc, type MapPin } from "@/components/world-map";
import { useTravelStats } from "@/components/atlas";
import { DESTINATION_IMAGES, DESTINATION_TAGLINES, HOME_HERO_IMAGE, TILE_IMAGES } from "@/lib/images";
import { articlesQuery, mediaQuery } from "@/lib/queries";
import type { DestinationWithVisit, PlannedTrip } from "@/lib/queries";

/** The owner's curated front-page row — planned and visited places, not a claim about which have been seen. */
const FEATURED = ["hong-kong", "macau", "shanghai", "kartarpur", "faisalabad", "saudi-arabia", "beijing", "london"];

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
}

/** "2 DEC 2026", "4–7 DEC 2026" or "30 NOV – 2 DEC 2026". */
function fmtRange(start: string | null, end: string | null) {
  if (!start) return "TBC";
  const s = new Date(start + "T00:00:00");
  const e = end && end !== start ? new Date(end + "T00:00:00") : null;
  const day = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric" });
  const monYear = (d: Date) => d.toLocaleDateString("en-GB", { month: "short", year: "numeric" }).toUpperCase();
  if (!e) return `${day(s)} ${monYear(s)}`;
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) return `${day(s)}–${day(e)} ${monYear(s)}`;
  return `${day(s)} ${monYear(s)} – ${day(e)} ${monYear(e)}`;
}

function Panel({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return <div className={`rounded-xl border border-border bg-card/80 backdrop-blur-md ${className}`}>{children}</div>;
}

export function HomeTop({ dests, plans }: { dests: DestinationWithVisit[]; plans: PlannedTrip[] }) {
  const { stats, unescoVisited, wondersCompleted } = useTravelStats();
  const articles = useQuery(articlesQuery).data ?? [];
  const media = useQuery(mediaQuery).data ?? [];
  const recentStories = articles.slice(0, 3);
  const gallery = media.filter((m) => m.kind === "photo").slice(0, 6);
  const [q, setQ] = useState("");
  const byId = (id: string | null) => dests.find((d) => d.id === id) ?? null;
  const ordered = plans.filter((p) => p.intended_start).sort((a, b) => (a.intended_start! < b.intended_start! ? -1 : 1));
  const next = ordered[0];
  const nextDest = next ? byId(next.destination_id) : null;
  const featured = FEATURED.map((s) => dests.find((d) => d.slug === s)).filter(Boolean) as DestinationWithVisit[];
  const match = q.trim() ? dests.filter((d) => d.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 5) : [];

  const tiles = [
    { to: "/passport", title: "The Journey", sub: "My trips, experiences and adventures", img: TILE_IMAGES.journey },
    { to: "/my-world", title: "The World", sub: "Explore countries, cultures and places", img: TILE_IMAGES.world },
    { to: "/journal", title: "The Thinking", sub: "Ideas, reflections and perspectives", img: TILE_IMAGES.thinking },
  ] as const;

  // Flight paths follow the published plan, starting from London.
  const arcs: MapArc[] = [];
  const home = dests.find((d) => d.slug === "london") ?? null;
  let prev = home && home.lat != null && home.lng != null ? home : null;
  for (const p of ordered) {
    const d = byId(p.destination_id);
    if (!d || d.lat == null || d.lng == null) continue;
    if (prev && prev.id !== d.id && prev.lat != null && prev.lng != null) {
      arcs.push({ from: { lat: prev.lat, lng: prev.lng }, to: { lat: d.lat, lng: d.lng } });
    }
    prev = d;
  }

  const pinTones = new Map<string, "visited" | "planned">();
  for (const p of ordered) {
    const d = byId(p.destination_id);
    if (d) pinTones.set(d.slug, "planned");
  }
  if (home) pinTones.set(home.slug, "visited");
  const pins: MapPin[] = [...pinTones.entries()]
    .map(([slug, tone]): MapPin | null => {
      const d = dests.find((x) => x.slug === slug);
      return d && d.lat != null && d.lng != null ? { name: d.name, lat: d.lat, lng: d.lng, tone } : null;
    })
    .filter((x): x is MapPin => !!x);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate min-h-[88svh] overflow-hidden bg-[#061326] pt-16 md:min-h-[760px]">
        <img src={HOME_HERO_IMAGE} alt="A traveller looking out over a city skyline at night" width={1920} height={1080} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,12,29,0.96)_0%,rgba(5,19,43,0.78)_38%,rgba(5,19,43,0.20)_76%,rgba(5,19,43,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,#061326_0%,rgba(6,19,38,0.05)_36%,rgba(4,13,29,0.22)_100%)]" />
        <div className="absolute inset-x-0 top-16 h-px bg-gradient-to-r from-transparent via-ice/40 to-transparent" />
        <div className="container-page relative flex min-h-[88svh] flex-col justify-center py-24 md:min-h-[760px]">
          {next && (
            <Link
              to="/next-adventure"
              className="absolute right-0 top-6 flex items-center gap-3 rounded-full border border-border/70 bg-background/70 px-4 py-2 backdrop-blur-md transition-colors hover:border-primary md:right-6"
            >
              <Plane className="h-4 w-4 -rotate-45 text-primary" />
              <span className="text-left leading-tight">
                <span className="block text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground">Next destination</span>
                <span className="block text-xs font-bold uppercase tracking-[0.18em]">{nextDest?.name ?? next.title}</span>
                <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">{fmtDate(next.intended_start)}</span>
              </span>
            </Link>
          )}
          <p className="mb-5 flex items-center gap-3 text-[0.62rem] font-semibold uppercase tracking-[0.48em] text-sky-200/90"><span className="h-px w-10 bg-sky-300/80" /> A WORLD OF STORIES</p>
          <h1 className="max-w-4xl font-serif text-5xl font-medium tracking-[0.02em] text-white drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)] md:text-7xl lg:text-[6.5rem]">
            MARKHOR <span className="block text-sky-200">ALBION</span>
          </h1>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.42em] text-white/90">Beyond Borders. Beyond the Ordinary.</p>
          <p className="mt-7 max-w-xl text-base leading-8 text-slate-100/85 md:text-lg">Every country tells a story. Every journey changes the perspective. Follow my journey across borders, cultures, landscapes and extraordinary places around the world.</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/my-world" className="inline-flex items-center gap-3 rounded-full border border-sky-300 bg-sky-300 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#061326] transition-all hover:-translate-y-0.5 hover:bg-white">Explore My World <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/journal" className="inline-flex items-center gap-3 rounded-full border border-white/45 bg-white/5 px-6 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:bg-white/10">Read My Travel Journal</Link>
          </div>
        </div>
      </section>

      {/* Live travel statistics */}
      <section className="container-page relative z-10 -mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 backdrop-blur-xl sm:grid-cols-3 lg:grid-cols-5">
        {[
          { label: "Countries & destinations", value: stats ? stats.countriesVisited : "Not yet recorded" },
          { label: "Continents explored", value: stats ? stats.continents.length : "Not yet recorded" },
          { label: "World wonders", value: wondersCompleted ?? "Not yet recorded" },
          { label: "UNESCO sites visited", value: unescoVisited ?? "Not yet recorded" },
          { label: "Places to discover", value: stats ? "∞" : "Not yet recorded" },
        ].map((item) => <div key={item.label} className="bg-[#081a33]/95 px-5 py-6">
          <p className="font-serif text-3xl text-white md:text-4xl">{item.value}</p>
          <p className="mt-2 text-[0.6rem] uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
        </div>)}
      </section>

      {/* Four tiles */}
      <section className="container-page relative z-10 -mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.title} to={t.to} className="group flex items-center gap-4 overflow-hidden rounded-xl border border-border bg-card/90 p-2 pr-4 backdrop-blur-md transition-colors hover:border-primary">
            <span className="flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-background text-primary">
              <img src={t.img} alt="" loading="lazy" className="h-full w-full object-cover" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block whitespace-nowrap text-sm font-bold uppercase tracking-[0.15em]">{t.title}</span>
              <span className="mt-1 block text-[0.65rem] uppercase leading-relaxed tracking-widest text-muted-foreground">{t.sub}</span>
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 rounded-full border border-border p-0.5 text-muted-foreground transition group-hover:border-primary group-hover:text-primary" />
          </Link>
        ))}
      </section>

      {/* Map row */}
      <section className="container-page mt-3 grid gap-3 lg:grid-cols-[190px_minmax(0,1fr)_270px]">
        <Panel className="p-5">
          <p className="text-sm font-bold uppercase tracking-[0.2em]">My travel map</p>
          <p className="mt-2 text-[0.65rem] uppercase leading-relaxed tracking-widest text-muted-foreground">Explore where I've been and where I'm going</p>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-center gap-3"><span className="h-3.5 w-3.5 rounded-full border-2 border-primary bg-primary/50" />Visited</li>
            <li className="flex items-center gap-3"><span className="h-3.5 w-3.5 rounded-full border-2 border-planned bg-planned/50" />Upcoming</li>
            <li className="flex items-center gap-3"><span className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/70 bg-unvisited" />Planning</li>
            <li className="flex items-center gap-3"><span className="h-3.5 w-3.5 rounded-full border-2 border-dashed border-ice bg-transparent" />Needs confirmation</li>
          </ul>
          <div className="relative mt-6">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search country…" aria-label="Search country" className="w-full rounded-full border border-border bg-background px-4 py-2 pr-9 text-xs outline-none focus:border-primary" />
            <Search className="pointer-events-none absolute right-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            {match.length > 0 && (
              <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-popover text-sm">
                {match.map((d) => (
                  <li key={d.id}><Link to="/destinations/$slug" params={{ slug: d.slug }} className="block px-3 py-2 hover:bg-accent">{d.name}</Link></li>
                ))}
              </ul>
            )}
          </div>
        </Panel>

        <Panel className="relative overflow-hidden">
          <Link to="/my-world" aria-label="Open the interactive world map">
            <WorldMap destinations={dests} interactive={false} arcs={arcs} pins={pins} className="aspect-[16/10] w-full" />
          </Link>
          <Compass className="absolute bottom-4 left-4 h-10 w-10 text-muted-foreground/60" />
          <div className="absolute bottom-4 left-20 flex gap-8 text-xs">
            <div><p className="font-serif text-2xl">{stats?.sovereign ?? "—"}</p><p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Countries visited</p></div>
            <div><p className="font-serif text-2xl">{pins.filter((p) => p.tone === "planned").length}</p><p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Upcoming destinations</p></div>
            <div><p className="font-serif text-2xl">∞</p><p className="text-[0.6rem] uppercase tracking-widest text-muted-foreground">Places to explore</p></div>
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-[0.2em]">Upcoming trip</p>
            <Link to="/next-adventure" className="text-xs text-ice">View all</Link>
          </div>
          {ordered.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">No upcoming trips are published yet. Plans appear here once they're made public from the admin dashboard.</p>
          ) : (
            <ol className="relative mt-5 space-y-4 border-l border-border pl-5">
              {ordered.slice(0, 7).map((p) => {
                const d = byId(p.destination_id);
                const img = d ? DESTINATION_IMAGES[d.slug] : null;
                return (
                  <li key={p.id} className="relative flex gap-3">
                    <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
                    <span className="w-20 shrink-0 text-[0.65rem] uppercase leading-tight text-muted-foreground">{fmtRange(p.intended_start, p.intended_end)}</span>
                    {img ? (
                      <img src={img} alt="" loading="lazy" className="h-9 w-14 shrink-0 rounded object-cover" />
                    ) : (
                      <span className="flex h-9 w-14 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground"><Images className="h-3.5 w-3.5" /></span>
                    )}
                    <span className="min-w-0 text-xs">
                      <span className="block font-semibold">{p.title}</span>
                      {(p.itinerary || p.transport_notes) && <span className="block text-muted-foreground">{p.itinerary ?? p.transport_notes}</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      </section>

      {/* Recent stories */}
      <section className="container-page mt-16 pb-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><p className="eyebrow">From the journal</p><h2 className="mt-2 font-serif text-3xl md:text-4xl">Recent stories</h2></div>
          <Link to="/journal" className="text-xs uppercase tracking-widest text-ice hover:text-white">Read the journal →</Link>
        </div>
        {recentStories.length ? <div className="grid gap-4 md:grid-cols-3">
          {recentStories.map((a) => <Link key={a.id} to="/journal/$slug" params={{slug:a.slug}} className="group overflow-hidden rounded-xl border border-border bg-card">
            {a.cover_url ? <img src={a.cover_url} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"/> : <div className="aspect-[16/10] bg-secondary"/>}
            <div className="p-5"><p className="font-serif text-xl group-hover:text-ice">{a.title}</p>{a.intro && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{a.intro}</p>}</div>
          </Link>)}
        </div> : <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Travel stories will appear here when published.</p>}
      </section>

      {/* Curated photo gallery */}
      <section className="container-page mt-14 pb-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><p className="eyebrow">Visual diary</p><h2 className="mt-2 font-serif text-3xl md:text-4xl">Moments from the journey</h2></div>
          <Link to="/gallery" className="text-xs uppercase tracking-widest text-ice hover:text-white">Open gallery →</Link>
        </div>
        {gallery.length ? <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {gallery.map((m) => <Link key={m.id} to="/gallery" className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-card">
            <img src={m.url} alt={m.alt_text ?? m.caption ?? "Travel photograph"} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"/>
            <span className="absolute inset-0 bg-gradient-to-t from-[#061326]/70 to-transparent opacity-70"/>
            {m.caption && <span className="absolute bottom-3 left-3 right-3 text-sm text-white">{m.caption}</span>}
          </Link>)}
        </div> : <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Your travel photographs will appear here as they are added to the gallery.</p>}
      </section>
      {/* Featured destinations */}
      <section className="container-page mt-3 pb-6">
        <Panel className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-[0.2em]">Featured destinations</p>
            <Link to="/destinations" className="text-xs text-ice">View all</Link>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
            {featured.map((d) => (
              <Link key={d.id} to="/destinations/$slug" params={{ slug: d.slug }} className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                {DESTINATION_IMAGES[d.slug] && <img src={DESTINATION_IMAGES[d.slug]} alt={d.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                <span className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                <span className="absolute inset-x-3 bottom-3">
                  <span className="block text-sm font-bold uppercase tracking-widest">{d.name}</span>
                  <span className="block text-[0.6rem] uppercase tracking-widest text-muted-foreground">{DESTINATION_TAGLINES[d.slug]}</span>
                </span>
              </Link>
            ))}
          </div>
        </Panel>
      </section>
    </>
  );
}
