import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Building2, ChevronRight, Globe2, MapPin, Plane } from "lucide-react";
import { EmptyState, LoadingRows, StatusBadge } from "@/components/status-badge";
import { Flag, PhotoCard, StatTile } from "@/components/ui-kit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { articlesQuery, destinationsQuery, pakistanWondersQuery, unescoQuery, worldWondersQuery, TYPE_LABEL, STATUS_LABEL } from "@/lib/queries";
import { DESTINATION_IMAGES, DESTINATION_TAGLINES, PAKISTAN_IMAGES, UNESCO_IMAGES } from "@/lib/images";
import { PERSONAL_PHOTOS } from "@/lib/personal-photos";
import { LANDMARK_CREDITS } from "@/lib/landmark-images";

function titleFromSlug(slug: string) {
  return slug.split("-").map((w) => (w[0]?.toUpperCase() ?? "") + w.slice(1)).join(" ");
}

export const Route = createFileRoute("/destinations/$slug")({
  head: ({ params }) => {
    const name = titleFromSlug(params.slug);
    return {
      meta: [
        { title: `${name} — Destination | Markhor Albion` },
        { name: "description", content: `${name}: visit record, cities explored, attractions and journal entries from Markhor Albion.` },
        { property: "og:title", content: `${name} | Markhor Albion` },
        { property: "og:description", content: `Personal travel record and guide for ${name}.` },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: DestinationPage,
});

const Empty = ({ children }: { children: React.ReactNode }) => <p className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">{children}</p>;

function DestinationPage() {
  const { slug } = Route.useParams();
  const { data: all = [], isLoading } = useQuery(destinationsQuery);
  const articles = useQuery(articlesQuery).data ?? [];
  const unesco = useQuery(unescoQuery).data ?? [];
  const wonders = useQuery(worldWondersQuery).data ?? [];
  const pk = useQuery(pakistanWondersQuery).data ?? [];

  if (isLoading) return <div className="container-page pt-32"><LoadingRows /></div>;
  const d = all.find((x) => x.slug === slug);
  if (!d) return <div className="container-page pt-40"><EmptyState title="Destination not found" body="This destination isn't in the atlas yet." /></div>;

  const parent = all.find((x) => x.id === d.parent_id);
  const children = all.filter((x) => x.parent_id === d.id);
  const related = articles.filter((a) => a.destination_id === d.id);
  const sites = unesco.filter((u) => u.destination_id === d.id);
  const ws = wonders.filter((w) => w.destination_id === d.id);
  const attractions = d.slug === "pakistan" ? pk : [];
  const nearby = all.filter((x) => x.id !== d.id && x.continent === d.continent && x.status === "visited").slice(0, 8);
  const custom = Array.isArray(d.custom_sections) ? (d.custom_sections as { title?: string; body?: string }[]) : [];
  const banner = DESTINATION_IMAGES[d.slug] ?? (parent ? DESTINATION_IMAGES[parent.slug] : undefined);
  const credit = LANDMARK_CREDITS[d.slug];

  return (
    <article>
      <header className="relative">
        <div className="relative h-[52vh] min-h-[360px] overflow-hidden">
          {banner && <img src={banner} alt={credit?.landmark ?? `${d.name} landmark`} className="h-full w-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/10" />
        </div>
        <div className="container-page relative -mt-44">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link><ChevronRight className="h-3 w-3" />
            <Link to="/destinations" className="hover:text-foreground">Destinations</Link><ChevronRight className="h-3 w-3" />
            {parent && <><Link to="/destinations/$slug" params={{ slug: parent.slug }} className="hover:text-foreground">{parent.name}</Link><ChevronRight className="h-3 w-3" /></>}
            <span className="text-foreground">{d.name}</span>
          </nav>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Flag iso2={d.iso2} slug={d.slug} emoji={d.flag} className="h-10 w-14 rounded" />
            <h1 className="font-serif text-4xl md:text-6xl">{d.name}</h1>
            <StatusBadge status={d.status} />
          </div>
          <p className="mt-3 max-w-xl text-sm text-foreground/80">{d.status_description ?? DESTINATION_TAGLINES[d.slug] ?? TYPE_LABEL[d.type]}</p>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatTile icon={<Building2 className="h-4 w-4" />} value={<span className="text-base">{d.capital ?? "—"}</span>} label="Capital" />
            <StatTile icon={<Globe2 className="h-4 w-4" />} value={<span className="text-base">{d.continent ?? "—"}</span>} label="Continent" />
            <StatTile icon={<Plane className="h-4 w-4" />} value={<span className="text-base">{d.visit_count ?? (d.status === "visited" ? "Not confirmed" : "—")}</span>} label="Recorded visits" />
            <StatTile icon={<MapPin className="h-4 w-4" />} value={<span className="text-base text-ice">{STATUS_LABEL[d.status]}</span>} label="Status" />
          </div>
        </div>
      </header>

      <div className="container-page py-8">
        <Tabs defaultValue="overview">
          <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-0">
            {["overview", "cities", "attractions", "unesco", "experiences", "photos", "articles", "tips"].map((t) => (
              <TabsTrigger key={t} value={t} className="rounded-none border-b-2 border-transparent px-4 py-2.5 capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-ice">
                {t === "unesco" ? "UNESCO" : t === "experiences" ? "My Experiences" : t === "tips" ? "Travel Tips" : t}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-8">
            <div className="grid gap-8 md:grid-cols-[1.3fr_1fr]">
              <div>
                <h2 className="font-serif text-2xl">About {d.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground">General destination information</p>
                {d.general_info ? <p className="mt-4 whitespace-pre-line text-sm leading-relaxed">{d.general_info}</p> : <p className="mt-4 text-sm text-muted-foreground">No description has been written yet.</p>}
                {children.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-semibold">Includes</h3>
                    <div className="mt-2 flex flex-wrap gap-2">{children.map((c) => <Link key={c.id} to="/destinations/$slug" params={{ slug: c.slug }} className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm hover:border-primary"><Flag iso2={c.iso2} slug={c.slug} emoji={c.flag} className="h-3 w-4 rounded-[2px]" />{c.name}</Link>)}</div>
                  </div>
                )}
                {d.visit?.highlights && <div className="mt-6"><h3 className="text-sm font-semibold">Key experiences</h3><p className="mt-2 whitespace-pre-line text-sm">{d.visit.highlights}</p></div>}
                {custom.map((c, i) => <div key={i} className="mt-6"><h3 className="text-sm font-semibold">{c.title}</h3><p className="mt-2 whitespace-pre-line text-sm">{c.body}</p></div>)}
              </div>
              {banner && <figure className="self-start overflow-hidden rounded-lg border border-border">
                <img src={banner} alt={credit?.landmark ?? `${d.name} landmark`} loading="lazy" className="aspect-[2/1] w-full bg-background object-contain" />
                {credit && <figcaption className="px-3 py-2 text-xs leading-relaxed text-muted-foreground">
                  <a href={credit.source} target="_blank" rel="noopener noreferrer" className="hover:text-ice">{credit.landmark} · {credit.author}</a>
                  {" · "}<a href={credit.licenseUrl || credit.source} target="_blank" rel="noopener noreferrer" className="hover:text-ice">{credit.license}</a>
                </figcaption>}
              </figure>}
            </div>
          </TabsContent>

          <TabsContent value="cities" className="mt-8">
            {d.visit?.cities_explored?.length ? <div className="flex flex-wrap gap-2">{d.visit.cities_explored.map((c) => <span key={c} className="rounded-full border border-border px-3 py-1 text-sm">{c}</span>)}</div> : <Empty>No cities recorded yet.</Empty>}
          </TabsContent>

          <TabsContent value="attractions" className="mt-8">
            {attractions.length || ws.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5">
                {attractions.map((w) => <PhotoCard key={w.id} image={PAKISTAN_IMAGES[w.slug]} title={w.name} subtitle={`${w.region} · ${w.category}`} badge={<StatusBadge status={w.status} />} />)}
                {ws.map((w) => <PhotoCard key={w.id} title={w.name} subtitle={w.category} badge={<StatusBadge status={w.status} />} />)}
              </div>
            ) : <Empty>No attractions recorded yet.</Empty>}
          </TabsContent>

          <TabsContent value="unesco" className="mt-8">
            {sites.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {sites.map((s) => <PhotoCard key={s.id} image={s.unesco_ref ? UNESCO_IMAGES[s.unesco_ref] : null} title={s.official_name} subtitle={`${s.site_type} · ${s.year_inscribed ?? ""}`} badge={<StatusBadge status={s.status} />} />)}
              </div>
            ) : <Empty>No UNESCO properties recorded for {d.name} yet.</Empty>}
          </TabsContent>

          <TabsContent value="experiences" className="mt-8">
            <p className="mb-3 text-xs text-muted-foreground">Information I have personally recorded</p>
            {d.visit?.personal_notes || d.visit?.highlights ? <div className="space-y-3 text-sm">{d.visit?.highlights && <p>{d.visit.highlights}</p>}{d.visit?.personal_notes && <p className="text-muted-foreground">{d.visit.personal_notes}</p>}</div> : <Empty>No personal experiences written yet.</Empty>}
          </TabsContent>

          <TabsContent value="photos" className="mt-8">
            {(() => {
              const own = PERSONAL_PHOTOS[d.slug] ?? (parent ? PERSONAL_PHOTOS[parent.slug] : undefined) ?? [];
              if (!own.length) return <Empty>No personal photographs uploaded yet.</Empty>;
              return (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {own.map((p) => (
                    <figure key={p.url} className="group overflow-hidden rounded-lg border border-border">
                      <img src={p.url} alt={p.caption} loading="lazy" className="aspect-[4/3] w-full bg-background object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
                      <figcaption className="px-3 py-2 text-xs text-muted-foreground">{p.caption}</figcaption>
                    </figure>
                  ))}
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="articles" className="mt-8">
            {related.length ? <ul className="space-y-2">{related.map((a) => <li key={a.id}><Link to="/journal/$slug" params={{ slug: a.slug }} className="font-serif text-lg hover:text-ice">{a.title}</Link></li>)}</ul> : <Empty>No published articles yet.</Empty>}
          </TabsContent>

          <TabsContent value="tips" className="mt-8">
            {d.travel_tips ? <p className="whitespace-pre-line text-sm leading-relaxed">{d.travel_tips}</p> : <Empty>No travel tips added yet.</Empty>}
          </TabsContent>
        </Tabs>

        {nearby.length > 0 && (
          <section className="mt-14">
            <h2 className="mb-3 text-sm font-semibold">Also explored in {d.continent}</h2>
            <div className="flex flex-wrap gap-2">
              {nearby.map((n) => <Link key={n.id} to="/destinations/$slug" params={{ slug: n.slug }} className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm hover:border-primary"><Flag iso2={n.iso2} slug={n.slug} emoji={n.flag} className="h-3 w-4 rounded-[2px]" />{n.name}</Link>)}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
