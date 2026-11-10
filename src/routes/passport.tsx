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
      { name: "description", content: "A chronological record of journeys, dates, destinations and places explored." },
      { property: "og:title", content: "My Travel Passport — Markhor Albion" },
      { property: "og:description", content: "Every journey and destination in one chronological travel record." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Passport,
});

function monthYear(date: string | null) {
  if (!date) return "Date to be confirmed";
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function dateRange(start: string | null, end: string | null) {
  if (!start) return "Dates to be confirmed";
  const fmt = (value: string) => new Date(value + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  return end && end !== start ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function Passport() {
  const { data: dests = [] } = useQuery(destinationsQuery);
  const { data: trips = [], isLoading } = useQuery(tripsQuery);
  const [q, setQ] = useState("");

  const timeline = useMemo(() => {
    const matching = trips
      .filter((trip) => {
        const names = trip.destination_ids.map((id) => dests.find((d) => d.id === id)?.name ?? "").join(" ");
        return `${trip.title} ${trip.cities.join(" ")} ${names}`.toLowerCase().includes(q.trim().toLowerCase());
      })
      .sort((a, b) => (b.start_date ?? "").localeCompare(a.start_date ?? ""));
    const groups = new Map<string, typeof matching>();
    for (const trip of matching) {
      const key = monthYear(trip.start_date);
      groups.set(key, [...(groups.get(key) ?? []), trip]);
    }
    return [...groups.entries()];
  }, [trips, dests, q]);

  return (
    <>
      <PageTitle title="Travel Timeline" intro="A living record of the journeys, places and experiences that have shaped my world — newest journeys first." />
      <section className="container-page space-y-6 pb-12">
        <StatsGrid compact />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">The journey so far</p>
            <h2 className="mt-1 font-serif text-2xl">A life in journeys</h2>
          </div>
          <SearchBox value={q} onChange={setQ} placeholder="Search trips or places…" className="w-full sm:max-w-xs" />
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading your journey history…</div>
        ) : timeline.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Search className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 font-semibold">No journeys found</p>
            <p className="mt-1 text-sm text-muted-foreground">Recorded trips will appear here, grouped by month and year. Add journeys with dates and destinations in the admin dashboard.</p>
          </div>
        ) : (
          <div className="space-y-9">
            {timeline.map(([period, entries]) => (
              <section key={period} className="relative">
                <div className="mb-4 flex items-center gap-3">
                  <span className="h-px flex-1 bg-border" />
                  <h3 className="shrink-0 text-xs font-bold uppercase tracking-[0.24em] text-primary">{period}</h3>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {entries.map((trip) => {
                    const places = trip.destination_ids.map((id) => dests.find((d) => d.id === id)).filter((d): d is (typeof dests)[number] => Boolean(d));
                    const lead = places[0];
                    const image = lead ? DESTINATION_IMAGES[lead.slug] : undefined;
                    const placeNames = trip.cities.length ? trip.cities.join(" · ") : places.map((d) => d.name).join(" · ");
                    return (
                      <article key={trip.id} className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/60">
                        <div className="relative aspect-[16/9] bg-gradient-to-br from-secondary to-background">
                          {image && <img src={image} alt={lead?.name ?? trip.title} loading="lazy" className="h-full w-full object-cover" />}
                        </div>
                        <div className="p-4">
                          <p className="font-semibold">{trip.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{dateRange(trip.start_date, trip.end_date)}</p>
                          <span className="mt-3 inline-block rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[0.68rem] font-semibold text-primary">Visited</span>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            {places.map((place) => (
                              <span key={place.id} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/50 px-2 py-1 text-xs">
                                <Flag iso2={place.iso2} slug={place.slug} emoji={place.flag} className="h-3.5 w-5 rounded-[2px]" />
                                {place.name}
                              </span>
                            ))}
                          </div>
                          {placeNames && <p className="mt-3 text-sm text-muted-foreground">{placeNames}</p>}
                          {trip.notes && <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{trip.notes}</p>}
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
