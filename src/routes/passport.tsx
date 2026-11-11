import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { StatsGrid } from "@/components/atlas";
import { Flag, PageTitle, SearchBox } from "@/components/ui-kit";
import { destinationsQuery, tripsQuery } from "@/lib/queries";
import { DESTINATION_IMAGES } from "@/lib/images";

export const Route = createFileRoute("/passport")({
  head: () => ({
    meta: [
      { title: "Travel Timeline | Markhor Albion" },
      { name: "description", content: "A chronological record of every country and destination travelled." },
      { property: "og:title", content: "My Travel Timeline — Markhor Albion" },
      { property: "og:description", content: "Every journey and destination in chronological order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Passport,
});

function dateLabel(start: string | null, end: string | null) {
  if (!start) return "DATE TO BE CONFIRMED";
  const fmt = (v: string) => new Date(v + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  return end && end !== start ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function Passport() {
  const { data: dests = [] } = useQuery(destinationsQuery);
  const { data: trips = [], isLoading } = useQuery(tripsQuery);
  const [q, setQ] = useState("");

  const entries = useMemo(() => trips
    .flatMap((trip) => trip.destination_ids.map((id, index) => {
      const destination = dests.find((d) => d.id === id);
      return destination ? { key: `${trip.id}-${id}-${index}`, trip, destination } : null;
    }))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .filter(({ trip, destination }) => `${trip.title} ${destination.name} ${(trip.cities ?? []).join(" ")}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => (a.trip.start_date ?? "9999").localeCompare(b.trip.start_date ?? "")),
  [trips, dests, q]);

  return (
    <>
      <PageTitle title="Travel Timeline" intro="Every country and destination travelled, in the order the journeys happened." />
      <section className="container-page space-y-6 pb-12">
        <StatsGrid compact />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">The journey so far</p>
            <h2 className="mt-1 font-serif text-2xl">Countries travelled</h2>
          </div>
          <SearchBox value={q} onChange={setQ} placeholder="Search countries or trips…" className="w-full sm:max-w-xs" />
        </div>
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading your journey history…</div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Search className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 font-semibold">No recorded country journeys found</p>
            <p className="mt-1 text-sm text-muted-foreground">Add trip dates and destinations in the admin dashboard to build the chronological timeline.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/80 p-5">
            <ol className="relative space-y-5 border-l border-border pl-5">
              {entries.map(({ key, trip, destination }) => {
                const image = DESTINATION_IMAGES[destination.slug];
                return (
                  <li key={key} className="relative flex items-center gap-3">
                    <span className="absolute -left-[1.6rem] top-2 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
                    <span className="w-28 shrink-0 text-[0.65rem] uppercase leading-tight tracking-wide text-muted-foreground">{dateLabel(trip.start_date, trip.end_date)}</span>
                    {image ? <img src={image} alt="" loading="lazy" className="h-10 w-14 shrink-0 rounded object-cover" /> : <span className="h-10 w-14 shrink-0 rounded bg-muted" />}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold">
                        <Flag iso2={destination.iso2} slug={destination.slug} emoji={destination.flag} className="h-3.5 w-5 rounded-[2px]" />
                        {destination.name}
                      </span>
                      <span className="mt-0.5 block text-[0.65rem] text-muted-foreground">{trip.title}{trip.cities?.length ? ` · ${trip.cities.join(" · ")}` : ""}</span>
                    </span>
                    <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[0.65rem] font-semibold text-primary">Visited</span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </section>
    </>
  );
}
