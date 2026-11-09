import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

// Serves journal photos from private storage so <img> tags can load them.
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!/^[\w\-./]+$/.test(path) || path.includes("..")) return new Response("Not found", { status: 404 });
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const sb = createClient(process.env["SUPABASE_URL"]!, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: { fetch: (i, init) => { const h = new Headers(init?.headers); if (h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(i, { ...init, headers: h }); } },
        });
        const { data, error } = await sb.storage.from("journal-media").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });
        return new Response(data, { headers: { "content-type": data.type || "application/octet-stream", "cache-control": "public, max-age=31536000, immutable" } });
      },
    },
  },
});
