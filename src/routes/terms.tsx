import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-badge";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Use | Markhor Albion" },
      { name: "description", content: "Terms for using the Markhor Albion website." },
      { property: "og:title", content: "Terms of Use | Markhor Albion" },
      { property: "og:description", content: "Terms for using the Markhor Albion website." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="Legal" title="Terms of use" />
      <section className="container-page max-w-3xl space-y-5 py-14 text-muted-foreground">
        <p>All writing and photography on Markhor Albion belongs to its author unless stated otherwise. Please ask before reusing it.</p>
        <p>Travel information is shared in good faith from personal experience. Always check official sources before travelling.</p>
        <p className="text-sm">This is a starting template. Please review and adapt it before launch.</p>
      </section>
    </>
  ),
});
