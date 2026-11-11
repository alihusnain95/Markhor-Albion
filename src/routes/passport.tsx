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
  if (!start) return "DATE NOT RECORDED";
  const fmt = (v: string) => new Date(v + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  return end && end !== start ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}

function Passport() {
  const { data: dests = [], isLoading: destinationsLoading } = useQuery(destinationsQuery);
  const { data: trips = [], isLoading: tripsLoading } = useQuery(tripsQuery);
  const [q, setQ] = useState("");

  const entries = useMemo(() => dests
    .filter((destination) => destination.status === "visited" && destination.type !== "other")
    .map((destination) => {
      const related = trips
        .filter((trip) => trip.destination_ids.includes(destination.id) && trip.start_date)
        .sort((a, b) => (a.start_date ?? "").localeCompare(b.start_date ?? ""));
      const firstTrip = related[0];
      const latestTrip = related[related.length - 1];
      return {
        destination,
        firstDate: firstTrip?.start_date ?? null,
        lastDate: latestTrip?.end_date ?? latestTrip?.start_date ?? null,
        tripTitle: firstTrip?.title ?? null,
        cities: destination.visit?.cities_explored ?? [],
        image: DESTINATION_IMAGES[destination.slug],
      };
    })
    .filter((entry) => `${entry.destination.name} ${entry.cities.join(" ")} ${entry.tripTitle ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => {
      if (a.firstDate && b.firstDate) return a.firstDate.localeCompare(b.firstDate);
      if (a.firstDate) return -1;
      if (b.firstDate) return 1;
      return a.destination.name.localeCompare(b.destination.name);
    }),
  [dests, trips, q]);

  const isLoading = destinationsLoading || tripsLoading;

  return (
    <>
      <PageTitle title="Travel Timeline" intro="Every country travelled, from the earliest recorded journey to the latest — all in one place." />
      <section className="container-page space-y-6 pb-12">
        <StatsGrid compact />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">The journey so far</p>
            <h2 className="mt-1 font-serif text-2xl">All countries travelled</h2>
            <p className="mt-1 text-xs text-muted-foreground">{entries.length} visited destinations recorded</p>
          </div>
          <SearchBox value={q} onChange={setQ} placeholder="Search countries or cities…" className="w-full sm:max-w-xs" />
        </div>
        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading your complete travel history…</div>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <Search className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-3 font-semibold">No visited countries found</p>
            <p className="mt-1 text-sm text-muted-foreground">Mark destinations as visited in your travel atlas to include them here.</p>
          </div>
        ) : (
          <div className="max-h-[72vh] overflow-y-auto overscroll-contain rounded-xl border border-border bg-card/80 p-4 pr-2 sm:p-5">
            <ol className="relative space-y-4 border-l border-border pl-4 sm:pl-5">
              {entries.map(({ destination, firstDate, lastDate, tripTitle, cities, image }) => (
                <li key={destination.id} className="relative flex min-w-0 items-center gap-2.5 pr-2 sm:gap-4">
                  <span className="absolute -left-[1.38rem] top-3 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background sm:-left-[1.6rem]" />
                  <span className="w-[5.5rem] shrink-0 text-[0.6rem] uppercase leading-tight tracking-wide text-muted-foreground sm:w-28 sm:text-[0.65rem]">{dateLabel(firstDate, lastDate)}</span>
                  {image ? <img src={image} alt="" loading="lazy" className="h-9 w-12 shrink-0 rounded object-cover sm:h-10 sm:w-14" /> : <span className="h-9 w-12 shrink-0 rounded bg-muted sm:h-10 sm:w-14" />}
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 items-center gap-2 text-xs font-semibold sm:text-sm">
                      <Flag iso2={destination.iso2} slug={destination.slug} emoji={destination.flag} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                      <span className="truncate">{destination.name}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[0.62rem] text-muted-foreground sm:text-[0.68rem]">{tripTitle ?? "Travel date not linked to a recorded trip"}{cities.length ? ` · ${cities.join(" · ")}` : ""}</span>
                  </span>
                  <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-2 py-1 text-[0.6rem] font-semibold text-primary sm:px-2.5 sm:text-[0.65rem]">Visited</span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Countries with recorded trip dates are shown in chronological order. Visited countries without linked trip dates are included at the end; their exact historical position needs a travel date to be recorded.</p>
      </section>
    </>
  );
}
