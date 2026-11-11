import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/ui-kit";

export const Route = createFileRoute("/podcasts")({
  head: () => ({ meta: [
    { title: "Podcasts | Markhor Albion" },
    { name: "description", content: "Audio stories, conversations and travel discoveries from Markhor Albion." },
  ] }),
  component: Podcasts,
});

function Podcasts() {
  return (
    <>
      <PageTitle title="Podcasts" intro="Conversations, stories and sounds from beyond the map." />
      <section className="container-page pb-16">
        <div className="rounded-xl border border-border bg-card/60 p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-ice">Coming soon</p>
          <h2 className="mt-3 font-serif text-3xl">The world, in conversation.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">Travel conversations, cultural perspectives, extraordinary experiences and stories from people you meet along the way. Episodes will appear here as they are published.</p>
        </div>
      </section>
    </>
  );
}
