import { describe, expect, it } from "vitest";
import { computeTravelStats, daysUntil, type StatDestination } from "./stats";

const d = (id: string, type: StatDestination["type"], status: StatDestination["status"], extra: Partial<StatDestination> = {}): StatDestination => ({
  id, slug: id, type, status, continent: "Europe", parent_id: null, visit_count: null, ...extra,
});

describe("travel stats", () => {
  const uk = d("uk", "sovereign", "not_visited");
  const base = [
    uk,
    d("england", "constituent", "visited", { parent_id: "uk" }),
    d("scotland", "constituent", "visited", { parent_id: "uk" }),
    d("poland", "sovereign", "visited", { visit_count: 7 }),
    d("gibraltar", "territory", "visited"),
    d("hong-kong", "sar", "not_visited", { continent: "Asia" }),
    d("northern-cyprus", "disputed", "visited"),
    d("japan", "sovereign", "planned", { continent: "Asia" }),
  ];

  it("counts the UK once via its constituent countries", () => {
    expect(computeTravelStats(base).sovereign).toBe(2); // UK + Poland
  });

  it("tracks England and Scotland separately from sovereign states", () => {
    expect(computeTravelStats(base).constituentAndTerritories).toBe(3); // England, Scotland, Gibraltar
  });

  it("does not count a disputed territory as sovereign by default", () => {
    const s = computeTravelStats(base);
    expect(s.otherTracked).toBe(1);
    expect(computeTravelStats(base, { count_disputed_as_sovereign: true, count_uk_via_constituents: true }).sovereign).toBe(3);
  });

  it("never counts planned destinations as visited", () => {
    const s = computeTravelStats(base);
    expect(s.planned).toBe(1);
    expect(s.continents).toEqual(["Europe"]);
  });

  it("does not assume an unknown visit count is one", () => {
    const s = computeTravelStats(base);
    expect(s.knownVisitTotal).toBe(7);
    expect(s.unconfirmedCounts).toBe(4);
  });

  it("does not double-count duplicate records", () => {
    expect(computeTravelStats([...base, base[3]!]).destinationsTracked).toBe(5);
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
