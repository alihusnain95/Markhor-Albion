import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Mountain, Search, User, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { destinationsQuery, plansQuery } from "@/lib/queries";
import { useAuth } from "@/hooks/use-auth";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

/** Every page on the site — used by the footer and the command palette. */
export const NAV = [
  { to: "/", label: "Home" },
  { to: "/my-world", label: "My World" },
  { to: "/passport", label: "Travel Timeline" },
  { to: "/gallery", label: "Beyond Travel" },
  { to: "/journal", label: "Articles" },
  { to: "/next-adventure", label: "Next Adventure" },
  { to: "/wonders", label: "Wonders" },
  { to: "/unesco", label: "UNESCO" },
  { to: "/pakistan-50-wonders", label: "Pakistan: 50 Wonders" },
  { to: "/about", label: "About" },
] as const;

const HEADER = [
  { to: "/", label: "Home", exact: true },
  { to: "/my-world", label: "My World", exact: false },
  { to: "/passport", label: "Travel Timeline", exact: false },
  { to: "/journal", label: "Diaries", exact: false },
] as const;

function linkCls(active: boolean) {
  return cn(
    "relative py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] transition-colors 2xl:text-[0.8rem]",
    active ? "text-foreground after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:bg-primary" : "text-muted-foreground hover:text-foreground",
  );
}

function SiteSearch({ open, setOpen }: { open: boolean; setOpen: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { data } = useQuery({ ...destinationsQuery, enabled: open });
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);
  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search places and stories…" />
      <CommandList>
        <CommandEmpty>No results.</CommandEmpty>
        <CommandGroup heading="Pages">
          {NAV.map((n) => (
            <CommandItem key={n.to} onSelect={() => { setOpen(false); navigate({ to: n.to }); }}>
              {n.label}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Destinations">
          {data?.map((d) => (
            <CommandItem
              key={d.id}
              value={d.name}
              onSelect={() => { setOpen(false); navigate({ to: "/destinations/$slug", params: { slug: d.slug } }); }}
            >
              <span className="mr-2">{d.flag}</span>
              {d.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

function TripAlerts() {
  const { data: plans = [] } = useQuery(plansQuery);
  const upcoming = plans.filter((p) => p.intended_start && new Date(p.intended_start) >= new Date("2026-01-01")).slice(0, 4);
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" }).toUpperCase();
  return (
    <Popover>
      <PopoverTrigger aria-label="Upcoming trips" className="relative p-2 text-muted-foreground transition-colors hover:text-foreground">
        <Bell className="h-4 w-4" />
        {upcoming.length > 0 && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 border-border bg-popover p-4 text-popover-foreground">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-ice">Upcoming</p>
        {upcoming.length === 0 ? (
          <p className="mt-3 text-xs text-muted-foreground">No trips are on the calendar yet.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {upcoming.map((p) => (
              <li key={p.id} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="truncate font-medium">{p.title}</span>
                <span className="shrink-0 tracking-widest text-muted-foreground">{fmt(p.intended_start!)}</span>
              </li>
            ))}
          </ul>
        )}
        <Link to="/next-adventure" className="mt-4 block text-xs text-ice hover:underline">View all plans</Link>
      </PopoverContent>
    </Popover>
  );
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { user } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const searchStr = useRouterState({ select: (s) => s.location.searchStr ?? "" });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (to: string, exact: boolean) => {
    return exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
  };

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled ? "border-b border-border bg-background/90 backdrop-blur-md" : "bg-gradient-to-b from-background/70 to-transparent",
      )}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="Markhor Albion home">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-ice/50 text-ice">
            <Mountain className="h-3.5 w-3.5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-base tracking-[0.18em]">MARKHOR ALBION</span>
            <span className="mt-1 hidden text-[0.5rem] font-semibold uppercase tracking-[0.3em] text-muted-foreground sm:block">
              Places · People · Purpose
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-5 whitespace-nowrap xl:flex 2xl:gap-7">
          {HEADER.map((n) => (
            <Link key={n.to} to={n.to} className={linkCls(isActive(n.to, n.exact))} activeOptions={{ exact: n.exact }}>
              {n.label}
            </Link>
          ))}
          <Link to="/about" className={linkCls(isActive("/about", false))}>About</Link>
        </nav>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setSearchOpen(true)}
            className="mr-2 hidden items-center gap-2 rounded-full border border-border bg-card/70 px-4 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/60 hover:text-foreground lg:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search places and stories…</span>
          </button>
          <button onClick={() => setSearchOpen(true)} aria-label="Search" className="p-2 text-muted-foreground hover:text-foreground lg:hidden">
            <Search className="h-4 w-4" />
          </button>
          <TripAlerts />
          {user ? (
            <Link
              to="/admin"
              aria-label="Your dashboard"
              className="ml-1 flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <User className="h-4 w-4" />
            </Link>
          ) : null}
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="p-2 xl:hidden">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full max-w-sm border-border bg-background p-0 [&>button]:hidden">
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <SheetTitle className="font-serif text-lg tracking-[0.18em]">MARKHOR ALBION</SheetTitle>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-2">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav aria-label="Mobile" className="flex flex-col px-6 py-4">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.to === "/" }}
                className="border-b border-border py-3.5 font-serif text-xl text-muted-foreground data-[status=active]:text-primary"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <SiteSearch open={searchOpen} setOpen={setSearchOpen} />
    </header>
  );
}
