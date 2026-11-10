import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { HomeTop } from "@/components/home-top";
import { destinationsQuery, plansQuery, tripsQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Markhor Albion — Beyond Borders. Beyond the Ordinary." },
      { name: "description", content: "A personal travel atlas: an interactive map of explored destinations, a travel passport, world wonders, UNESCO sites and Pakistan's 50 wonders." },
      { property: "og:title", content: "Markhor Albion — Beyond Borders. Beyond the Ordinary." },
      { property: "og:description", content: "A personal record of the places explored, the cultures discovered and the extraordinary experiences that make the world worth exploring." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const dests = useQuery(destinationsQuery).data ?? [];
  const plans = useQuery(plansQuery).data ?? [];
  const trips = useQuery(tripsQuery).data ?? [];
  const upcoming = plans.filter((p) => p.status !== "completed");

  return <HomeTop dests={dests} plans={upcoming} trips={trips} />;
}
