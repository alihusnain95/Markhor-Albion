import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { EmptyState, LoadingRows } from "@/components/status-badge";
import { Chips, PageTitle, SearchBox, Select } from "@/components/ui-kit";
import { articlesQuery } from "@/lib/queries";
import { readingTime } from "@/lib/stats";

export const ARTICLE_CATEGORIES = ["Travel stories", "City guides", "Culture", "Food", "Architecture", "Adventure", "Transport", "Budget travel", "Hidden gems", "Travel tips", "Personal reflections", "Lifestyle", "Experiences and ambitions"];

export const Route = createFileRoute("/journal/")({
  head: () => ({
    meta: [
      { title: "The Journal — Travel Stories | Markhor Albion" },
      { name: "description", content: "Travel stories, city guides and reflections from the road." },
      { property: "og:title", content: "The Journal | Markhor Albion" },
      { property: "og:description", content: "Stories, guides and reflections from Markhor Albion." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { topic?: string } => {
    const t = search["topic"];
    return typeof t === "string" && t ? { topic: t } : {};
  },
  component: Journal,
});

const fmt = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "");

function Journal() {
  const { data = [], isLoading } = useQuery(articlesQuery);
  const { topic } = Route.useSearch();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState(topic && ARTICLE_CATEGORIES.includes(topic) ? topic : "all");
  const shownCats = topic && !ARTICLE_CATEGORIES.slice(0, 8).includes(topic) ? [...ARTICLE_CATEGORIES.slice(0, 8), topic] : ARTICLE_CATEGORIES.slice(0, 8);
  useEffect(() => {
    setCat(topic && ARTICLE_CATEGORIES.includes(topic) ? topic : "all");
  }, [topic]);
  const [sort, setSort] = useState("latest");
  const featured = data.find((a) => a.is_featured) ?? null;
  let list = data.filter((a) => (cat === "all" || a.categories.includes(cat)) && (a.title + " " + (a.intro ?? "")).toLowerCase().includes(q.toLowerCase()));
  if (sort === "oldest") list = [...list].reverse();

  return (
    <>
      <PageTitle title="The Journal" intro="Travel stories, guides, experiences and reflections from around the world." />
      <div className="container-page grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <Chips value={cat} onChange={setCat} options={[{ value: "all", label: "All" }, ...shownCats.map((c) => ({ value: c, label: c }))]} />
          <div className="flex gap-2">
            <SearchBox value={q} onChange={setQ} placeholder="Search articles…" className="flex-1" />
            <Select label="Sort" value={sort} onChange={setSort}><option value="latest">Latest</option><option value="oldest">Oldest</option></Select>
          </div>
          {isLoading ? <LoadingRows /> : list.length === 0 ? (
            <EmptyState title={data.length ? "No articles match." : "No articles published yet."} body={data.length ? "Try a different search." : "Articles written and published from the admin dashboard will appear here."} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((a) => (
                <Link key={a.id} to="/journal/$slug" params={{ slug: a.slug }} className="group overflow-hidden rounded-lg border border-border bg-card hover:border-primary/60">
                  {a.cover_url ? <img src={a.cover_url} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" /> : <div className="aspect-[16/10] w-full bg-secondary" />}
                  <div className="p-4">
                    <p className="font-semibold group-hover:text-ice">{a.title}</p>
                    {a.intro && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.intro}</p>}
                    <p className="mt-3 text-[0.7rem] text-muted-foreground">{fmt(a.published_at)} · {readingTime(a.body)} min read</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        <aside className="h-fit rounded-xl border border-border bg-card p-5">
          <h2 className="font-serif text-lg">Featured Article</h2>
          {featured ? (
            <Link to="/journal/$slug" params={{ slug: featured.slug }} className="group mt-4 block">
              {featured.cover_url && <img src={featured.cover_url} alt="" className="aspect-[16/10] w-full rounded-md object-cover" />}
              <p className="mt-3 font-semibold group-hover:text-ice">{featured.title}</p>
              {featured.intro && <p className="mt-1 text-xs text-muted-foreground">{featured.intro}</p>}
              <p className="mt-3 flex items-center justify-between text-[0.7rem] text-muted-foreground">{fmt(featured.published_at)} · {readingTime(featured.body)} min read <span className="inline-flex items-center gap-1 text-ice">Read more <ArrowRight className="h-3 w-3" /></span></p>
            </Link>
          ) : <p className="mt-3 text-sm text-muted-foreground">Mark any published article as featured in the admin dashboard to show it here.</p>}
        </aside>
      </div>
    </>
  );
}
