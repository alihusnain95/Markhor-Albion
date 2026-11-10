import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { X, Globe2, MapPin, Compass, Plane, Landmark, Award } from "lucide-react";
import { StatTile, Flag } from "./ui-kit";
import { DESTINATION_IMAGES, DESTINATION_TAGLINES } from "@/lib/images";
import {
  articlesQuery,
  countingQuery,
  destinationsQuery,
  unescoQuery,
  worldWondersQuery,
  tripsQuery,
  TYPE_LABEL,
  type DestinationWithVisit,
} from "@/lib/queries";
import { computeTravelStats } from "@/lib/stats";
import { StatusBadge } from "./status-badge";
import type { MapSelection } from "./world-map";

export function useTravelStats() {
  const dq = useQuery(destinationsQuery);
  const cq = useQuery(countingQuery);
  const uq = useQuery(unescoQuery);
  const wq = useQuery(worldWondersQuery);
  const tq = useQuery(tripsQuery);
  const stats = dq.data ? computeTravelStats(dq.data, cq.data) : null;
  return {
    loading: dq.isLoading,
    error: dq.error,
    stats,
    trips: tq.data?.length ?? 0,
    unescoVisited: uq.data?.filter((s) => s.list_status === "inscribed" && s.status === "visited").length ?? 0,
    unescoTotal: uq.data?.filter((s) => s.list_status === "inscribed").length ?? 0,
    wondersCompleted: wq.data?.filter((w) => w.status === "completed").length ?? 0,
    wondersTotal: wq.data?.length ?? 0,
    counting: cq.data,
  };
}

export function StatsGrid({ compact = false }: { compact?: boolean }) {
  const s = useTravelStats();
  if (s.error) return <p className="text-sm text-destructive">Statistics could not be loaded: {s.error.message}</p>;
  const v = (n: number | undefined) => (s.loading || n === undefined ? "—" : n);
  const ic = "h-4 w-4";
  const tiles = [
    { icon: <Globe2 className={ic} />, value: v(s.stats?.sovereign), label: "Sovereign countries", sub: "UN-style states only" },
    { icon: <MapPin className={ic} />, value: v(s.stats?.destinationsTracked), label: "Destinations tracked", sub: `${s.stats?.constituentAndTerritories ?? "—"} regions · ${s.stats?.otherTracked ?? "—"} disputed` },
    { icon: <Compass className={ic} />, value: v(s.stats?.continents.length), label: "Continents explored" },
    { icon: <Plane className={ic} />, value: v(s.trips), label: "Recorded trips" },
    { icon: <Landmark className={ic} />, value: v(s.unescoVisited), label: "UNESCO sites visited", sub: `of ${s.unescoTotal} recorded` },
    { icon: <Award className={ic} />, value: v(s.wondersCompleted), label: "World wonders", sub: "completed" },
  ];
  return (
    <div>
      <div className={compact ? "grid grid-cols-2 gap-3 sm:grid-cols-3" : "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"}>
        {tiles.map((t) => <StatTile key={t.label} {...t} />)}
      </div>
      <p className="mt-3 text-[0.7rem] leading-relaxed text-muted-foreground">
        Based on recorded data. {s.stats && s.stats.unconfirmedCounts > 0 && `${s.stats.unconfirmedCounts} destinations have no confirmed visit count yet. `}Each destination is counted once.
        {s.counting?.count_uk_via_constituents && " The UK counts once when any constituent country is visited."}
        {s.counting && !s.counting.count_disputed_as_sovereign && " Disputed territories aren't counted as sovereign countries."}
      </p>
    </div>
  );
}

