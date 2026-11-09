import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, LayoutGrid, List } from "lucide-react";
import { EmptyState, LoadingRows, StatusBadge } from "@/components/status-badge";
import { Chips, PageTitle, PhotoCard, SearchBox, Select } from "@/components/ui-kit";
import { unescoQuery, STATUS_LABEL } from "@/lib/queries";
import { UNESCO_IMAGES } from "@/lib/images";

export const Route = createFileRoute("/unesco")({
  head: () => ({
    meta: [
      { title: "UNESCO World Heritage Explorer | Markhor Albion" },
      { name: "description", content: "An editable record of UNESCO World Heritage properties and personal visit status." },
      { property: "og:title", content: "UNESCO World Heritage Explorer" },
      { property: "og:description", content: "Officially inscribed World Heritage properties, tracked one visit at a time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Unesco,
});

function Unesco() {
  const { data = [], isLoading } = useQuery(unescoQuery);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [list, setList] = useState<"inscribed" | "tentative">("inscribed");
  const [view, setView] = useState<"grid" | "list">("grid");
  const countries = [...new Set(data.map((s) => s.countries))].sort();
  const rows = data.filter(
    (s) => s.list_status === list && (country === "all" || s.countries === country) && (type === "all" || s.site_type === type) && (status === "all" || s.status === status) && s.official_name.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <>
      <PageTitle title="UNESCO World Heritage Explorer" intro="Discover, track and explore the world's most extraordinary cultural and natural heritage sites. Visiting a country or city never marks its properties as visited." />
      <section className="container-page pb-10">
        <div className="flex flex-wrap items-center gap-2">
          <SearchBox value={q} onChange={setQ} placeholder="Search UNESCO sites…" className="min-w-[200px] flex-1 md:max-w-xs" />
          <Select label="Country" value={country} onChange={setCountry}><option value="all">All countries</option>{countries.map((c) => <option key={c}>{c}</option>)}</Select>
          <Select label="Type" value={type} onChange={setType}><option value="all">All types</option><option value="cultural">Cultural</option><option value="natural">Natural</option><option value="mixed">Mixed</option></Select>
          <Select label="Visit status" value={status} onChange={setStatus}><option value="all">All status</option>{["visited", "planned", "not_visited", "needs_confirmation"].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</Select>
          <div className="ml-auto flex gap-1">
            <button aria-label="Grid view" onClick={() => setView("grid")} className={`rounded-md border p-2 ${view === "grid" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}><LayoutGrid className="h-4 w-4" /></button>
            <button aria-label="List view" onClick={() => setView("list")} className={`rounded-md border p-2 ${view === "list" ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}><List className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mt-4"><Chips value={list} onChange={setList} options={[{ value: "inscribed", label: "Inscribed properties" }, { value: "tentative", label: "Tentative List" }]} /></div>

        <div className="mt-6">
          {isLoading ? <LoadingRows /> : rows.length === 0 ? (
            <EmptyState title="No properties match." body={list === "tentative" ? "Tentative List entries can be added from the admin dashboard." : "Try a different filter."} />
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rows.map((s) => (
                <a key={s.id} href={s.official_url ?? undefined} target="_blank" rel="noreferrer">
                  <PhotoCard aspect="aspect-[16/9]" image={s.unesco_ref ? UNESCO_IMAGES[s.unesco_ref] : null} title={s.official_name} subtitle={`${s.countries} · ${s.site_type[0]?.toUpperCase()}${s.site_type.slice(1)} · ${s.year_inscribed ?? ""}`} badge={<StatusBadge status={s.status} />} />
                </a>
              ))}
            </div>
          ) : (
            <ul className="divide-y divide-border rounded-lg border border-border bg-card">
              {rows.map((s) => (
                <li key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{s.official_name}</p>
                    <p className="text-xs capitalize text-muted-foreground">{s.countries} · {s.site_type} · {s.year_inscribed}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={s.status} />
                    {s.official_url && <a href={s.official_url} target="_blank" rel="noreferrer" aria-label="Official UNESCO listing" className="text-ice"><ExternalLink className="h-4 w-4" /></a>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Photos are illustrative. Records are maintained by hand and link to UNESCO's official listing.</p>
      </section>
    </>
  );
}
