import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LoadingRows, PageHeader, StatusBadge } from "@/components/status-badge";
import { worldWondersQuery } from "@/lib/queries";

export const Route = createFileRoute("/wonders")({
  head: () => ({
    meta: [
      { title: "World Wonders & Extraordinary Experiences | Markhor Albion" },
      { name: "description", content: "A checklist of the New Seven Wonders, the Ancient Wonders and other extraordinary places." },
      { property: "og:title", content: "World Wonders | Markhor Albion" },
      { property: "og:description", content: "The great checklist of wonders and extraordinary experiences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Wonders,
});

function Wonders() {
  const { data = [], isLoading } = useQuery(worldWondersQuery);
  const categories = [...new Set(data.map((w) => w.category))];
  const done = data.filter((w) => w.status === "completed").length;
  return (
    <>
      <PageHeader eyebrow="Wonders" title="The extraordinary, checked off one by one." intro="A wonder is marked completed only when it has been recorded individually — visiting its country is not enough. New categories and personal achievements can be added at any time." />
      <section className="container-page py-12">
        <p className="text-sm text-muted-foreground"><span className="font-serif text-4xl text-foreground">{done}</span> of {data.length} completed</p>
        {isLoading ? <div className="mt-8"><LoadingRows /></div> : categories.map((c) => (
          <div key={c} className="mt-14">
            <h2 className="mb-4 font-serif text-3xl font-light">{c}</h2>
            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {data.filter((w) => w.category === c).map((w) => (
                <div key={w.id} className="bg-background p-6">
                  <StatusBadge status={w.status} />
                  <p className="mt-4 font-serif text-xl">{w.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{w.location}</p>
                  {w.verified_facts && <p className="mt-3 text-sm">{w.verified_facts}</p>}
                  {w.personal_notes && <p className="mt-3 text-sm italic text-muted-foreground">{w.personal_notes}</p>}
                  {w.source_url && <a href={w.source_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-xs text-ice hover:underline">Reference source</a>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
