/** Turns a YouTube or Vimeo link into a privacy-friendly embed URL; null when not recognised. */
export function toEmbedUrl(input: string): string | null {
  let u: URL;
  try { u = new URL(input.trim()); } catch { return null; }
  const host = u.hostname.replace(/^www\.|^m\./, "");
  let id: string | null = null;
  if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0] ?? null;
  else if (host === "youtube.com" || host === "youtube-nocookie.com") {
    if (u.pathname === "/watch") id = u.searchParams.get("v");
    else { const m = u.pathname.match(/^\/(embed|shorts|live)\/([\w-]+)/); id = m?.[2] ?? null; }
  }
  if (id && /^[\w-]{6,20}$/.test(id)) return `https://www.youtube-nocookie.com/embed/${id}`;
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(\d{6,12})/);
    if (m) return `https://player.vimeo.com/video/${m[1]}`;
  }
  return null;
}

export function youtubeThumb(embed: string): string | null {
  const m = embed.match(/youtube-nocookie\.com\/embed\/([\w-]+)/);
  return m ? `https://i.ytimg.com/vi/${m[1]}/hqdefault.jpg` : null;
}
