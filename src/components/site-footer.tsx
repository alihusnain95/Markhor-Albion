import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Instagram } from "lucide-react";
import { settingQuery } from "@/lib/queries";
import { useAuth } from "@/hooks/use-auth";
import { NAV } from "./site-header";

export function SiteFooter() {
  const { user } = useAuth();
  const { data: social } = useQuery(settingQuery("social"));
  const links = [
    { label: "Instagram", url: "https://www.instagram.com/alihusnain95/" },
    { label: "YouTube", url: social?.["youtube"] },
    { label: "X", url: social?.["x"] },
  ].filter((l) => !!l.url);

  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="font-serif text-2xl tracking-[0.18em]">MARKHOR ALBION</p>
          <p className="mt-3 font-serif text-lg italic text-muted-foreground">Beyond Borders. Beyond the Ordinary.</p>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            A personal travel atlas and journal. Every figure on this site is calculated from recorded travel data.
          </p>
        </div>
        <nav aria-label="Footer">
          <p className="eyebrow mb-4">Explore</p>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="text-muted-foreground hover:text-foreground">{n.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-4">Connect</p>
          <ul className="space-y-2 text-sm">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                  {l.label === "Instagram" ? <Instagram size={16} aria-hidden="true" /> : null}
                  {l.label}
                </a>
              </li>
            ))}
            {social?.["email"] ? (
              <li><a href={`mailto:${social["email"]}`} className="text-muted-foreground hover:text-foreground">Contact</a></li>
            ) : null}
            {links.length === 0 && !social?.["email"] && (
              <li className="text-muted-foreground/70">Social links and contact details can be added from the admin dashboard.</li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-3 py-6 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Markhor Albion. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy" className="hover:text-foreground">Privacy policy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms of use</Link>
            {user ? (
              <Link to="/admin" className="hover:text-foreground">Admin</Link>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
