import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import {
  destinationsQuery, pakistanWondersQuery, unescoQuery, worldWondersQuery, plansQuery, tripsQuery, settingQuery,
  STATUS_LABEL, TYPE_LABEL, mediaQuery, type DestinationWithVisit, type Article, type PlannedTrip, type MediaItem,
} from "@/lib/queries";
import { ARTICLE_CATEGORIES } from "@/routes/journal.index";
import { ABOUT_SECTIONS } from "@/routes/about";
import { ArticleBody } from "@/components/article-body";
import { PhotoUploadButton, uploadVideo } from "@/components/photo-upload";
import { toEmbedUrl, youtubeThumb } from "@/lib/media";
import { Images, Award, CalendarDays, Download, FileText, Landmark, LayoutDashboard, MapPin, Mountain, Plane, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Markhor Albion" },
      { name: "description", content: "Manage the Markhor Albion atlas." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin | Markhor Albion" },
      { property: "og:description", content: "Content management." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const sel = "h-9 border border-border bg-background px-2 text-sm";
const btn = "bg-primary px-3 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
const ghost = "border border-border px-3 py-2 text-xs font-semibold hover:border-primary";
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function useRefresh() {
  const qc = useQueryClient();
  return (...keys: string[]) => keys.forEach((k) => qc.invalidateQueries({ queryKey: [k] }));
}

async function run<T>(p: PromiseLike<{ error: { message: string } | null; data?: T }>, ok = "Saved") {
  const { error } = await p;
  if (error) { toast.error(error.message); return false; }
  toast.success(ok);
  return true;
}

function Confirm({ label, onConfirm, what }: { label: string; what: string; onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="border border-destructive/50 px-3 py-2 text-xs text-destructive hover:bg-destructive/10">{label}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {what}?</AlertDialogTitle>
          <AlertDialogDescription>This permanently removes the record. It cannot be undone.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function Admin() {
  const { user, isAdmin, roleLoading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const exists = useQuery({ queryKey: ["admin-exists"], queryFn: async () => (await supabase.rpc("admin_exists")).data ?? true, enabled: !!user && !isAdmin && !roleLoading });

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/" }); };

  if (!user || roleLoading) return <div className="container-page pt-32 text-sm text-muted-foreground">Checking access…</div>;
  if (!isAdmin)
    return (
      <div className="container-page max-w-xl pt-40">
        <h1 className="font-serif text-3xl">Administrator access</h1>
        {exists.data === false ? (
          <>
            <p className="mt-4 text-muted-foreground">No administrator has been set up yet. As the site owner, you can claim the administrator role for <strong>{user.email}</strong>. This can only happen once.</p>
            <button className={`${btn} mt-6`} onClick={async () => {
              const { data, error } = await supabase.rpc("claim_first_admin");
              if (error || !data) return void toast.error(error?.message ?? "An administrator already exists.");
              toast.success("You are now the administrator.");
              qc.invalidateQueries({ queryKey: ["is-admin"] });
            }}>Become the administrator</button>
          </>
        ) : (
          <p className="mt-4 text-muted-foreground">You're signed in as {user.email}, but this account doesn't have administrator access.</p>
        )}
        <button onClick={signOut} className={`${ghost} mt-6`}>Sign out</button>
      </div>
    );

  return <AdminShell email={user.email ?? ""} onSignOut={signOut} />;
}

const SECTIONS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "destinations", label: "Destinations", icon: MapPin },
  { id: "trips", label: "Trips", icon: Plane },
  { id: "journal", label: "Blog Articles", icon: FileText },
  { id: "gallery", label: "Gallery", icon: Images },
  { id: "wonders", label: "World Wonders", icon: Award },
  { id: "pakistan", label: "Pakistan 50 Wonders", icon: Mountain },
  { id: "unesco", label: "UNESCO Sites", icon: Landmark },
  { id: "plans", label: "Planned Trips", icon: CalendarDays },
  { id: "settings", label: "Homepage & Profile", icon: Settings },
  { id: "export", label: "Backup & Export", icon: Download },
] as const;
type SectionId = (typeof SECTIONS)[number]["id"];

function AdminShell({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const [section, setSection] = useState<SectionId>("dashboard");
  const current = SECTIONS.find((s) => s.id === section)!;
  return (
    <div className="light bg-background pt-16 text-foreground">
      <div className="grid min-h-[calc(100vh-4rem)] md:grid-cols-[230px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-sidebar p-3 text-sidebar-foreground md:border-b-0 md:border-r">
          <p className="px-3 pb-3 pt-2 font-serif text-sm tracking-[0.18em]">MARKHOR ALBION</p>
          <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="Admin">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setSection(s.id)} className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm ${section === s.id ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent"}`}>
                <s.icon className="h-4 w-4" />{s.label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 p-5 md:p-8">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
            <div className="min-w-0">
              <h1 className="font-serif text-3xl">{current.label}</h1>
              <p className="mt-1 text-sm text-muted-foreground">Manage your travel website content.</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="hidden sm:inline">{email}</span><button onClick={onSignOut} className={ghost}>Sign out</button></div>
          </div>
          <div className="mt-6">
            {section === "dashboard" && <DashboardHome go={setSection} />}
            {section === "destinations" && <DestinationsAdmin />}
            {section === "trips" && <TripsAdmin />}
            {section === "journal" && <JournalAdmin />}
            {section === "gallery" && <GalleryAdmin />}
            {section === "wonders" && <WondersAdmin />}
            {section === "pakistan" && <PakistanAdmin />}
            {section === "unesco" && <UnescoAdmin />}
            {section === "plans" && <PlansAdmin />}
            {section === "settings" && <SettingsAdmin />}
            {section === "export" && <ExportAdmin />}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardHome({ go }: { go: (s: SectionId) => void }) {
  const dests = useQuery(destinationsQuery).data ?? [];
  const trips = useQuery(tripsQuery).data ?? [];
  const plans = useQuery(plansQuery).data ?? [];
  const unesco = useQuery(unescoQuery).data ?? [];
  const wonders = useQuery(worldWondersQuery).data ?? [];
  const pk = useQuery(pakistanWondersQuery).data ?? [];
  const arts = useQuery({ queryKey: ["articles", "admin"], queryFn: async () => (await supabase.from("articles").select("*").order("updated_at", { ascending: false })).data ?? [] }).data ?? [];
  const published = arts.filter((a) => a.status === "published").length;
  const cards = [
    { icon: MapPin, value: dests.filter((d) => d.status === "visited").length, label: "Destinations visited", sub: `${dests.length} tracked` },
    { icon: Plane, value: trips.length, label: "Trips recorded" },
    { icon: FileText, value: published, label: "Articles published", sub: `${arts.length - published} drafts` },
    { icon: CalendarDays, value: plans.length, label: "Planned trips" },
    { icon: Landmark, value: unesco.filter((u) => u.status === "visited").length, label: "UNESCO visited", sub: `of ${unesco.length}` },
    { icon: Award, value: wonders.filter((w) => w.status === "completed").length, label: "Wonders completed", sub: `of ${wonders.length}` },
    { icon: Mountain, value: pk.filter((w) => w.status === "visited").length, label: "Pakistan wonders visited", sub: `of ${pk.length}` },
  ];
  const activity = [
    ...dests.map((d) => ({ at: d.visit?.updated_at ?? d.updated_at, text: `Updated destination: ${d.name}` })),
    ...arts.map((a) => ({ at: a.updated_at, text: `${a.status === "published" ? "Published" : "Saved draft"}: ${a.title}` })),
    ...trips.map((t) => ({ at: t.updated_at, text: `Trip: ${t.title}` })),
    ...pk.map((w) => ({ at: w.updated_at, text: `Pakistan wonder: ${w.name}` })),
  ].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 6);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><c.icon className="h-5 w-5" /></span>
            <div className="min-w-0"><p className="text-2xl font-semibold tabular-nums">{c.value}</p><p className="truncate text-xs text-muted-foreground">{c.label}{c.sub && ` · ${c.sub}`}</p></div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Recent Activity</h2>
          <ul className="mt-4 space-y-3">
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" /><div className="min-w-0"><p className="truncate">{a.text}</p><p className="text-xs text-muted-foreground">{new Date(a.at).toLocaleString("en-GB")}</p></div></li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="font-semibold">Quick Actions</h2>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button className={btn} onClick={() => go("destinations")}>Add destination</button>
            <button className={btn} onClick={() => go("journal")}>Write article</button>
            <button className={btn} onClick={() => go("trips")}>Record trip</button>
            <button className={btn} onClick={() => go("plans")}>Create plan</button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Photo uploads aren't available yet — add images to articles by link for now.</p>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Destinations ---------------- */
function DestinationRow({ d }: { d: DestinationWithVisit }) {
  const refresh = useRefresh();
  const [status, setStatus] = useState(d.status);
  const [count, setCount] = useState(d.visit_count?.toString() ?? "");
  const [cities, setCities] = useState(d.visit?.cities_explored.join(", ") ?? "");
  const [notes, setNotes] = useState(d.visit?.personal_notes ?? "");
  const [open, setOpen] = useState(false);

  const save = async () => {
    const n = count.trim() === "" ? null : Number(count);
    if (n !== null && (!Number.isInteger(n) || n < 0)) return void toast.error("Visit count must be a whole number, or left blank if unconfirmed.");
    const ok = await run(
      supabase.from("destination_visits").upsert(
        { destination_id: d.id, status, visit_count: n, cities_explored: cities.split(",").map((c) => c.trim()).filter(Boolean), personal_notes: notes || null },
        { onConflict: "destination_id" },
      ),
    );
    if (ok) refresh("destinations");
  };

  return (
    <li className="border-b border-border py-3">
      <div className="grid items-center gap-3 md:grid-cols-[1.5fr_1fr_6rem_auto]">
        <button onClick={() => setOpen(!open)} className="text-left text-sm"><span className="mr-2">{d.flag}</span>{d.name}<span className="ml-2 text-xs text-muted-foreground">{TYPE_LABEL[d.type]}</span></button>
        <select aria-label={`Status for ${d.name}`} className={sel} value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          {["visited", "planned", "not_visited", "needs_confirmation"].map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <Input aria-label="Visit count" placeholder="Unconfirmed" value={count} onChange={(e) => setCount(e.target.value)} className="h-9 rounded-none" inputMode="numeric" />
        <button onClick={save} className={btn}>Save</button>
      </div>
      {open && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Input placeholder="Cities explored (comma separated)" value={cities} onChange={(e) => setCities(e.target.value)} className="rounded-none" />
          <Textarea placeholder="Personal notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-none" />
          <DestinationDetails d={d} />
        </div>
      )}
    </li>
  );
}

function DestinationDetails({ d }: { d: DestinationWithVisit }) {
  const refresh = useRefresh();
  const [info, setInfo] = useState(d.general_info ?? "");
  const [tips, setTips] = useState(d.travel_tips ?? "");
  const [sections, setSections] = useState<{ title: string; body: string }[]>(Array.isArray(d.custom_sections) ? (d.custom_sections as { title: string; body: string }[]) : []);
  return (
    <div className="space-y-3 md:col-span-2">
      <Textarea placeholder="General destination information" value={info} onChange={(e) => setInfo(e.target.value)} className="rounded-none" />
      <Textarea placeholder="Travel tips" value={tips} onChange={(e) => setTips(e.target.value)} className="rounded-none" />
      <p className="text-xs text-muted-foreground">Custom sections</p>
      {sections.map((s, i) => (
        <div key={i} className="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
          <Input value={s.title} placeholder="Section title" onChange={(e) => setSections(sections.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))} className="rounded-none" />
          <Textarea value={s.body} placeholder="Content" onChange={(e) => setSections(sections.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)))} className="rounded-none" />
          <button className={ghost} onClick={() => setSections(sections.filter((_, j) => j !== i))}>Remove</button>
        </div>
      ))}
      <div className="flex flex-wrap gap-2">
        <button className={ghost} onClick={() => setSections([...sections, { title: "", body: "" }])}>Add section</button>
        <button className={btn} onClick={async () => { if (await run(supabase.from("destinations").update({ general_info: info || null, travel_tips: tips || null, custom_sections: sections }).eq("id", d.id))) refresh("destinations"); }}>Save page content</button>
        <Confirm label="Delete destination" what={d.name} onConfirm={async () => { if (await run(supabase.from("destinations").delete().eq("id", d.id), "Deleted")) refresh("destinations"); }} />
      </div>
    </div>
  );
}

function AddDestination({ all }: { all: DestinationWithVisit[] }) {
  const refresh = useRefresh();
  const empty = { name: "", type: "sovereign", parent_id: "", continent: "Europe", flag: "", capital: "", map_key: "", lat: "", lng: "" };
  const [f, setF] = useState(empty);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });
  const add = async () => {
    const name = f.name.trim();
    if (!name) return void toast.error("Name is required");
    const slug = slugify(name);
    if (all.some((d) => d.slug === slug)) return void toast.error(`${name} is already in the atlas.`);
    const { data, error } = await supabase.from("destinations").insert({
      name, slug, type: f.type as DestinationWithVisit["type"], parent_id: f.parent_id || null, continent: f.continent || null, flag: f.flag || null,
      capital: f.capital || null, map_key: f.map_key || null, lat: f.lat ? Number(f.lat) : null, lng: f.lng ? Number(f.lng) : null,
    }).select("id").single();
    if (error) return void toast.error(error.message);
    await supabase.from("destination_visits").insert({ destination_id: data.id, status: "not_visited" });
    toast.success(`${name} added`);
    setF(empty);
    refresh("destinations");
  };
  return (
    <div className="mt-6 border border-border p-4">
      <p className="font-serif text-lg">Add a destination</p>
      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <Input placeholder="Name" value={f.name} onChange={set("name")} className="rounded-none" />
        <select className={sel} value={f.type} onChange={set("type")}>{Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select className={sel} value={f.parent_id} onChange={set("parent_id")}><option value="">No parent state</option>{all.filter((d) => d.type === "sovereign").map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <select className={sel} value={f.continent} onChange={set("continent")}>{["Africa", "Antarctica", "Asia", "Europe", "North America", "Oceania", "South America"].map((c) => <option key={c}>{c}</option>)}</select>
        <Input placeholder="Flag emoji" value={f.flag} onChange={set("flag")} className="rounded-none" />
        <Input placeholder="Capital" value={f.capital} onChange={set("capital")} className="rounded-none" />
        <Input placeholder="Map ID (ISO numeric, e.g. 392)" value={f.map_key} onChange={set("map_key")} className="rounded-none" />
        <div className="flex gap-2"><Input placeholder="Lat" value={f.lat} onChange={set("lat")} className="rounded-none" /><Input placeholder="Lng" value={f.lng} onChange={set("lng")} className="rounded-none" /></div>
      </div>
      <button onClick={add} className={`${btn} mt-3`}>Add destination</button>
    </div>
  );
}

function DestinationsAdmin() {
  const { data = [] } = useQuery(destinationsQuery);
  const [q, setQ] = useState("");
  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground">Changing a status updates the map and statistics immediately. Leave the visit count blank when it's unconfirmed — it's never assumed to be one. Click a name for cities, notes and page content.</p>
      <AddDestination all={data} />
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="mt-6 max-w-xs rounded-none" />
      <ul className="mt-3">{data.filter((d) => d.name.toLowerCase().includes(q.toLowerCase())).map((d) => <DestinationRow key={d.id + d.updated_at + (d.visit?.updated_at ?? "")} d={d} />)}</ul>
    </div>
  );
}

/* ---------------- Trips ---------------- */
function TripsAdmin() {
  const refresh = useRefresh();
  const { data: trips = [] } = useQuery(tripsQuery);
  const { data: dests = [] } = useQuery(destinationsQuery);
  const empty = { title: "", start_date: "", end_date: "", cities: "", notes: "", transport_notes: "", is_public: true, ids: [] as string[] };
  const [f, setF] = useState(empty);
  const add = async () => {
    if (!f.title.trim()) return void toast.error("Title is required");
    if (f.start_date && f.end_date && f.end_date < f.start_date) return void toast.error("Return date is before departure date.");
    const { data, error } = await supabase.from("trips").insert({
      title: f.title.trim(), start_date: f.start_date || null, end_date: f.end_date || null, cities: f.cities.split(",").map((c) => c.trim()).filter(Boolean),
      notes: f.notes || null, transport_notes: f.transport_notes || null, is_public: f.is_public,
    }).select("id").single();
    if (error) return void toast.error(error.message);
    if (f.ids.length) await supabase.from("trip_destinations").insert(f.ids.map((destination_id) => ({ trip_id: data.id, destination_id })));
    toast.success("Trip added");
    setF(empty);
    refresh("trips");
  };
  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2">
      <div className="space-y-3 border border-border p-4">
        <p className="font-serif text-lg">Record a trip</p>
        <Input placeholder="Trip title" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="rounded-none" />
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs text-muted-foreground">Departure<Input type="date" value={f.start_date} onChange={(e) => setF({ ...f, start_date: e.target.value })} className="rounded-none" /></label>
          <label className="text-xs text-muted-foreground">Return<Input type="date" value={f.end_date} onChange={(e) => setF({ ...f, end_date: e.target.value })} className="rounded-none" /></label>
        </div>
        <Input placeholder="Cities (comma separated)" value={f.cities} onChange={(e) => setF({ ...f, cities: e.target.value })} className="rounded-none" />
        <Textarea placeholder="Notes" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} className="rounded-none" />
        <Textarea placeholder="Transport experiences" value={f.transport_notes} onChange={(e) => setF({ ...f, transport_notes: e.target.value })} className="rounded-none" />
        <p className="text-xs text-muted-foreground">Destinations on this trip</p>
        <div className="grid max-h-48 grid-cols-2 gap-1 overflow-y-auto border border-border p-2 text-sm">
          {dests.map((d) => (
            <label key={d.id} className="flex items-center gap-2">
              <input type="checkbox" checked={f.ids.includes(d.id)} onChange={(e) => setF({ ...f, ids: e.target.checked ? [...f.ids, d.id] : f.ids.filter((x) => x !== d.id) })} />{d.name}
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-sm"><Switch checked={f.is_public} onCheckedChange={(v) => setF({ ...f, is_public: v })} />Show publicly</label>
        <button onClick={add} className={btn}>Add trip</button>
      </div>
      <ul className="divide-y divide-border">
        {trips.map((t) => (
          <li key={t.id} className="flex items-start justify-between gap-3 py-3 text-sm">
            <div><p className="font-medium">{t.title}</p><p className="text-xs text-muted-foreground">{t.start_date ?? "No date"} · {t.destination_ids.length} destinations · {t.is_public ? "Public" : "Private"}</p></div>
            <Confirm label="Delete" what={t.title} onConfirm={async () => { if (await run(supabase.from("trips").delete().eq("id", t.id), "Deleted")) refresh("trips"); }} />
          </li>
        ))}
        {trips.length === 0 && <li className="py-3 text-sm text-muted-foreground">No trips recorded yet.</li>}
      </ul>
    </div>
  );
}

/* ---------------- Pakistan ---------------- */
function PakistanAdmin() {
  const refresh = useRefresh();
  const { data = [] } = useQuery(pakistanWondersQuery);
  const [n, setN] = useState({ name: "", region: "Punjab", category: "Natural wonders" });
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2 border border-border p-4">
        <Input placeholder="New place name" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} className="max-w-xs rounded-none" />
        <select className={sel} value={n.region} onChange={(e) => setN({ ...n, region: e.target.value })}>{["Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan", "Gilgit-Baltistan", "Azad Jammu and Kashmir", "Islamabad Capital Territory"].map((r) => <option key={r}>{r}</option>)}</select>
        <Input placeholder="Category" value={n.category} onChange={(e) => setN({ ...n, category: e.target.value })} className="max-w-[12rem] rounded-none" />
        <button className={btn} onClick={async () => {
          if (!n.name.trim()) return;
          if (await run(supabase.from("pakistan_wonders").insert({ ...n, name: n.name.trim(), slug: slugify(n.name), sort_order: data.length + 1 }), "Added")) { setN({ ...n, name: "" }); refresh("pakistan_wonders"); }
        }}>Add place</button>
      </div>
      <ul className="mt-4">
        {data.map((w) => (
          <StatusRow key={w.id + w.updated_at} name={`${w.name} — ${w.region}`} status={w.status} notes={w.personal_notes} options={["visited", "planned", "not_visited", "not_confirmed"]}
            onSave={async (status, personal_notes) => { if (await run(supabase.from("pakistan_wonders").update({ status: status as typeof w.status, personal_notes }).eq("id", w.id))) refresh("pakistan_wonders"); }}
            onDelete={async () => { if (await run(supabase.from("pakistan_wonders").delete().eq("id", w.id), "Deleted")) refresh("pakistan_wonders"); }} />
        ))}
      </ul>
    </div>
  );
}

function StatusRow({ name, status, notes, options, onSave, onDelete, extra }: {
  name: string; status: string; notes: string | null; options: string[]; extra?: React.ReactNode;
  onSave: (status: string, notes: string | null) => void; onDelete: () => void;
}) {
  const [s, setS] = useState(status);
  const [nt, setNt] = useState(notes ?? "");
  return (
    <li className="grid items-center gap-2 border-b border-border py-3 md:grid-cols-[1.5fr_12rem_1.5fr_auto_auto]">
      <span className="text-sm">{name}</span>
      <select className={sel} value={s} onChange={(e) => setS(e.target.value)} aria-label={`Status for ${name}`}>{options.map((o) => <option key={o} value={o}>{STATUS_LABEL[o]}</option>)}</select>
      <Input placeholder="Personal notes" value={nt} onChange={(e) => setNt(e.target.value)} className="h-9 rounded-none" />
      <button className={btn} onClick={() => onSave(s, nt || null)}>Save</button>
      <Confirm label="Delete" what={name} onConfirm={onDelete} />
      {extra}
    </li>
  );
}

/* ---------------- UNESCO ---------------- */
function UnescoAdmin() {
  const refresh = useRefresh();
  const { data = [] } = useQuery(unescoQuery);
  const { data: dests = [] } = useQuery(destinationsQuery);
  const empty = { official_name: "", countries: "", site_type: "cultural", list_status: "inscribed", year_inscribed: "", official_url: "", destination_id: "" };
  const [f, setF] = useState(empty);
  return (
    <div className="mt-6">
      <p className="text-sm text-muted-foreground">Records are maintained by hand — there is no automatic sync with UNESCO. Check each property against whc.unesco.org before adding.</p>
      <div className="mt-4 grid gap-2 border border-border p-4 md:grid-cols-4">
        <Input placeholder="Official name" value={f.official_name} onChange={(e) => setF({ ...f, official_name: e.target.value })} className="rounded-none md:col-span-2" />
        <Input placeholder="Country or countries" value={f.countries} onChange={(e) => setF({ ...f, countries: e.target.value })} className="rounded-none" />
        <select className={sel} value={f.destination_id} onChange={(e) => setF({ ...f, destination_id: e.target.value })}><option value="">Link to destination…</option>{dests.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
        <select className={sel} value={f.site_type} onChange={(e) => setF({ ...f, site_type: e.target.value })}><option value="cultural">Cultural</option><option value="natural">Natural</option><option value="mixed">Mixed</option></select>
        <select className={sel} value={f.list_status} onChange={(e) => setF({ ...f, list_status: e.target.value })}><option value="inscribed">Inscribed</option><option value="tentative">Tentative List</option></select>
        <Input placeholder="Year inscribed" value={f.year_inscribed} onChange={(e) => setF({ ...f, year_inscribed: e.target.value })} className="rounded-none" />
        <Input placeholder="Official URL" value={f.official_url} onChange={(e) => setF({ ...f, official_url: e.target.value })} className="rounded-none" />
        <button className={btn} onClick={async () => {
          if (!f.official_name.trim() || !f.countries.trim()) return void toast.error("Name and country are required");
          if (await run(supabase.from("unesco_sites").insert({
            official_name: f.official_name.trim(), countries: f.countries.trim(), site_type: f.site_type as "cultural", list_status: f.list_status as "inscribed",
            year_inscribed: f.year_inscribed ? Number(f.year_inscribed) : null, official_url: f.official_url || null, destination_id: f.destination_id || null,
          }), "Added")) { setF(empty); refresh("unesco_sites"); }
        }}>Add property</button>
      </div>
      <ul className="mt-4">
        {data.map((u) => (
          <StatusRow key={u.id + u.updated_at} name={`${u.official_name}${u.list_status === "tentative" ? " (Tentative)" : ""}`} status={u.status} notes={u.personal_notes} options={["visited", "planned", "not_visited", "needs_confirmation"]}
            onSave={async (status, personal_notes) => { if (await run(supabase.from("unesco_sites").update({ status: status as typeof u.status, personal_notes }).eq("id", u.id))) refresh("unesco_sites"); }}
            onDelete={async () => { if (await run(supabase.from("unesco_sites").delete().eq("id", u.id), "Deleted")) refresh("unesco_sites"); }} />
        ))}
      </ul>
    </div>
  );
}

/* ---------------- World wonders ---------------- */
function WondersAdmin() {
  const refresh = useRefresh();
  const { data = [] } = useQuery(worldWondersQuery);
  const [n, setN] = useState({ name: "", location: "", category: "Natural wonders" });
  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2 border border-border p-4">
        <Input placeholder="Name" value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} className="max-w-xs rounded-none" />
        <Input placeholder="Location" value={n.location} onChange={(e) => setN({ ...n, location: e.target.value })} className="max-w-xs rounded-none" />
        <Input placeholder="Category (any — custom allowed)" list="wonder-cats" value={n.category} onChange={(e) => setN({ ...n, category: e.target.value })} className="max-w-xs rounded-none" />
        <datalist id="wonder-cats">{["New Seven Wonders of the World", "Seven Wonders of the Ancient World", "Natural wonders", "Mountains and famous peaks", "Waterfalls", "Deserts", "Lakes and rivers", "Famous buildings and monuments", "Historical cities", "Remarkable transport systems", "Engineering achievements", "Unusual geographical features", "Cultural experiences", "Unique travel challenges", "World-record destinations"].map((c) => <option key={c} value={c} />)}</datalist>
        <button className={btn} onClick={async () => {
          if (!n.name.trim() || !n.category.trim()) return;
          if (await run(supabase.from("world_wonders").insert({ ...n, name: n.name.trim(), sort_order: 100 + data.length }), "Added")) { setN({ ...n, name: "", location: "" }); refresh("world_wonders"); }
        }}>Add</button>
      </div>
      <ul className="mt-4">
        {data.map((w) => (
          <StatusRow key={w.id + w.updated_at} name={w.name} status={w.status} notes={w.personal_notes} options={["completed", "planned", "not_visited", "needs_confirmation"]}
            onSave={async (status, personal_notes) => { if (await run(supabase.from("world_wonders").update({ status: status as typeof w.status, personal_notes }).eq("id", w.id))) refresh("world_wonders"); }}
            onDelete={async () => { if (await run(supabase.from("world_wonders").delete().eq("id", w.id), "Deleted")) refresh("world_wonders"); }} />
        ))}
      </ul>
    </div>
  );
}

/* ---------------- Journal ---------------- */
type Draft = Partial<Article> & { title: string; slug: string };
function JournalAdmin() {
  const refresh = useRefresh();
  const all = useQuery({ queryKey: ["articles", "admin"], queryFn: async () => (await supabase.from("articles").select("*").order("updated_at", { ascending: false })).data ?? [] });
  const { data: dests = [] } = useQuery(destinationsQuery);
  const blank: Draft = { title: "", slug: "", intro: "", body: "", categories: [], tags: [], status: "draft", is_featured: false };
  const [a, setA] = useState<Draft>(blank);
  const [preview, setPreview] = useState(false);
  const [tags, setTags] = useState("");
  useEffect(() => setTags((a.tags ?? []).join(", ")), [a.id]);

  const save = async (publish?: boolean) => {
    if (!a.title.trim()) return void toast.error("Title is required");
    const slug = slugify(a.slug || a.title);
    const status: "draft" | "published" = publish === undefined ? (a.status ?? "draft") : publish ? "published" : "draft";
    const payload = {
      title: a.title.trim(), slug, intro: a.intro || null, body: a.body || null, cover_url: a.cover_url || null, destination_id: a.destination_id || null,
      city: a.city || null, author: a.author || null, categories: a.categories ?? [], tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      seo_title: a.seo_title || null, seo_description: a.seo_description || null, is_featured: !!a.is_featured, status,
      published_at: status === "published" ? a.published_at ?? new Date().toISOString() : a.published_at ?? null,
    };
    const res = a.id ? await supabase.from("articles").update(payload).eq("id", a.id).select().single() : await supabase.from("articles").insert(payload).select().single();
    if (res.error) return void toast.error(res.error.message.includes("duplicate") ? "Another article already uses this URL slug." : res.error.message);
    toast.success(status === "published" ? "Published" : "Draft saved");
    setA(res.data as Draft);
    all.refetch();
    refresh("articles");
  };

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[16rem_1fr]">
      <div>
        <button className={`${btn} w-full`} onClick={() => { setA(blank); setPreview(false); }}>New article</button>
        <ul className="mt-4 divide-y divide-border text-sm">
          {all.data?.map((x) => (
            <li key={x.id}><button onClick={() => { setA(x as Draft); setPreview(false); }} className={`w-full py-2 text-left ${a.id === x.id ? "text-ice" : ""}`}>{x.title}<span className="block text-xs text-muted-foreground">{x.status}</span></button></li>
          ))}
        </ul>
      </div>
      <div className="space-y-3">
        <div className="flex gap-2"><button className={preview ? ghost : btn} onClick={() => setPreview(false)}>Edit</button><button className={preview ? btn : ghost} onClick={() => setPreview(true)}>Preview</button></div>
        {preview ? (
          <div className="border border-border p-6"><h2 className="font-serif text-4xl font-light">{a.title}</h2>{a.intro && <p className="mt-4 text-lg text-muted-foreground">{a.intro}</p>}<div className="mt-8"><ArticleBody body={a.body ?? ""} /></div></div>
        ) : (
          <>
            <Input placeholder="Title" value={a.title} onChange={(e) => setA({ ...a, title: e.target.value })} className="rounded-none text-lg" />
            <Input placeholder="URL slug (auto from title)" value={a.slug} onChange={(e) => setA({ ...a, slug: e.target.value })} className="rounded-none" />
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-semibold">Cover photo</p>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                {a.cover_url && <img src={a.cover_url} alt="Cover preview" className="h-20 w-32 rounded-md object-cover" />}
                <PhotoUploadButton label={a.cover_url ? "Replace cover" : "Upload cover"} onUploaded={(url) => setA((p) => ({ ...p, cover_url: url }))} />
                {a.cover_url && <button type="button" className={ghost} onClick={() => setA((p) => ({ ...p, cover_url: null }))}>Remove</button>}
              </div>
              <Input placeholder="…or paste an image link" value={a.cover_url ?? ""} onChange={(e) => setA({ ...a, cover_url: e.target.value })} className="mt-2 rounded-none" />
            </div>
            <Textarea placeholder="Introduction" value={a.intro ?? ""} onChange={(e) => setA({ ...a, intro: e.target.value })} className="rounded-none" />
            <div className="flex flex-wrap items-center gap-2">
              <PhotoUploadButton multiple label="Add photos to article" onUploaded={(url, f) => setA((p) => ({ ...p, body: `${(p.body ?? "").trimEnd()}\n\n![${f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ")}](${url})\n\n` }))} />
              <span className="text-xs text-muted-foreground">Photos are added at the end of the body — edit the text in brackets to change the caption, or move the line.</span>
            </div>
            <Textarea placeholder={"Body. Blank line = new paragraph. '## ' heading, '> ' quote, ![caption](image-url), YouTube/Vimeo link on its own line embeds video."} value={a.body ?? ""} onChange={(e) => setA({ ...a, body: e.target.value })} className="min-h-[320px] rounded-none font-mono text-sm" />
            <div className="grid gap-2 md:grid-cols-3">
              <select className={sel} value={a.destination_id ?? ""} onChange={(e) => setA({ ...a, destination_id: e.target.value || null })}><option value="">No destination</option>{dests.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
              <Input placeholder="City" value={a.city ?? ""} onChange={(e) => setA({ ...a, city: e.target.value })} className="rounded-none" />
              <Input placeholder="Author" value={a.author ?? ""} onChange={(e) => setA({ ...a, author: e.target.value })} className="rounded-none" />
            </div>
            <div className="flex flex-wrap gap-2">
              {ARTICLE_CATEGORIES.map((c) => {
                const on = a.categories?.includes(c);
                return <button key={c} onClick={() => setA({ ...a, categories: on ? a.categories!.filter((x) => x !== c) : [...(a.categories ?? []), c] })} className={`border px-2 py-1 text-xs ${on ? "border-primary bg-primary/15 text-ice" : "border-border text-muted-foreground"}`}>{c}</button>;
              })}
            </div>
            <Input placeholder="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} className="rounded-none" />
            <Input placeholder="SEO title" value={a.seo_title ?? ""} onChange={(e) => setA({ ...a, seo_title: e.target.value })} className="rounded-none" />
            <Input placeholder="SEO description" value={a.seo_description ?? ""} onChange={(e) => setA({ ...a, seo_description: e.target.value })} className="rounded-none" />
            <label className="flex items-center gap-2 text-sm"><Switch checked={!!a.is_featured} onCheckedChange={(v) => setA({ ...a, is_featured: v })} />Featured article</label>
          </>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          <button className={ghost} onClick={() => save(false)}>Save draft</button>
          <button className={btn} onClick={() => save(true)}>{a.status === "published" ? "Update published" : "Publish"}</button>
          {a.id && <Confirm label="Delete" what={a.title} onConfirm={async () => { if (await run(supabase.from("articles").delete().eq("id", a.id!), "Deleted")) { setA(blank); all.refetch(); refresh("articles"); } }} />}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Plans ---------------- */
function PlansAdmin() {
  const refresh = useRefresh();
  const { data = [] } = useQuery(plansQuery);
  const { data: dests = [] } = useQuery(destinationsQuery);
  const blank: Partial<PlannedTrip> = { title: "", status: "dreaming", is_public: false, packing: [] };
  const [p, setP] = useState<Partial<PlannedTrip>>(blank);
  const [packing, setPacking] = useState("");
  const save = async () => {
    if (!p.title?.trim()) return void toast.error("Title is required");
    if (p.intended_start && p.intended_end && p.intended_end < p.intended_start) return void toast.error("End date is before start date.");
    const payload = {
      title: p.title.trim(), destination_id: p.destination_id || null, intended_start: p.intended_start || null, intended_end: p.intended_end || null,
      status: p.status ?? "dreaming", itinerary: p.itinerary || null, budget: p.budget || null, transport_notes: p.transport_notes || null,
      accommodation_notes: p.accommodation_notes || null, goals: p.goals || null, is_public: !!p.is_public,
      packing: packing.split(",").map((x) => x.trim()).filter(Boolean),
    };
    const ok = await run(p.id ? supabase.from("planned_trips").update(payload).eq("id", p.id) : supabase.from("planned_trips").insert(payload));
    if (ok) { setP(blank); setPacking(""); refresh("planned_trips"); }
  };
  const field = (k: keyof PlannedTrip, ph: string) => <Textarea placeholder={ph} value={(p[k] as string) ?? ""} onChange={(e) => setP({ ...p, [k]: e.target.value })} className="rounded-none" />;
  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-2">
      <div className="space-y-3 border border-border p-4">
        <p className="font-serif text-lg">{p.id ? "Edit plan" : "New plan"}</p>
        <Input placeholder="Title" value={p.title ?? ""} onChange={(e) => setP({ ...p, title: e.target.value })} className="rounded-none" />
        <div className="grid grid-cols-2 gap-2">
          <select className={sel} value={p.destination_id ?? ""} onChange={(e) => setP({ ...p, destination_id: e.target.value })}><option value="">Destination…</option>{dests.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          <select className={sel} value={p.status} onChange={(e) => setP({ ...p, status: e.target.value as PlannedTrip["status"] })}>{["dreaming", "researching", "planned", "booked", "completed"].map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}</select>
          <Input type="date" value={p.intended_start ?? ""} onChange={(e) => setP({ ...p, intended_start: e.target.value })} className="rounded-none" aria-label="Intended start" />
          <Input type="date" value={p.intended_end ?? ""} onChange={(e) => setP({ ...p, intended_end: e.target.value })} className="rounded-none" aria-label="Intended end" />
        </div>
        {field("itinerary", "Itinerary")}{field("goals", "Personal goals")}{field("budget", "Budget")}{field("transport_notes", "Transport notes")}{field("accommodation_notes", "Accommodation notes")}
        <Input placeholder="Packing checklist (comma separated)" value={packing} onChange={(e) => setPacking(e.target.value)} className="rounded-none" />
        <label className="flex items-center gap-2 text-sm"><Switch checked={!!p.is_public} onCheckedChange={(v) => setP({ ...p, is_public: v })} />Publish on the Next Adventure page</label>
        <button className={btn} onClick={save}>Save plan</button>
      </div>
      <ul className="divide-y divide-border">
        {data.map((x) => (
          <li key={x.id} className="flex items-start justify-between gap-3 py-3 text-sm">
            <button className="text-left" onClick={() => { setP(x); setPacking(Array.isArray(x.packing) ? (x.packing as string[]).join(", ") : ""); }}>
              <p className="font-medium">{x.title}</p><p className="text-xs capitalize text-muted-foreground">{x.status} · {x.is_public ? "Public" : "Private"}</p>
            </button>
            <Confirm label="Delete" what={x.title} onConfirm={async () => { if (await run(supabase.from("planned_trips").delete().eq("id", x.id), "Deleted")) refresh("planned_trips"); }} />
          </li>
        ))}
        {data.length === 0 && <li className="py-3 text-sm text-muted-foreground">No plans yet.</li>}
      </ul>
    </div>
  );
}

/* ---------------- Gallery ---------------- */
function GalleryAdmin() {
  const refresh = useRefresh();
  const { data: media = [] } = useQuery(mediaQuery);
  const { data: dests = [] } = useQuery(destinationsQuery);
  const blank: Partial<MediaItem> = { kind: "photo", url: "", is_public: true, is_featured: false };
  const [m, setM] = useState<Partial<MediaItem>>(blank);
  const [videoLink, setVideoLink] = useState("");
  const [busy, setBusy] = useState(false);
  const albums = [...new Set(media.map((x) => x.album).filter(Boolean) as string[])];

  const meta = () => ({
    caption: m.caption?.trim() || null, alt_text: m.alt_text?.trim() || null, location: m.location?.trim() || null,
    place: m.place?.trim() || null, destination_id: m.destination_id || null, album: m.album?.trim() || null,
    taken_on: m.taken_on || null, is_public: m.is_public ?? true, is_featured: !!m.is_featured,
  });
  const clearFeatured = async (except?: string) => {
    let q = supabase.from("media_items").update({ is_featured: false }).eq("is_featured", true);
    if (except) q = q.neq("id", except);
    await q;
  };
  const insert = async (row: { kind: string; url: string; thumbnail_url?: string | null }, quiet = false) => {
    const payload = { ...meta(), ...row };
    if (payload.kind === "photo" && !payload.alt_text) payload.alt_text = payload.caption;
    const { data, error } = await supabase.from("media_items").insert(payload).select("id").single();
    if (error) { toast.error(error.message); return; }
    if (payload.is_featured && data) await clearFeatured(data.id);
    if (!quiet) toast.success("Added to gallery");
    refresh("media_items");
  };
  const saveEdit = async () => {
    if (!m.id) return;
    if (await run(supabase.from("media_items").update(meta()).eq("id", m.id))) {
      if (m.is_featured) await clearFeatured(m.id);
      setM(blank); refresh("media_items");
    }
  };
  const addLink = async () => {
    const embed = toEmbedUrl(videoLink);
    if (!embed) return void toast.error("Paste a YouTube or Vimeo link.");
    await insert({ kind: "embed", url: embed, thumbnail_url: youtubeThumb(embed) });
    setVideoLink("");
  };
  const thumb = (x: MediaItem) => x.kind === "photo" ? x.url : x.thumbnail_url;

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
      <div className="space-y-3 border border-border p-4">
        <p className="font-serif text-lg">{m.id ? "Edit details" : "Add to gallery"}</p>
        <p className="text-xs text-muted-foreground">{m.id ? "Update the details below and save." : "Fill in the details first — they're applied to everything you upload next."}</p>
        <Input placeholder="Caption" value={m.caption ?? ""} onChange={(e) => setM({ ...m, caption: e.target.value })} className="rounded-none" />
        <Input placeholder="Alternative text (describe the photo for screen readers)" value={m.alt_text ?? ""} onChange={(e) => setM({ ...m, alt_text: e.target.value })} className="rounded-none" />
        <div className="grid grid-cols-2 gap-2">
          <select className={sel} value={m.destination_id ?? ""} onChange={(e) => setM({ ...m, destination_id: e.target.value })}><option value="">Country…</option>{dests.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}</select>
          <Input placeholder="City or attraction" value={m.place ?? ""} onChange={(e) => setM({ ...m, place: e.target.value })} className="rounded-none" />
          <Input placeholder="Location (e.g. Hunza Valley)" value={m.location ?? ""} onChange={(e) => setM({ ...m, location: e.target.value })} className="rounded-none" />
          <Input placeholder="Album" list="gallery-albums" value={m.album ?? ""} onChange={(e) => setM({ ...m, album: e.target.value })} className="rounded-none" />
          <datalist id="gallery-albums">{albums.map((a) => <option key={a} value={a} />)}</datalist>
          <Input type="date" aria-label="Date taken" value={m.taken_on ?? ""} onChange={(e) => setM({ ...m, taken_on: e.target.value })} className="rounded-none" />
        </div>
        <label className="flex items-center gap-2 text-sm"><Switch checked={!!m.is_featured} onCheckedChange={(v) => setM({ ...m, is_featured: v })} />Featured image (shown large at the top of the gallery)</label>
        <label className="flex items-center gap-2 text-sm"><Switch checked={m.is_public ?? true} onCheckedChange={(v) => setM({ ...m, is_public: v })} />Visible to the public</label>
        {m.id ? (
          <div className="flex gap-2"><button className={btn} onClick={saveEdit}>Save changes</button><button className={ghost} onClick={() => setM(blank)}>Cancel</button></div>
        ) : (
          <div className="space-y-3 border-t border-border pt-3">
            <div className="flex flex-wrap gap-2">
              <PhotoUploadButton label="Upload photos" multiple folder="gallery" onUploaded={(url) => insert({ kind: "photo", url }, true)} />
              <label className={`${ghost} cursor-pointer`}>
                {busy ? "Uploading video…" : "Upload video (max 50 MB)"}
                <input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" disabled={busy} onChange={async (e) => {
                  const f = e.target.files?.[0]; e.target.value = ""; if (!f) return;
                  setBusy(true); const url = await uploadVideo(f); if (url) await insert({ kind: "video", url }); setBusy(false);
                }} />
              </label>
            </div>
            <div className="flex gap-2">
              <Input placeholder="…or paste a YouTube / Vimeo link" value={videoLink} onChange={(e) => setVideoLink(e.target.value)} className="rounded-none" />
              <button className={btn} onClick={addLink}>Add video</button>
            </div>
          </div>
        )}
      </div>
      <div>
        <p className="mb-3 text-sm text-muted-foreground">{media.length} items · click one to edit</p>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {media.map((x) => (
            <li key={x.id} className={`border ${m.id === x.id ? "border-primary" : "border-border"}`}>
              <button onClick={() => setM(x)} className="block w-full text-left">
                {thumb(x) ? <img src={thumb(x)!} alt={x.alt_text ?? ""} loading="lazy" className="aspect-square w-full object-cover" /> : <span className="flex aspect-square items-center justify-center bg-muted text-xs text-muted-foreground">Video</span>}
                <span className="block truncate px-2 pt-1 text-xs font-medium">{x.caption || "(no caption)"}</span>
                <span className="block px-2 text-[0.65rem] text-muted-foreground">{x.kind}{x.album && ` · ${x.album}`}{x.is_featured && " · ★ featured"}{!x.is_public && " · hidden"}</span>
              </button>
              <div className="px-2 pb-2 pt-1"><Confirm label="Delete" what={x.caption || "this item"} onConfirm={async () => { if (await run(supabase.from("media_items").delete().eq("id", x.id), "Deleted")) refresh("media_items"); }} /></div>
            </li>
          ))}
          {media.length === 0 && <li className="col-span-full text-sm text-muted-foreground">Nothing in the gallery yet.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ---------------- Settings ---------------- */
function SettingsAdmin() {
  const refresh = useRefresh();
  const about = useQuery(settingQuery("about"));
  const social = useQuery(settingQuery("social"));
  const [ab, setAb] = useState<Record<string, string>>({});
  const [so, setSo] = useState<Record<string, string>>({});
  useEffect(() => { if (about.data) setAb(about.data); }, [about.data]);
  useEffect(() => { if (social.data) setSo(social.data); }, [social.data]);
  const saveKey = async (key: string, value: object) => { if (await run(supabase.from("site_settings").upsert({ key, value: value as never }))) refresh("settings"); };

  return (
    <div className="mt-6 grid gap-10 lg:grid-cols-2">
      <div className="space-y-3">
        <p className="font-serif text-xl">About page</p>
        {ABOUT_SECTIONS.map(([k, label]) => (
          <label key={k} className="block text-xs text-muted-foreground">{label}<Textarea value={ab[k] ?? ""} onChange={(e) => setAb({ ...ab, [k]: e.target.value })} className="mt-1 rounded-none text-sm text-foreground" /></label>
        ))}
        <button className={btn} onClick={() => saveKey("about", ab)}>Save About page</button>
      </div>
      <div className="space-y-8">
        <div className="space-y-3">
          <p className="font-serif text-xl">Social & contact</p>
          {["instagram", "youtube", "x", "email"].map((k) => (
            <Input key={k} placeholder={k === "email" ? "Contact email" : `${k} URL`} value={so[k] ?? ""} onChange={(e) => setSo({ ...so, [k]: e.target.value })} className="rounded-none" />
          ))}
          <button className={btn} onClick={() => saveKey("social", so)}>Save links</button>
        </div>

      </div>
    </div>
  );
}

/* ---------------- Export ---------------- */
const TABLES = ["destinations", "destination_visits", "trips", "trip_destinations", "pakistan_wonders", "unesco_sites", "world_wonders", "articles", "planned_trips", "site_settings"] as const;

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0] ?? {});
  const esc = (v: unknown) => { const s = v == null ? "" : typeof v === "object" ? JSON.stringify(v) : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

function ExportAdmin() {
  const refresh = useRefresh();
  const [busy, setBusy] = useState(false);
  const exportAll = async () => {
    setBusy(true);
    const out: Record<string, unknown> = { exported_at: new Date().toISOString() };
    for (const t of TABLES) out[t] = (await supabase.from(t).select("*")).data ?? [];
    download(`markhor-albion-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(out, null, 2), "application/json");
    setBusy(false);
  };
  const exportCsv = async () => {
    const { data: d } = await supabase.from("destinations").select("slug,name,type,continent,capital,iso2");
    const { data: v } = await supabase.from("destination_visits").select("destination_id,status,visit_count,cities_explored,personal_notes,destinations(slug)");
    const bySlug = new Map((v ?? []).map((x) => [(x.destinations as { slug: string } | null)?.slug, x]));
    download("destinations.csv", toCsv((d ?? []).map((x) => ({ ...x, status: bySlug.get(x.slug)?.status ?? "not_visited", visit_count: bySlug.get(x.slug)?.visit_count ?? "", cities: bySlug.get(x.slug)?.cities_explored?.join("; ") ?? "" }))), "text/csv");
  };
  const importCsv = async (file: File) => {
    const text = await file.text();
    const [head = "", ...lines] = text.trim().split(/\r?\n/);
    const cols = head.split(",");
    const iSlug = cols.indexOf("slug"), iStatus = cols.indexOf("status"), iCount = cols.indexOf("visit_count");
    if (iSlug < 0 || iStatus < 0) return void toast.error("CSV needs at least 'slug' and 'status' columns.");
    const { data: d } = await supabase.from("destinations").select("id,slug");
    const ids = new Map((d ?? []).map((x) => [x.slug, x.id]));
    let updated = 0; const missing: string[] = [];
    for (const line of lines) {
      const cells = line.split(",");
      const id = ids.get(cells[iSlug] ?? "");
      if (!id) { missing.push(cells[iSlug] ?? ""); continue; }
      const status = cells[iStatus] as "visited";
      if (!["visited", "planned", "not_visited", "needs_confirmation"].includes(status)) continue;
      const count = iCount >= 0 && cells[iCount]?.trim() ? Number(cells[iCount]) : null;
      const { error } = await supabase.from("destination_visits").upsert({ destination_id: id, status, visit_count: Number.isFinite(count) ? count : null }, { onConflict: "destination_id" });
      if (!error) updated++;
    }
    toast.success(`Updated ${updated} destinations${missing.length ? `. Not found: ${missing.slice(0, 5).join(", ")}` : ""}`);
    refresh("destinations");
  };
  return (
    <div className="mt-6 max-w-2xl space-y-6 text-sm">
      <div className="border border-border p-5">
        <p className="font-serif text-xl">Back up everything</p>
        <p className="mt-2 text-muted-foreground">Downloads every table as a single JSON file. Backups are not automatic — download one regularly and keep it somewhere safe.</p>
        <button disabled={busy} onClick={exportAll} className={`${btn} mt-4`}>{busy ? "Preparing…" : "Download JSON backup"}</button>
      </div>
      <div className="border border-border p-5">
        <p className="font-serif text-xl">Destinations spreadsheet</p>
        <p className="mt-2 text-muted-foreground">Export to CSV, edit status or visit_count, then import it back. Rows are matched by slug, so nothing is duplicated. Leave visit_count blank for unconfirmed.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={exportCsv} className={btn}>Export CSV</button>
          <label className={`${ghost} cursor-pointer`}>Import CSV<input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} /></label>
        </div>
      </div>
    </div>
  );
}
