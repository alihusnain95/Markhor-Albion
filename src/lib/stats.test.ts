import { describe, expect, it } from "vitest";
import { computeTravelStats, daysUntil, type StatDestination } from "./stats";

const d = (id: string, type: StatDestination["type"], status: StatDestination["status"], extra: Partial<StatDestination> = {}): StatDestination => ({
  id, slug: id, type, status, continent: "Europe", parent_id: null, visit_count: null, ...extra,
});

describe("personal country count", () => {
  const places = [
    d("china", "sovereign", "visited", { continent: "Asia" }),
    d("hong-kong", "sar", "visited", { continent: "Asia", parent_id: "china" }),
    d("macau", "sar", "visited", { continent: "Asia", parent_id: "china" }),
    d("gibraltar", "territory", "visited"),
    d("england", "constituent", "visited", { parent_id: "uk" }),
    d("northern-cyprus", "disputed", "visited"),
    d("japan", "sovereign", "planned", { continent: "Asia" }),
    d("uk", "sovereign", "not_visited"),
  ];

  it("counts every separately flagged visited place as one country", () => {
    expect(computeTravelStats(places).countriesVisited).toBe(6);
  });

  it("counts Hong Kong and Macau separately from China", () => {
    expect(computeTravelStats(places.slice(0, 3)).countriesVisited).toBe(3);
  });

  it("does not count planned or unvisited destinations", () => {
    const s = computeTravelStats(places);
    expect(s.planned).toBe(1);
    expect(s.continents).toEqual(["Asia", "Europe"]);
  });

  it("does not double-count duplicate records", () => {
    expect(computeTravelStats([...places, places[0]!]).countriesVisited).toBe(6);
  });
});

describe("countdown", () => {
  const now = new Date(2026, 9, 28);
  it("shows days only for a future date", () => {
    expect(daysUntil("2026-11-07", now)).toBe(10);
    expect(daysUntil("2026-10-28", now)).toBeNull();
    expect(daysUntil("2025-01-01", now)).toBeNull();
    expect(daysUntil("not-a-date", now)).toBeNull();
  });
});
