import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { LoadingRows, StatusBadge, EmptyState } from "@/components/status-badge";
import { Chips, PageTitle, PhotoCard, SearchBox, Select } from "@/components/ui-kit";
import { pakistanWondersQuery, STATUS_LABEL } from "@/lib/queries";
import { PAKISTAN_IMAGES } from "@/lib/images";

export const Route = createFileRoute("/pakistan-50-wonders")({
  head: () => ({
    meta: [
      { title: "Pakistan: 50 Wonders | Markhor Albion" },
      { name: "description", content: "A personal, editable checklist of fifty remarkable destinations across every region of Pakistan." },
      { property: "og:title", content: "Pakistan: 50 Wonders" },
      { property: "og:description", content: "Mountains, valleys, forts, mosques and coastlines — a personal Pakistan checklist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PakistanWonders,
});

const REGIONS = ["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "Azad Jammu and Kashmir", "Islamabad Capital Territory"];
const SHORT: Record<string, string> = { "Azad Jammu and Kashmir": "Azad Kashmir", "Islamabad Capital Territory": "Islamabad" };

function PakistanWonders() {
  const { data = [], isLoading } = useQuery(pakistanWondersQuery);
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [q, setQ] = useState("");
  const categories = [...new Set(data.map((w) => w.category))].sort();
  const visited = data.filter((w) => w.status === "visited").length;
  const list = data.filter((w) => (region === "all" || w.region === region) && (category === "all" || w.category === category) && (status === "all" || w.status === status) && w.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageTitle
        title="Pakistan: 50 Wonders"
        intro="A personal selection of 50 remarkable destinations across Pakistan — not an official list by UNESCO or any other body."
        action={<div className="text-right"><p className="font-serif text-3xl tabular-nums">{visited}<span className="text-lg text-muted-foreground"> / {data.length}</span></p><p className="text-xs text-muted-foreground">visited</p></div>}
      />
      <section className="container-page pb-10">
        <Chips value={region} onChange={setRegion} options={[{ value: "all", label: "All Regions" }, ...REGIONS.map((r) => ({ value: r, label: SHORT[r] ?? r }))]} />
        <div className="mt-4 flex flex-wrap gap-2">
          <SearchBox value={q} onChange={setQ} placeholder="Search wonders…" className="min-w-[200px] flex-1" />
          <Select label="Category" value={category} onChange={setCategory}><option value="all">All categories</option>{categories.map((c) => <option key={c}>{c}</option>)}</Select>
          <Select label="Status" value={status} onChange={setStatus}><option value="all">All status</option>{["visited", "planned", "not_visited", "not_confirmed"].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</Select>
        </div>
        <div className="mt-6">
          {isLoading ? <LoadingRows rows={6} /> : list.length === 0 ? <EmptyState title="Nothing matches." body="Try another region or filter." /> : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {list.map((w) => (
                <a key={w.id} href={w.lat != null ? `https://www.openstreetmap.org/?mlat=${w.lat}&mlon=${w.lng}#map=11/${w.lat}/${w.lng}` : undefined} target="_blank" rel="noreferrer" title={w.description ?? w.name}>
                  <PhotoCard image={PAKISTAN_IMAGES[w.slug]} title={w.name} subtitle={`${SHORT[w.region] ?? w.region} · ${w.category}`} badge={<StatusBadge status={w.status} />} />
                </a>
              ))}
            </div>
          )}
        </div>
        <p className="mt-6 text-xs text-muted-foreground">Photos are illustrative. Places are marked visited only when a visit has been explicitly recorded. Click a card to see it on the map.</p>
      </section>
    </>
  );
}
