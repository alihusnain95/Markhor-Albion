import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/queries";

const STYLES: Record<string, string> = {
  visited: "bg-primary/20 text-ice border-primary/50",
  completed: "bg-primary/20 text-ice border-primary/50",
  planned: "bg-planned/20 text-planned border-planned/50",
  needs_confirmation: "bg-planned/10 text-planned border-dashed border-planned/50",
  not_confirmed: "bg-muted text-muted-foreground border-border",
  not_visited: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[0.68rem] font-semibold",
        STYLES[status] ?? STYLES["not_visited"],
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "visited" || status === "completed"
            ? "bg-primary"
            : status === "planned"
              ? "bg-planned"
              : "bg-muted-foreground/60",
        )}
      />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <header className="border-b border-border">
      <div className="container-page pb-12 pt-32 md:pb-16 md:pt-40">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-4xl font-serif text-4xl font-light leading-[1.05] md:text-6xl">{title}</h1>
        {intro && <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">{intro}</p>}
      </div>
    </header>
  );
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-dashed border-border px-6 py-12 text-center">
      <p className="font-serif text-xl">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

export function LoadingRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 animate-pulse bg-muted" />
      ))}
    </div>
  );
}
