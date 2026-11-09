import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmptyState, LoadingRows } from "@/components/status-badge";
import { ArticleBody } from "@/components/article-body";
import { articleQuery, articlesQuery, destinationsQuery } from "@/lib/queries";
import { readingTime } from "@/lib/stats";

export const Route = createFileRoute("/journal/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — The Journal | Markhor Albion` },
      { name: "description", content: "A travel story from The Journal by Markhor Albion." },
      { property: "og:title", content: "The Journal | Markhor Albion" },
      { property: "og:description", content: "A travel story from Markhor Albion." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ArticlePage,
});

function ArticlePage() {
  const { slug } = Route.useParams();
  const { data: a, isLoading } = useQuery(articleQuery(slug));
  const all = useQuery(articlesQuery).data ?? [];
  const dests = useQuery(destinationsQuery).data ?? [];
  if (isLoading) return <div className="container-page pt-32"><LoadingRows /></div>;
  if (!a) return <div className="container-page pt-40"><EmptyState title="Article not found" body="It may be unpublished or the link may be wrong." /></div>;

  const dest = dests.find((d) => d.id === a.destination_id);
  const related = all.filter((x) => x.id !== a.id && (x.destination_id === a.destination_id || x.categories.some((c) => a.categories.includes(c)))).slice(0, 3);
  const share = async () => {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: a.title, url }).catch(() => {});
    else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
  };

  return (
    <article>
      <header className="container-page max-w-3xl pb-10 pt-32 md:pt-40">
        <p className="eyebrow">{a.categories.join(" · ") || "The Journal"}</p>
        <h1 className="mt-4 font-serif text-4xl font-light leading-tight md:text-6xl">{a.title}</h1>
        {a.intro && <p className="mt-6 text-xl leading-relaxed text-muted-foreground">{a.intro}</p>}
        <p className="mt-6 text-xs text-muted-foreground">
          {a.author && `${a.author} · `}{a.published_at && new Date(a.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} · {readingTime(a.body)} min read
          {dest && <> · <Link to="/destinations/$slug" params={{ slug: dest.slug }} className="text-ice hover:underline">{dest.name}</Link></>}
          {a.city && ` · ${a.city}`}
        </p>
      </header>
      {a.cover_url && <img src={a.cover_url} alt="" className="mx-auto max-h-[70vh] w-full max-w-6xl object-cover" />}
      <div className="container-page max-w-3xl py-14">
        <ArticleBody body={a.body ?? ""} />
        <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-6">
          {a.tags.map((t) => <span key={t} className="border border-border px-2 py-0.5 text-xs text-muted-foreground">#{t}</span>)}
          <button onClick={share} className="ml-auto border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary">Share</button>
        </div>
      </div>
      {related.length > 0 && (
        <section className="container-page pb-10">
          <p className="eyebrow mb-6">Related articles</p>
          <div className="grid gap-8 md:grid-cols-3">
            {related.map((r) => <Link key={r.id} to="/journal/$slug" params={{ slug: r.slug }} className="font-serif text-xl hover:text-ice">{r.title}</Link>)}
          </div>
        </section>
      )}
    </article>
  );
}
