import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { WorldMap, MapLegend } from "@/components/world-map";
import { DestinationCard, StatsGrid } from "@/components/atlas";
import { Chips, Flag, PageTitle, SearchBox } from "@/components/ui-kit";
import { destinationsQuery } from "@/lib/queries";

export const Route = createFileRoute("/my-world")({
  head: () => ({
    meta: [
      { title: "My World — Interactive Travel Atlas | Markhor Albion" },
      { name: "description", content: "An interactive world map of every destination visited, planned and still to explore." },
      { property: "og:title", content: "My World — Interactive Travel Atlas" },
      { property: "og:description", content: "Explore the map of destinations visited by Markhor Albion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyWorld,
});

function MyWorld() {
  const { data: dests = [], isLoading, error } = useQuery(destinationsQuery);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "visited" | "planned" | "not_visited">("all");

  const matches = useMemo(
    () => (q.trim() ? dests.filter((d) => d.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6) : []),
    [q, dests],
  );

  const choose = (slug: string) => {
    const d = dests.find((x) => x.slug === slug);
    if (!d) return;
    setQ("");
    navigate({ to: "/destinations/$slug", params: { slug: d.slug } });
  };

  const shown = (filter === "all" ? dests : dests.filter((d) => d.status === filter)).filter((d) => d.type !== "other");

  return (
    <>
      <PageTitle title="My World" intro="An interactive map of the places I have explored." />
      <section className="container-page">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-md">
            <SearchBox value={q} onChange={setQ} placeholder="Search for a country or destination…" />
            {matches.length > 0 && (
              <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border bg-popover">
                {matches.map((d) => (
                  <li key={d.id}>
                    <button onClick={() => choose(d.slug)} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent">
                      <Flag iso2={d.iso2} slug={d.slug} emoji={d.flag} className="h-3.5 w-5 rounded-[2px]" />{d.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Chips value={filter} onChange={setFilter} options={[{ value: "all", label: "All" }, { value: "visited", label: "Visited" }, { value: "planned", label: "Planned" }, { value: "not_visited", label: "Not visited" }]} />
        </div>
        {error && <p className="mt-3 text-sm text-destructive">The atlas data could not be loaded: {error.message}</p>}
        <div className="relative mt-4 overflow-hidden rounded-xl border border-border">
          <WorldMap destinations={shown} onSelect={(s) => { if (s.destination) navigate({ to: "/destinations/$slug", params: { slug: s.destination.slug } }); }} className="aspect-[4/3] w-full sm:aspect-[2/1]" />
          {isLoading && <p className="absolute left-4 top-4 text-xs text-muted-foreground">Loading destinations…</p>}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <MapLegend />
          <a href="#list-heading" className="rounded-md border border-border px-3 py-1.5 text-xs hover:border-primary">View as list</a>
        </div>
      </section>

      <section className="container-page py-16">
        <StatsGrid />
      </section>

      <section className="container-page py-10" aria-labelledby="list-heading">
        <h2 id="list-heading" className="font-serif text-3xl font-light">Explore destinations</h2>
        <p className="mt-2 text-sm text-muted-foreground">Select a flag to open that destination and explore its cities, photos and stories.</p>
        <div className="mt-8 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {shown.map((d) => <DestinationCard key={d.id} d={d} />)}
        </div>
      </section>
    </>
  );
}
