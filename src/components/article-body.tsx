/** Minimal, safe text renderer: blank-line paragraphs, "## " headings, "> " quotes, ![alt](url) images, YouTube/Vimeo links on their own line become embeds. */
export function ArticleBody({ body }: { body: string }) {
  const blocks = body.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className="space-y-6 text-lg leading-[1.8]">
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) return <h2 key={i} className="pt-6 font-serif text-3xl font-light">{b.slice(3)}</h2>;
        if (b.startsWith("> ")) return <blockquote key={i} className="border-l-2 border-primary pl-6 font-serif text-2xl italic">{b.slice(2)}</blockquote>;
        const img = b.match(/^!\[(.*?)\]\(((?:https?:\/\/|\/api\/public\/media\/)[^\s)]+)\)$/);
        if (img) return <figure key={i}><img src={img[2]} alt={img[1]} loading="lazy" className="w-full" />{img[1] && <figcaption className="mt-2 text-sm text-muted-foreground">{img[1]}</figcaption>}</figure>;
        const yt = b.match(/^https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
        if (yt) return <div key={i} className="aspect-video"><iframe className="h-full w-full" src={`https://www.youtube-nocookie.com/embed/${yt[1]}`} title="Video" allowFullScreen loading="lazy" /></div>;
        const vm = b.match(/^https?:\/\/(?:www\.)?vimeo\.com\/(\d+)/);
        if (vm) return <div key={i} className="aspect-video"><iframe className="h-full w-full" src={`https://player.vimeo.com/video/${vm[1]}`} title="Video" allowFullScreen loading="lazy" /></div>;
        return <p key={i} className="whitespace-pre-line">{b}</p>;
      })}
    </div>
  );
}
