export type DestinationType = "sovereign" | "constituent" | "territory" | "sar" | "disputed" | "other";
export type VisitStatus = "visited" | "planned" | "not_visited" | "needs_confirmation";

export interface StatDestination {
  id: string;
  type: DestinationType;
  continent: string | null;
  parent_id: string | null;
  slug: string;
  status: VisitStatus;
  visit_count: number | null;
}

/** Legacy settings are retained for compatibility with existing saved settings. */
export interface CountingSettings {
  count_disputed_as_sovereign: boolean;
  count_uk_via_constituents: boolean;
}

export const DEFAULT_COUNTING: CountingSettings = {
  count_disputed_as_sovereign: false,
  count_uk_via_constituents: true,
};

export interface TravelStats {
  countriesVisited: number;
  destinationsTracked: number;
  continents: string[];
  planned: number;
  unconfirmedCounts: number;
  knownVisitTotal: number;
}

/** Every separately flagged destination is one country in this personal travel count. */
export function computeTravelStats(
  destinations: StatDestination[],
  _settings: CountingSettings = DEFAULT_COUNTING,
): TravelStats {
  const unique = new Map(destinations.map((d) => [d.id, d]));
  const all = [...unique.values()];
  const visited = all.filter((d) => d.status === "visited");

  return {
    countriesVisited: visited.length,
    destinationsTracked: visited.length,
    continents: [...new Set(visited.map((d) => d.continent).filter((c): c is string => !!c))].sort(),
    planned: all.filter((d) => d.status === "planned").length,
    unconfirmedCounts: visited.filter((d) => d.visit_count == null).length,
    knownVisitTotal: visited.reduce((s, d) => s + (d.visit_count ?? 0), 0),
  };
}

/** A countdown is only valid for a real date strictly in the future. */
export function daysUntil(date: string | null | undefined, now: Date = new Date()): number | null {
  if (!date) return null;
  const target = new Date(date + "T00:00:00");
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((target.getTime() - today.getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

export function readingTime(text: string | null | undefined): number {
  const words = (text ?? "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}
