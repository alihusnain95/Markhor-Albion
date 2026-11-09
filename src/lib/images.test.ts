import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DESTINATION_IMAGES } from "./images";

describe("country landmark coverage", () => {
  const seed = readFileSync("drizzle/migrations/0000_migration.sql", "utf8").split("INSERT INTO public.destinations").slice(1).join("INSERT INTO public.destinations");
  const slugs = [...seed.matchAll(/\('([^']+)','[^']+','(?:sovereign|constituent|territory|sar|disputed)'/g)].map((match) => match[1]);
  for (const slug of new Set(slugs)) {
    it(`has a country-specific photo for ${slug}`, () => {
      expect(DESTINATION_IMAGES[slug ?? ""]).toEqual(expect.any(String));
      expect(DESTINATION_IMAGES[slug ?? ""]?.length).toBeGreaterThan(0);
    });
  }
});