import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { EmptyState, LoadingRows } from "@/components/status-badge";
import { Chips, PageTitle } from "@/components/ui-kit";
import { destinationsQuery, publicPlansQuery } from "@/lib/queries";
import { daysUntil } from "@/lib/stats";
import { DESTINATION_IMAGES } from "@/lib/images";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/next-adventure")({
  head: () => ({
    meta: [
      { title: "My Next Adventure | Markhor Albion" },
      { name: "description", content: "Future destinations, travel ambitions and plans in the making." },
      { property: "og:title", content: "My Next Adventure | Markhor Albion" },
      { property: "og:description", content: "Where Markhor Albion is heading next." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Next,
});

const PLAN_LABEL: Record<string, string> = { dreaming: "Dreaming", researching: "Researching", planned: "Planned", booked: "Booked", completed: "Completed" };
const fmt = (d: string | null) => (d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : null);

function Next() {
  const { data = [], isLoading } = useQuery(publicPlansQuery);
  const dests = useQuery(destinationsQuery).data ?? [];
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState("all");
  const list = data.filter((p) => status === "all" || p.status === status);

  return (
    <>
      <PageTitle
        title="My Next Adventure"
        intro="Future destinations, travel plans and planned new horizons. Plans never count as completed visits."
        action={isAdmin ? <Link to="/admin" className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"><Plus className="h-4 w-4" />Add new trip</Link> : undefined}
      />
      <section className="container-page pb-10">
        <Chips value={status} onChange={setStatus} options={[{ value: "all", label: "All" }, ...Object.entries(PLAN_LABEL).slice(0, 4).map(([v, l]) => ({ value: v, label: l }))]} />
        <div className="mt-6">
          {isLoading ? <LoadingRows /> : list.length === 0 ? (
            <EmptyState title="No published plans yet." body="Future trips are drafted privately in the admin dashboard and appear here only when published." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => {
                const d = dests.find((x) => x.id === p.destination_id);
                const days = daysUntil(p.intended_start);
                const img = d ? DESTINATION_IMAGES[d.slug] : undefined;
                return (
                  <div key={p.id} className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="relative aspect-[16/9]">
                      {img ? <img src={img} alt={d?.name ?? "Upcoming destination"} loading="lazy" className="h-full w-full object-cover" /> : <div className="h-full w-full bg-gradient-to-br from-secondary to-background" />}
                      {days && <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 text-xs text-ice backdrop-blur">{days} days to go</span>}
                    </div>
                    <div className="p-4">
                      <p className="font-semibold">{d?.name ?? "Upcoming destination"}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{d?.name}{p.intended_start && ` · ${fmt(p.intended_start)}`}{p.intended_end && ` – ${fmt(p.intended_end)}`}</p>
                      <span className="mt-3 inline-block rounded-full border border-planned/50 bg-planned/20 px-2.5 py-0.5 text-[0.68rem] font-semibold text-planned">{PLAN_LABEL[p.status]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
