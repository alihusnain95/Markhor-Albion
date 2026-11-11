import { useMemo, useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, MapPin, Play, X } from "lucide-react";
import { destinationsQuery, mediaQuery, type MediaItem } from "@/lib/queries";
import { youtubeThumb } from "@/lib/media";
import { EmptyState } from "@/components/status-badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Photographs & Films | Markhor Albion" },
      { name: "description", content: "Photographs and travel films from the Markhor Albion journey, organised by album and country." },
      { property: "og:title", content: "Gallery — Photographs & Films | Markhor Albion" },
      { property: "og:description", content: "Photographs and travel films from the journey, organised by album and country." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Gallery,
});

function thumbOf(m: MediaItem) {
  if (m.kind === "photo") return m.url;
  return m.thumbnail_url || (m.kind === "embed" ? youtubeThumb(m.url) : null);
}

function Gallery() {
  const { data: media = [], isLoading } = useQuery(mediaQuery);
  const { data: dests = [] } = useQuery(destinationsQuery);
  const [category, setCategory] = useState("all");
  const [album, setAlbum] = useState("all");
  const [country, setCountry] = useState("all");
  const [kind, setKind] = useState("all");
  const [open, setOpen] = useState<number | null>(null);

  const albums = useMemo(() => [...new Set(media.map((m) => m.album).filter(Boolean) as string[])].sort(), [media]);
  const countries = useMemo(() => dests.filter((d) => media.some((m) => m.destination_id === d.id)), [dests, media]);
  const categories = ["Polo", "Golf", "Horse Races", "Dancing", "Squash", "Motorcycling", "Equestrian", "Festivals"];
  const list = media.filter((m) =>
    (category === "all" || (m.album ?? "").toLowerCase() === category.toLowerCase()) &&
    (album === "all" || m.album === album) &&
    (country === "all" || m.destination_id === country) &&
    (kind === "all" || (kind === "photo" ? m.kind === "photo" : m.kind !== "photo")));
  const featured = media.find((m) => m.is_featured && m.kind === "photo");
  const destName = (id: string | null) => dests.find((d) => d.id === id)?.name;

  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % list.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i - 1 + list.length) % list.length));
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, list.length]);

  const cur = open !== null ? list[open] : null;
  const pill = (active: boolean) => `rounded-full border px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${active ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"}`;

  return (
    <div className="pb-24 pt-28">
      <section className="container-page">
        <p className="eyebrow">Gallery</p>
        <h1 className="mt-3 font-serif text-4xl font-light md:text-6xl">Photographs &amp; films</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">Moments from the road — organised by album and country.</p>
      </section>

      {featured && (
        <section className="container-page mt-10">
          <button onClick={() => setOpen(list.indexOf(featured) >= 0 ? list.indexOf(featured) : null)} className="group relative block aspect-[21/9] w-full overflow-hidden rounded-xl border border-border">
            <img src={featured.url} alt={featured.alt_text ?? featured.caption ?? ""} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <span className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
            <span className="absolute bottom-6 left-6 text-left">
              <span className="text-[0.6rem] uppercase tracking-[0.4em] text-ice">Featured</span>
              {featured.caption && <span className="mt-1 block font-serif text-2xl md:text-3xl">{featured.caption}</span>}
              {(featured.location || destName(featured.destination_id)) && <span className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{[featured.place, featured.location, destName(featured.destination_id)].filter(Boolean).join(" · ")}</span>}
            </span>
          </button>
        </section>
      )}

      <section className="container-page mt-10 space-y-4">
        <div className="flex flex-wrap items-center gap-2" aria-label="Beyond Travel categories">
          <button className={pill(category === "all")} onClick={() => { setCategory("all"); setAlbum("all"); }}>All</button>
          {categories.map((c) => <button key={c} className={pill(category === c)} onClick={() => { setCategory(c); setAlbum("all"); }}>{c}</button>)}
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <button className={pill(album === "all")} onClick={() => setAlbum("all")}>All albums</button>
        {albums.map((a) => <button key={a} className={pill(album === a)} onClick={() => setAlbum(a)}>{a}</button>)}
        <span className="mx-2 hidden h-5 w-px bg-border sm:block" />
        <select aria-label="Filter by country" value={country} onChange={(e) => setCountry(e.target.value)} className="h-9 rounded-full border border-border bg-background px-4 text-xs">
          <option value="all">All countries</option>
          {countries.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select aria-label="Filter by type" value={kind} onChange={(e) => setKind(e.target.value)} className="h-9 rounded-full border border-border bg-background px-4 text-xs">
          <option value="all">Photos &amp; videos</option><option value="photo">Photos</option><option value="video">Videos</option>
        </select>
        </div>
      </section>

      <section className="container-page mt-8">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : list.length === 0 ? (
          <EmptyState title={media.length ? "Nothing matches these filters." : "The gallery is being curated."} body={media.length ? "Try another album or country." : "Photographs and films will appear here once they're added from the admin dashboard."} />
        ) : (
          <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
            {list.map((m, i) => {
              const t = thumbOf(m);
              return (
                <button key={m.id} onClick={() => setOpen(i)} className="group relative block w-full break-inside-avoid overflow-hidden rounded-lg border border-border bg-card text-left">
                  {t ? <img src={t} alt={m.alt_text ?? m.caption ?? ""} loading="lazy" decoding="async" className="w-full transition-transform duration-500 group-hover:scale-105" />
                    : <span className="flex aspect-video items-center justify-center bg-muted text-muted-foreground"><Play className="h-8 w-8" /></span>}
                  {m.kind !== "photo" && <span className="absolute right-2 top-2 rounded-full bg-background/80 p-1.5"><Play className="h-3.5 w-3.5 text-primary" /></span>}
                  {(m.caption || m.location) && (
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
                      {m.caption && <span className="block text-sm font-semibold">{m.caption}</span>}
                      {m.location && <span className="block text-xs text-muted-foreground">{m.location}</span>}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={!!cur} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-5xl border-border bg-background p-0 [&>button]:hidden">
          {cur && (
            <div>
              <DialogTitle className="sr-only">{cur.caption ?? "Gallery item"}</DialogTitle>
              <div className="relative flex max-h-[75vh] items-center justify-center bg-card">
                {cur.kind === "photo" && <img src={cur.url} alt={cur.alt_text ?? cur.caption ?? ""} className="max-h-[75vh] w-auto object-contain" />}
                {cur.kind === "video" && <video src={cur.url} controls playsInline className="max-h-[75vh] w-full" />}
                {cur.kind === "embed" && <iframe src={cur.url} title={cur.caption ?? "Video"} className="aspect-video w-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowFullScreen />}
                {list.length > 1 && <>
                  <button aria-label="Previous" onClick={() => setOpen((open! - 1 + list.length) % list.length)} className="absolute left-2 rounded-full bg-background/80 p-2 hover:text-primary"><ChevronLeft className="h-5 w-5" /></button>
                  <button aria-label="Next" onClick={() => setOpen((open! + 1) % list.length)} className="absolute right-2 rounded-full bg-background/80 p-2 hover:text-primary"><ChevronRight className="h-5 w-5" /></button>
                </>}
                <button aria-label="Close" onClick={() => setOpen(null)} className="absolute right-2 top-2 rounded-full bg-background/80 p-2"><X className="h-4 w-4" /></button>
              </div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 p-4">
                <div>
                  {cur.caption && <p className="font-serif text-xl">{cur.caption}</p>}
                  <p className="text-xs text-muted-foreground">{[cur.place, cur.location].filter(Boolean).join(" · ")}{cur.album && ` · ${cur.album}`}</p>
                </div>
                {cur.destination_id && (() => { const d = dests.find((x) => x.id === cur.destination_id); return d ? <Link to="/destinations/$slug" params={{ slug: d.slug }} className="text-xs text-ice">{d.name} →</Link> : null; })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
