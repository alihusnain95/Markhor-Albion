import { Link } from "@tanstack/react-router";
import { ArrowRight, Images, Plane, Search, Compass } from "lucide-react";
import { useState } from "react";
import { WorldMap, type MapArc, type MapPin } from "@/components/world-map";
import { useTravelStats } from "@/components/atlas";
import { DESTINATION_IMAGES, DESTINATION_TAGLINES, HOME_HERO_IMAGE, TILE_IMAGES } from "@/lib/images";
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

export function HomeTop({ dests, plans, trips }: { dests: DestinationWithVisit[]; plans: PlannedTrip[]; trips: Array<{ id: string; title: string; start_date: string | null; end_date: string | null; cities: string[] | null; destination_ids: string[]; notes: string | null }> }) {
  const { stats } = useTravelStats();
  const [q, setQ] = useState("");
  const byId = (id: string | null) => dests.find((d) => d.id === id) ?? null;
  const ordered = plans.filter((p) => p.intended_start).sort((a, b) => (a.intended_start! < b.intended_start! ? -1 : 1));
  const next = ordered[0];
  const recent = [...trips].filter((t) => t.start_date).sort((a, b) => (a.start_date! < b.start_date! ? 1 : -1)).slice(0, 6);
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
      <section className="relative overflow-hidden pt-16">
        <img src={HOME_HERO_IMAGE} alt="Hong Kong skyline at night" width={1920} height={1080} fetchPriority="high" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="container-page relative flex min-h-[78svh] flex-col justify-center py-20 md:min-h-[640px]">
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
          <h1 className="font-serif text-5xl font-normal uppercase leading-[1.02] tracking-tight md:text-7xl lg:text-8xl">
            The world<br /><span className="text-primary">is bigger than</span><br />the life we know
          </h1>
          <p className="mt-5 text-[0.65rem] uppercase tracking-[0.5em] text-muted-foreground">Different places · Different people · A deeper you</p>
          <blockquote className="mt-6 max-w-md border-l-2 border-primary pl-4 font-serif text-lg italic text-foreground/85">
            "Travel isn't just about seeing places, it's about understanding life."
          </blockquote>
        </div>
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
      <section className="container-page mt-3 grid gap-3 lg:grid-cols-[270px_minmax(0,1fr)_270px]">
        <Panel className="p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-[0.2em]">Recent trips</p>
            <Link to="/passport" className="text-xs text-ice">View all</Link>
          </div>
          <p className="mt-2 text-[0.65rem] uppercase tracking-widest text-muted-foreground">Journeys already taken</p>
          {recent.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">Your completed journeys will appear here once trip dates are added.</p>
          ) : (
            <ol className="relative mt-5 space-y-4 border-l border-border pl-5">
              {recent.map((trip) => {
                const d = dests.find((x) => trip.destination_ids.includes(x.id));
                const img = d ? DESTINATION_IMAGES[d.slug] : null;
                return (
                  <li key={trip.id} className="relative flex gap-3">
                    <span className="absolute -left-[1.6rem] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
                    {img ? <img src={img} alt="" loading="lazy" className="h-10 w-14 shrink-0 rounded object-cover" /> : <span className="h-10 w-14 shrink-0 rounded bg-muted" />}
                    <span className="min-w-0 text-xs">
                      <span className="block font-semibold">{trip.title}</span>
                      <span className="mt-0.5 block text-[0.65rem] uppercase text-muted-foreground">{fmtRange(trip.start_date, trip.end_date)}</span>
                      {trip.cities?.length ? <span className="mt-1 block truncate text-muted-foreground">{trip.cities.join(" · ")}</span> : null}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>

        <Panel className="relative overflow-hidden">
          <Link to="/my-world" aria-label="Open the interactive world map">
            <WorldMap destinations={dests} interactive={false} arcs={arcs} pins={pins} className="aspect-[16/10] w-full" />
          </Link>
          <div className="absolute left-4 top-4 rounded-lg border border-border/70 bg-background/85 p-3 text-[0.65rem] backdrop-blur-md">
            <p className="mb-2 font-bold uppercase tracking-[0.16em]">My travel map</p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border-2 border-primary bg-primary/50" />Visited</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border-2 border-planned bg-planned/50" />Upcoming</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border-2 border-muted-foreground/70 bg-unvisited" />Planning</li>
              <li className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-ice bg-transparent" />Needs confirmation</li>
            </ul>
            <div className="relative mt-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search country…" aria-label="Search country" className="w-40 rounded-full border border-border bg-background px-3 py-1.5 pr-7 text-[0.65rem] outline-none focus:border-primary" />
              <Search className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-muted-foreground" />
              {match.length > 0 && <ul className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-border bg-popover text-sm">{match.map((d) => <li key={d.id}><Link to="/destinations/$slug" params={{ slug: d.slug }} className="block px-3 py-2 hover:bg-accent">{d.name}</Link></li>)}</ul>}
            </div>
          </div>
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
