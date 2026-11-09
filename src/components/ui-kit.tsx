import type { ReactNode } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { flagUrl } from "@/lib/images";

export function Flag({ iso2, slug, emoji, className }: { iso2?: string | null; slug?: string; emoji?: string | null; className?: string }) {
  const url = flagUrl(iso2, slug);
  if (!url) return <span className={cn("inline-flex items-center justify-center bg-muted text-xs", className)}>{emoji ?? "◌"}</span>;
  return <img src={url} alt="" loading="lazy" className={cn("object-cover shadow-sm", className)} />;
}

export function Chips<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2" role="group">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
            value === o.value ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder, className }: { value: string; onChange: (v: string) => void; placeholder: string; className?: string }) {
  return (
    <label className={cn("relative block", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </label>
  );
}

export function Select({ value, onChange, children, label }: { value: string; onChange: (v: string) => void; children: ReactNode; label: string }) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-10 rounded-md border border-border bg-card px-3 text-sm focus:border-primary focus:outline-none">
      {children}
    </select>
  );
}

export function PageTitle({ title, intro, action }: { title: string; intro?: string; action?: ReactNode }) {
  return (
    <div className="container-page grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 pb-6 pt-24 md:pt-28">
      <div className="min-w-0">
        <h1 className="font-serif text-3xl font-normal md:text-4xl">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{intro}</p>}
      </div>
      {action}
    </div>
  );
}

/** Photo card; without a photo it shows a quiet gradient tile with the label initial. */
export function PhotoCard({ image, title, subtitle, badge, className, aspect = "aspect-[4/3]" }: { image?: string | null | undefined; title: string; subtitle?: string | undefined; badge?: ReactNode; className?: string | undefined; aspect?: string | undefined }) {
  return (
    <div className={cn("group overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/60", className)}>
      <div className={cn("relative overflow-hidden", aspect)}>
        {image ? (
          <img src={image} alt={title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-secondary to-background">
            <span className="font-serif text-4xl text-muted-foreground/50">{title.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-semibold">{title}</p>
        {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
        {badge && <div className="mt-2">{badge}</div>}
      </div>
    </div>
  );
}

export function StatTile({ icon, value, label, sub }: { icon: ReactNode; value: ReactNode; label: string; sub?: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-ice">{icon}</span>
      <div className="min-w-0">
        <p className="font-serif text-2xl leading-none tabular-nums">{value}</p>
        <p className="mt-1 text-xs leading-tight text-muted-foreground">{label}</p>
        {sub && <p className="truncate text-[0.65rem] text-muted-foreground/70">{sub}</p>}
      </div>
    </div>
  );
}
