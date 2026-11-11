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

  const entries = useMemo(() => {
    const visited = dests.filter((destination) => destination.status === "visited" && destination.type !== "other");
    const rows = visited.flatMap((destination) => {
      const linkedTrips = trips.filter((trip) => trip.destination_ids.includes(destination.id));
      const tripRows = linkedTrips.map((trip) => ({
        destination,
        firstDate: trip.start_date,
        lastDate: trip.end_date ?? trip.start_date,
        tripTitle: trip.title,
        cities: trip.cities,
        image: DESTINATION_IMAGES[destination.slug],
        key: `${destination.id}-${trip.id}`,
      }));
      // Historical visits recorded directly while the full country profile retains all cities.
      const historicalVisits = destination.slug === "poland" ? [
        { date: "2023-06-01", label: "June 2023", cities: ["Rzeszów"] },
        { date: "2022-07-01", label: "July 2022", cities: ["Warsaw"] },
        { date: "2022-05-01", label: "May 2022", cities: ["Warsaw"] },
        { date: "2020-01-01", label: "2020", cities: ["Kraków", "Zakopane"] },
        { date: "2015-01-01", label: "2015", cities: ["Kraków", "Katowice"] },
      ] : destination.slug === "colombia" ? [
        { date: "2024-09-01", label: "September 2024", cities: ["Guatapé"] },
      ] : destination.slug === "cyprus" ? [
        { date: "2025-05-01", label: "May 2025", cities: ["Nicosia"] },
      ] : destination.slug === "ukraine" ? [
        { date: "2026-04-01", label: "April 2026", cities: ["Kyiv", "Lviv", "Rivne"] },
      ] : destination.slug === "belarus" ? [
        { date: "2025-09-01", label: "September 2025", cities: ["Minsk"] },
      ] : destination.slug === "lithuania" ? [
        { date: "2025-09-01", label: "September 2025", cities: ["Vilnius"] },
      ] : destination.slug === "latvia" ? [
        { date: "2023-03-01", label: "March 2023", cities: ["Riga"] },
      ] : destination.slug === "estonia" ? [
        { date: "2025-02-01", label: "February 2025", cities: ["Tallinn"] },
      ] : destination.slug === "isle-of-man" ? [
        { date: "2016-04-01", label: "April 2016", cities: [] },
      ] : destination.slug === "finland" ? [
        { date: "2025-02-01", label: "February 2025", cities: ["Helsinki"] },
      ] : [];
      const historicalRows = historicalVisits
        .filter((visit) => !linkedTrips.some((trip) =>
          trip.start_date?.slice(0, visit.label.length === 4 ? 4 : 7) === visit.date.slice(0, visit.label.length === 4 ? 4 : 7) &&
          visit.cities.every((city) => trip.cities.some((tripCity) => tripCity.toLowerCase() === city.toLowerCase()))
        ))
        .map((visit) => ({
          destination,
          firstDate: visit.date,
          lastDate: null,
          tripTitle: null,
          cities: visit.cities,
          image: DESTINATION_IMAGES[destination.slug],
          key: `${destination.id}-historical-${visit.date}`,
          dateOverride: visit.label,
        }));
      if (historicalVisits.length) return [...tripRows, ...historicalRows];
      return tripRows.length ? tripRows : [{
        destination, firstDate: null, lastDate: null, tripTitle: null,
        cities: [] as string[], image: DESTINATION_IMAGES[destination.slug],
        key: destination.id,
      }];
    });
    return rows
      .filter((entry) => `${entry.destination.name} ${entry.cities.join(" ")} ${entry.tripTitle ?? ""}`.toLowerCase().includes(q.trim().toLowerCase()))
      .sort((a, b) => {
        if (a.firstDate && b.firstDate) return b.firstDate.localeCompare(a.firstDate);
        if (a.firstDate) return -1;
        if (b.firstDate) return 1;
        return a.destination.name.localeCompare(b.destination.name);
      });
  }, [dests, trips, q]);

  const isLoading = destinationsLoading || tripsLoading;

  return (
    <>
      <PageTitle title="Travel Timeline" intro="Every country travelled, with your latest journeys first — all in one place." />
      <section className="container-page space-y-6 pb-12">
        <StatsGrid compact />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">The journey so far</p>
            <h2 className="mt-1 font-serif text-2xl">All countries travelled</h2>
            <p className="mt-1 text-xs text-muted-foreground">{entries.length} travel entries recorded</p>
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
            <ol className="relative space-y-3 border-l border-border pl-4 sm:space-y-4 sm:pl-5">
              {entries.map(({ destination, firstDate, lastDate, tripTitle, cities, image, key, ...rest }) => (
                <li key={key} className="relative flex min-w-0 items-center gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/40 sm:gap-4 sm:px-3">
                  <span className="absolute -left-[1.38rem] top-5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background sm:-left-[1.6rem]" />
                  <span className="w-[5.25rem] shrink-0 text-[0.6rem] font-medium uppercase leading-tight tracking-wide text-muted-foreground sm:w-28 sm:text-[0.65rem]">{"dateOverride" in rest && rest.dateOverride ? rest.dateOverride.toUpperCase() : dateLabel(firstDate, lastDate)}</span>
                  {image ? <img src={image} alt="" loading="lazy" className="h-10 w-14 shrink-0 rounded-md object-cover sm:h-12 sm:w-16" /> : <span className="h-10 w-14 shrink-0 rounded-md bg-muted sm:h-12 sm:w-16" />}
                  <span className="min-w-0 flex-1">
                    <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <Flag iso2={destination.iso2} slug={destination.slug} emoji={destination.flag} className="h-3.5 w-5 shrink-0 rounded-[2px]" />
                      <span className="text-sm font-semibold text-foreground sm:text-base">{destination.name}</span>
                      {cities.length > 0 && (
                        <>
                          <span className="text-muted-foreground/60">·</span>
                          <span className="text-xs text-muted-foreground sm:text-sm">{cities.join(" · ")}</span>
                        </>
                      )}
                    </span>
                    {tripTitle && <span className="mt-1 block truncate text-[0.65rem] text-muted-foreground/80 sm:text-xs">{tripTitle}</span>}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
        <p className="text-xs text-muted-foreground">Latest recorded journeys appear first. Visited countries without linked trip dates are included after dated entries.</p>
      </section>
    </>
  );
}