export function DestinationPanel({ selection, onClose }: { selection: MapSelection; onClose: () => void }) {
  const d = selection.destination;
  const all = useQuery(destinationsQuery).data ?? [];
  const articles = useQuery(articlesQuery).data ?? [];
  const children = d ? all.filter((x) => x.parent_id === d.id) : [];
  const related = d ? articles.filter((a) => a.destination_id === d.id) : [];

  return (
    <aside className="rounded-lg border border-border bg-card/95 p-5 shadow-2xl backdrop-blur" aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">{d ? TYPE_LABEL[d.type] : "Destination"}</p>
          <h2 className="mt-2 flex items-center gap-3 font-serif text-2xl">
            {d && <Flag iso2={d.iso2} slug={d.slug} emoji={d.flag} className="h-6 w-9 rounded-sm" />}
            {selection.name}
          </h2>
        </div>
        <button onClick={onClose} aria-label="Close panel" className="p-1 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {!d ? (
        <p className="mt-6 text-sm text-muted-foreground">
          Not yet in the atlas. This destination is shown as not yet visited. It can be added from the admin dashboard.
        </p>
      ) : (
        <>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <StatusBadge status={d.status} />
          </div>
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-xs text-muted-foreground">Recorded visits</dt>
              <dd className="mt-1 font-semibold">{d.visit_count != null ? d.visit_count : d.status === "visited" ? "Count unconfirmed" : "—"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Continent</dt>
              <dd className="mt-1 font-semibold">{d.continent ?? "—"}</dd>
            </div>
            <div className="col-span-2">
              <dt className="text-xs text-muted-foreground">Cities explored</dt>
              <dd className="mt-1">{d.visit?.cities_explored?.length ? d.visit.cities_explored.join(", ") : <span className="text-muted-foreground">None recorded yet</span>}</dd>
            </div>
            {children.length > 0 && (
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Includes</dt>
                <dd className="mt-1 flex flex-wrap gap-2">
                  {children.map((c) => (
                    <Link key={c.id} to="/destinations/$slug" params={{ slug: c.slug }} className="border border-border px-2 py-0.5 text-xs hover:border-primary">
                      {c.name}
                    </Link>
                  ))}
                </dd>
              </div>
            )}
            <div className="col-span-2">
              <dt className="text-xs text-muted-foreground">Articles</dt>
              <dd className="mt-1">{related.length ? related.map((a) => a.title).join(", ") : <span className="text-muted-foreground">No articles yet</span>}</dd>
            </div>
            {d.visit?.personal_notes && (
              <div className="col-span-2">
                <dt className="text-xs text-muted-foreground">Personal notes</dt>
                <dd className="mt-1 text-muted-foreground">{d.visit.personal_notes}</dd>
              </div>
            )}
          </dl>
          {d.status_description && <p className="mt-5 border-l-2 border-primary pl-3 text-xs text-muted-foreground">{d.status_description}</p>}
        </>
      )}
    </aside>
  );
}

export function DestinationCard({ d }: { d: DestinationWithVisit }) {
  return (
    <Link to="/destinations/$slug" params={{ slug: d.slug }} className="group flex flex-col items-center rounded-lg border border-border bg-card p-3 text-center transition-colors hover:border-primary/60">
      <Flag iso2={d.iso2} slug={d.slug} emoji={d.flag} className="h-10 w-14 rounded-sm" />
      <p className="mt-2 truncate text-sm font-semibold group-hover:text-ice">{d.name}</p>
      <p className="text-[0.68rem] text-muted-foreground">
        {d.visit_count != null ? `${d.visit_count} visit${d.visit_count === 1 ? "" : "s"}` : d.status === "visited" ? "Visited" : d.status === "planned" ? "Planned" : "Not yet visited"}
      </p>
    </Link>
  );
}

export function FeaturedDestinationCard({ d }: { d: DestinationWithVisit }) {
  return (
    <Link to="/destinations/$slug" params={{ slug: d.slug }} className="group relative block aspect-[4/3] overflow-hidden rounded-lg border border-border">
      {DESTINATION_IMAGES[d.slug] ? <img src={DESTINATION_IMAGES[d.slug]} alt={d.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" /> : <div className="h-full w-full bg-secondary" />}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-3">
        <p className="font-semibold">{d.name}</p>
        <p className="text-xs text-muted-foreground">{DESTINATION_TAGLINES[d.slug] ?? d.continent}</p>
      </div>
    </Link>
  );
}
