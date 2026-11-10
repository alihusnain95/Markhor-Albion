import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { DestinationCard } from "@/components/atlas";
import { LoadingRows, PageHeader } from "@/components/status-badge";
import { destinationsQuery } from "@/lib/queries";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/destinations/")({
  head: () => ({
    meta: [
      { title: "Destinations | Markhor Albion" },
      { name: "description", content: "Every destination in the Markhor Albion atlas, including separately flagged territories and special regions." },
      { property: "og:title", content: "Destinations | Markhor Albion" },
      { property: "og:description", content: "Browse every tracked destination and its visit status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Destinations,
});

function Destinations() {
  const { data = [], isLoading } = useQuery(destinationsQuery);
  const [q, setQ] = useState("");
  const list = data.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader eyebrow="Destinations" title="Every separately flagged destination, counted individually." />
      <section className="container-page py-12">
        <div className="mb-8 flex flex-wrap gap-3">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="max-w-xs rounded-none" aria-label="Search destinations" />
     </div>
        {isLoading ? <LoadingRows /> : (
          <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
            {list.map((d) => <DestinationCard key={d.id} d={d} />)}
          </div>
        )}
      </section>
    </>
  );
}
