import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader } from "@/components/status-badge";
import { settingQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Markhor Albion" },
      { name: "description", content: "Who is behind Markhor Albion, and why travel matters." },
      { property: "og:title", content: "About Markhor Albion" },
      { property: "og:description", content: "Beyond Borders. Beyond the Ordinary." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

export const ABOUT_SECTIONS: [string, string][] = [
  ["who_i_am", "Who I am"],
  ["why_i_travel", "Why I travel"],
  ["what_travel_means", "What travel means to me"],
  ["cultural_discoveries", "Cultural discoveries"],
  ["architecture", "Architecture and historical places"],
  ["personal_experiences", "Personal experiences"],
  ["life_beyond_work", "Life beyond work"],
  ["future_ambitions", "Future ambitions"],
  ["favourite_destinations", "Favourite destinations"],
];

function About() {
  const { data } = useQuery(settingQuery("about"));
  const filled = ABOUT_SECTIONS.filter(([k]) => data?.[k]?.trim());
  return (
    <>
      <PageHeader eyebrow="About Markhor Albion" title="Beyond Borders. Beyond the Ordinary." intro="The world is bigger than the life we know." />
      <section className="container-page max-w-3xl py-14">
        {filled.length === 0 ? (
          <p className="text-muted-foreground">This page is waiting for its story, in the owner's own words. Every section — who I am, why I travel, favourite destinations and more — is written from the admin dashboard.</p>
        ) : (
          <div className="space-y-14">
            {filled.map(([k, label]) => (
              <section key={k}>
                <h2 className="eyebrow">{label}</h2>
                <p className="mt-4 whitespace-pre-line font-serif text-xl font-light leading-relaxed md:text-2xl">{data![k]}</p>
              </section>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
