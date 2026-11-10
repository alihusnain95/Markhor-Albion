import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DestinationCard, StatsGrid } from "@/components/atlas";
import { Chips, Flag, PageTitle, SearchBox, Select } from "@/components/ui-kit";
import { destinationsQuery, tripsQuery, TYPE_LABEL, STATUS_LABEL } from "@/lib/queries";

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

function Passport() {
  const { data: dests = [] } = useQuery(destinationsQuery);
  const { data: trips = [] } = useQuery(tripsQuery);
  const [continent, setContinent] = useState("all");
  const [status, setStatus] = useState("visited");
  const [type, setType] = useState("all");
  const [visits, setVisits] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("name");

  const continents = [...new Set(dests.map((d) => d.continent).filter(Boolean))].sort() as string[];
  const filtered = useMemo(() => {
    const list = dests.filter(
      (d) =>
        (continent === "all" || d.continent === continent) &&
        (status === "all" || d.status === status) &&
        (type === "all" || d.type === type) &&
        d.name.toLowerCase().includes(q.toLowerCase()) &&
        (visits === "all" || (visits === "unconfirmed" && d.visit_count == null) || (visits === "multi" && (d.visit_count ?? 0) >= 2) || (visits === "five" && (d.visit_count ?? 0) >= 5)),
    );
    return sort === "visits" ? [...list].sort((a, b) => (b.visit_count ?? -1) - (a.visit_count ?? -1)) : list;
  }, [dests, continent, status, type, visits, q, sort]);

  return (
    <>
      <PageTitle title="Travel Timeline" intro="A chronological record of the journeys I have taken, with dates, destinations and places explored." />
      <div className="container-page grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <StatsGrid compact />
          <Chips value={continent} onChange={setContinent} options={[{ value: "all", label: "All" }, ...continents.map((c) => ({ value: c, label: c }))]} />
          <div className="flex flex-wrap gap-2">
            <SearchBox value={q} onChange={setQ} placeholder="Search countries…" className="min-w-[200px] flex-1" />
            <Select label="Visit status" value={status} onChange={setStatus}>
              <option value="all">Any status</option>
              {["visited", "planned", "not_visited", "needs_confirmation"].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </Select>
            <Select label="Destination type" value={type} onChange={setType}>
              <option value="all">All types</option>
              {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select label="Number of visits" value={visits} onChange={setVisits}>
              <option value="all">Any visits</option><option value="multi">2+ visits</option><option value="five">5+ visits</option><option value="unconfirmed">Count unconfirmed</option>
            </Select>
            <Select label="Sort" value={sort} onChange={setSort}><option value="name">Sort by name</option><option value="visits">Sort by visits</option></Select>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} destinations</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {filtered.map((d) => <DestinationCard key={d.id} d={d} />)}
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20">
          <h2 className="font-serif text-xl">Journey History</h2>
          {trips.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">No journeys recorded yet. Add journeys with dates and places from the admin dashboard. Repeat visits can be recorded separately.</p>
          ) : (
            <ol className="mt-5 space-y-5">
              {trips.map((t) => {
                const first = dests.find((d) => d.id === t.destination_ids[0]);
                return (
                  <li key={t.id} className="grid grid-cols-[2.75rem_1.75rem_1fr] items-start gap-2">
                    <span className="pt-0.5 text-xs font-semibold tabular-nums text-muted-foreground">{t.start_date?.slice(0, 4) ?? "—"}</span>
                    {first ? <Flag iso2={first.iso2} slug={first.slug} emoji={first.flag} className="mt-0.5 h-5 w-7 rounded-[2px]" /> : <span />}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{t.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.cities.join(", ") || t.destination_ids.map((id) => dests.find((d) => d.id === id)?.name).filter(Boolean).join(", ")}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </aside>
      </div>
    </>
  );
}
