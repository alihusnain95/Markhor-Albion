import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/status-badge";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy | Markhor Albion" },
      { name: "description", content: "How Markhor Albion handles information." },
      { property: "og:title", content: "Privacy Policy | Markhor Albion" },
      { property: "og:description", content: "How Markhor Albion handles information." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <>
      <PageHeader eyebrow="Legal" title="Privacy policy" />
      <section className="container-page max-w-3xl space-y-5 py-14 text-muted-foreground">
        <p>This is a personal travel website. Visitors can read it without creating an account, and no advertising or tracking cookies are set by the site itself.</p>
        <p>Only the site owner signs in, to manage content. Sign-in details are handled by the hosting provider's secure authentication service.</p>
        <p>Embedded videos (for example from YouTube or Vimeo) may set their own cookies under those providers' policies.</p>
        <p className="text-sm">This is a starting template. Please review and adapt it to your circumstances before launch.</p>
      </section>
    </>
  ),
});
