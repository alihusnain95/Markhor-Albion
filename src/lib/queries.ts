import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { DEFAULT_COUNTING, type CountingSettings, type VisitStatus } from "./stats";

export type Destination = Database["public"]["Tables"]["destinations"]["Row"];
export type DestinationVisit = Database["public"]["Tables"]["destination_visits"]["Row"];
export type PakistanWonder = Database["public"]["Tables"]["pakistan_wonders"]["Row"];
export type UnescoSite = Database["public"]["Tables"]["unesco_sites"]["Row"];
export type WorldWonder = Database["public"]["Tables"]["world_wonders"]["Row"];
export type Article = Database["public"]["Tables"]["articles"]["Row"];
export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type PlannedTrip = Database["public"]["Tables"]["planned_trips"]["Row"];

export type DestinationWithVisit = Destination & {
  visit: DestinationVisit | null;
  status: VisitStatus;
  visit_count: number | null;
};

function must<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export const destinationsQuery = queryOptions({
  queryKey: ["destinations"],
  queryFn: async (): Promise<DestinationWithVisit[]> => {
    const [d, v] = await Promise.all([
      supabase.from("destinations").select("*").order("name"),
      supabase.from("destination_visits").select("*"),
    ]);
    const dests = must(d);
    const visits = must(v);
    const byDest = new Map(visits.map((x) => [x.destination_id, x]));
    return dests.map((x) => {
      const visit = byDest.get(x.id) ?? null;
      return { ...x, visit, status: (visit?.status ?? "not_visited") as VisitStatus, visit_count: visit?.visit_count ?? null };
    });
  },
});

export const countingQuery = queryOptions({
  queryKey: ["settings", "counting"],
  queryFn: async (): Promise<CountingSettings> => {
    const r = await supabase.from("site_settings").select("value").eq("key", "counting").maybeSingle();
    return { ...DEFAULT_COUNTING, ...((r.data?.value as Partial<CountingSettings>) ?? {}) };
  },
});

export const settingQuery = (key: string) =>
  queryOptions({
    queryKey: ["settings", key],
    queryFn: async () => {
      const r = await supabase.from("site_settings").select("value").eq("key", key).maybeSingle();
      return (r.data?.value ?? {}) as Record<string, string>;
    },
  });

export const pakistanWondersQuery = queryOptions({
  queryKey: ["pakistan_wonders"],
  queryFn: async () => must(await supabase.from("pakistan_wonders").select("*").order("sort_order")),
});

export const unescoQuery = queryOptions({
  queryKey: ["unesco_sites"],
  queryFn: async () => must(await supabase.from("unesco_sites").select("*").order("year_inscribed")),
});

export const worldWondersQuery = queryOptions({
  queryKey: ["world_wonders"],
  queryFn: async () => must(await supabase.from("world_wonders").select("*").order("sort_order")),
});

export const articlesQuery = queryOptions({
  queryKey: ["articles", "published"],
  queryFn: async () =>
    must(await supabase.from("articles").select("*").eq("status", "published").order("published_at", { ascending: false })),
});

export const articleQuery = (slug: string) =>
  queryOptions({
    queryKey: ["article", slug],
    queryFn: async (): Promise<Article | null> => { const r = await supabase.from("articles").select("*").eq("slug", slug).maybeSingle(); if (r.error) throw new Error(r.error.message); return r.data; },
  });

export const tripsQuery = queryOptions({
  queryKey: ["trips"],
  queryFn: async () => {
    const [t, td] = await Promise.all([
      supabase.from("trips").select("*").order("start_date", { ascending: false, nullsFirst: false }),
      supabase.from("trip_destinations").select("*"),
    ]);
    const links = must(td);
    return must(t).map((trip) => ({
      ...trip,
      destination_ids: links.filter((l) => l.trip_id === trip.id).map((l) => l.destination_id),
    }));
  },
});

export type PublicPlannedTrip = Pick<PlannedTrip, "id" | "destination_id" | "intended_start" | "intended_end" | "status">;

export const publicPlansQuery = queryOptions({
  queryKey: ["public_planned_trips"],
  queryFn: async (): Promise<PublicPlannedTrip[]> =>
    must(await (supabase as any).from("public_planned_trips").select("id,destination_id,intended_start,intended_end,status").order("intended_start", { nullsFirst: false })),
});

// Full itinerary fields are reserved for the authenticated admin dashboard.
export const plansQuery = queryOptions({
  queryKey: ["planned_trips"],
  queryFn: async () => must(await supabase.from("planned_trips").select("*").order("intended_start", { nullsFirst: false })),
});

export const STATUS_LABEL: Record<string, string> = {
  visited: "Visited",
  completed: "Completed",
  planned: "Planned",
  not_visited: "Not yet visited",
  needs_confirmation: "Needs confirmation",
  not_confirmed: "Not yet confirmed",
};

export const TYPE_LABEL: Record<string, string> = {
  sovereign: "Country",
  constituent: "Country",
  territory: "Country",
  sar: "Country",
  disputed: "Country",
  other: "Country",
};

export type MediaItem = Database["public"]["Tables"]["media_items"]["Row"];
export const mediaQuery = queryOptions({
  queryKey: ["media_items"],
  queryFn: async () => must(await supabase.from("media_items").select("*").order("is_featured", { ascending: false }).order("sort_order").order("created_at", { ascending: false })),
});
