import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const STATIC = ["/", "/my-world", "/passport", "/destinations", "/wonders", "/unesco", "/pakistan-50-wonders", "/journal", "/gallery", "/next-adventure", "/about", "/privacy", "/terms"];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        const urls = [...STATIC];
        try {
          const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
          const sb = createClient(process.env["SUPABASE_URL"]!, key, {
            auth: { persistSession: false, autoRefreshToken: false },
            global: { fetch: (i, init) => { const h = new Headers(init?.headers); if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(i, { ...init, headers: h }); } },
          });
          const [d, a] = await Promise.all([
            sb.from("destinations").select("slug"),
            sb.from("articles").select("slug").eq("status", "published"),
          ]);
          d.data?.forEach((x) => urls.push(`/destinations/${x.slug}`));
          a.data?.forEach((x) => urls.push(`/journal/${x.slug}`));
        } catch (e) {
          console.error("sitemap", e);
        }
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${origin}${u}</loc></url>`).join("\n")}\n</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml", "cache-control": "public, max-age=3600" } });
      },
    },
  },
});
