import { useEffect, useMemo, useRef, useState } from "react";
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { zoom as d3zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { select } from "d3-selection";
import "d3-transition";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import { Minus, Plus, RotateCcw } from "lucide-react";
import type { DestinationWithVisit } from "@/lib/queries";
import { cn } from "@/lib/utils";

type Feat = { key: string; name: string; d: string };

const W = 960;
const H = 500;
const POINT_TYPES = new Set(["constituent", "territory", "sar", "disputed", "other"]);

const COUNTRY_CODES: Record<string, string> = {
  Afghanistan: "AF", Albania: "AL", Algeria: "DZ", Andorra: "AD", Angola: "AO", Argentina: "AR",
  Armenia: "AM", Australia: "AU", Austria: "AT", Azerbaijan: "AZ", Bahrain: "BH", Bangladesh: "BD",
  Belarus: "BY", Belgium: "BE", Belize: "BZ", Bhutan: "BT", Bolivia: "BO", "Bosnia and Herzegovina": "BA",
  Botswana: "BW", Brazil: "BR", Brunei: "BN", Bulgaria: "BG", Cambodia: "KH", Cameroon: "CM",
  Canada: "CA", Chile: "CL", China: "CN", Colombia: "CO", "Costa Rica": "CR", Croatia: "HR",
  Cuba: "CU", Cyprus: "CY", "Northern Cyprus": "CY", "Czech Republic": "CZ", Czechia: "CZ",
  Denmark: "DK", Djibouti: "DJ", "Dominican Republic": "DO", Ecuador: "EC", Egypt: "EG",
  Estonia: "EE", Ethiopia: "ET", Finland: "FI", France: "FR", Georgia: "GE", Germany: "DE",
  Ghana: "GH", Greece: "GR", Guatemala: "GT", Haiti: "HT", Honduras: "HN", "Hong Kong": "HK",
  Hungary: "HU", Iceland: "IS", India: "IN", Indonesia: "ID", Iran: "IR", Iraq: "IQ", Ireland: "IE",
  Israel: "IL", Italy: "IT", Jamaica: "JM", Japan: "JP", Jordan: "JO", Kazakhstan: "KZ",
  Kenya: "KE", Kosovo: "XK", Kuwait: "KW", Kyrgyzstan: "KG", Laos: "LA", Latvia: "LV",
  Lebanon: "LB", Libya: "LY", Liechtenstein: "LI", Lithuania: "LT", Luxembourg: "LU",
  Macau: "MO", Madagascar: "MG", Malaysia: "MY", Maldives: "MV", Malta: "MT", Mauritius: "MU",
  Mexico: "MX", Moldova: "MD", Monaco: "MC", Mongolia: "MN", Montenegro: "ME", Morocco: "MA",
  Myanmar: "MM", Nepal: "NP", Netherlands: "NL", "New Zealand": "NZ", Nicaragua: "NI",
  Nigeria: "NG", "North Korea": "KP", "North Macedonia": "MK", Norway: "NO", Oman: "OM",
  Pakistan: "PK", Panama: "PA", Paraguay: "PY", Peru: "PE", Philippines: "PH", Poland: "PL",
  Portugal: "PT", Qatar: "QA", Romania: "RO", Russia: "RU", Rwanda: "RW", "San Marino": "SM",
  "Saudi Arabia": "SA", Senegal: "SN", Serbia: "RS", Singapore: "SG", Slovakia: "SK",
  Slovenia: "SI", "South Africa": "ZA", "South Korea": "KR", Spain: "ES", "Sri Lanka": "LK",
  Sudan: "SD", Sweden: "SE", Switzerland: "CH", Syria: "SY", Taiwan: "TW", Tajikistan: "TJ",
  Tanzania: "TZ", Thailand: "TH", Tunisia: "TN", Turkey: "TR", Türkiye: "TR", Uganda: "UG",
  Ukraine: "UA", "United Arab Emirates": "AE", UAE: "AE", "United Kingdom": "GB", England: "GB",
  Scotland: "GB", Wales: "GB", "United States": "US", "United States of America": "US",
  Uruguay: "UY", Uzbekistan: "UZ", Venezuela: "VE", Vietnam: "VN", Yemen: "YE", Zambia: "ZM",
  Zimbabwe: "ZW", "Isle of Man": "IM", Gibraltar: "GI",
};

function flagForCountry(name: string) {
  const code = COUNTRY_CODES[name];
  if (!code) return "🌐";
  return String.fromCodePoint(...[...code].map((letter) => letter.charCodeAt(0) + 127397));
}

export interface MapSelection {
  key: string;
  name: string;
  destination: DestinationWithVisit | null;
}

function fillFor(dest: DestinationWithVisit | undefined) {
  if (!dest) return "var(--color-unvisited)";
  if (dest.status === "visited") return "var(--color-primary)";
  if (dest.status === "planned") return "var(--color-planned)";
  return "var(--color-unvisited)";
}

export interface MapArc {
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
}

export interface MapPin {
  name: string;
  lat: number;
  lng: number;
  tone?: "visited" | "planned";
}

/** A gently curved flight path between two projected points. */
function arcD(x1: number, y1: number, x2: number, y2: number) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const dist = Math.hypot(dx, dy);
  const cx = (x1 + x2) / 2 - dy * 0.14;
  const cy = (y1 + y2) / 2 + dx * 0.14 - dist * 0.16;
  return `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`;
}

export function WorldMap({
  destinations,
  onSelect,
  selectedKey,
  interactive = true,
  className,
  focusKey,
  arcs,
  pins,
}: {
  destinations: DestinationWithVisit[];
  onSelect?: (s: MapSelection) => void;
  selectedKey?: string | null;
  interactive?: boolean;
  className?: string;
  focusKey?: string | null;
  arcs?: MapArc[];
  pins?: MapPin[];
}) {
  const [features, setFeatures] = useState<Feat[] | null>(null);
  const [hover, setHover] = useState<{ name: string; x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [k, setK] = useState(1);

  const projection = useMemo(() => geoNaturalEarth1().scale(175).translate([W / 2, H / 2 + 20]), []);

  useEffect(() => {
    let alive = true;
    import("world-atlas/countries-110m.json").then((mod) => {
      const topo = (mod.default ?? mod) as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
      const fc = feature(topo, topo.objects.countries) as unknown as {
        features: { id?: string; properties: { name: string } }[];
      };
      const path = geoPath(projection);
      const out = fc.features
        .filter((f) => f.properties.name !== "Antarctica")
        .map((f) => ({
          key: f.id ?? f.properties.name,
          name: f.properties.name,
          d: path(f as unknown as GeoPermissibleObjects) ?? "",
        }));
      if (alive) setFeatures(out);
    });
    return () => {
      alive = false;
    };
  }, [projection]);

  const byKey = useMemo(() => {
    const m = new Map<string, DestinationWithVisit>();
    for (const d of destinations) if (d.map_key && !POINT_TYPES.has(d.type)) m.set(d.map_key, d);
    // disputed shapes (e.g. N. Cyprus) still colour their own shape
    for (const d of destinations) if (d.map_key && d.type === "disputed") m.set(d.map_key, d);
    return m;
  }, [destinations]);

  const points = useMemo(() => {
    const shapeKeys = new Set(features?.map((f) => f.key) ?? []);
    return destinations
      .filter((d) => d.lat != null && d.lng != null)
      .filter((d) => POINT_TYPES.has(d.type) || !d.map_key || !shapeKeys.has(d.map_key))
      .map((d) => {
        const p = projection([d.lng!, d.lat!]);
        return p ? { d, x: p[0], y: p[1] } : null;
      })
      .filter((x): x is { d: DestinationWithVisit; x: number; y: number } => !!x);
  }, [destinations, features, projection]);

  const arcPaths = useMemo(
    () =>
      (arcs ?? [])
        .map((a, i) => {
          const p1 = projection([a.from.lng, a.from.lat]);
          const p2 = projection([a.to.lng, a.to.lat]);
          if (!p1 || !p2) return null;
          return { key: `${i}-${a.from.lng}-${a.to.lng}`, d: arcD(p1[0], p1[1], p2[0], p2[1]) };
        })
        .filter((x): x is { key: string; d: string } => !!x),
    [arcs, projection],
  );

  const pinMarks = useMemo(
    () =>
      (pins ?? [])
        .map((p) => {
          const xy = projection([p.lng, p.lat]);
          return xy ? { ...p, x: xy[0], y: xy[1] } : null;
        })
        .filter((x): x is MapPin & { x: number; y: number } => !!x),
    [pins, projection],
  );

  useEffect(() => {
    if (!interactive || !svgRef.current || !gRef.current) return;
    const svg = select(svgRef.current);
    const z = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 12])
      .translateExtent([
        [0, 0],
        [W, H],
      ])
      .on("zoom", (e) => {
        gRef.current?.setAttribute("transform", e.transform.toString());
        setK(e.transform.k);
      });
    svg.call(z);
    zoomRef.current = z;
    return () => {
      svg.on(".zoom", null);
    };
  }, [interactive, features]);

  // zoom to a focus destination (e.g. search result)
  useEffect(() => {
    if (!focusKey || !svgRef.current || !zoomRef.current) return;
    const dest = destinations.find((d) => d.slug === focusKey || d.map_key === focusKey);
    if (!dest || dest.lat == null || dest.lng == null) return;
    const p = projection([dest.lng, dest.lat]);
    if (!p) return;
    const scale = 4;
    select(svgRef.current)
      .transition()
      .duration(600)
      .call(zoomRef.current.transform as never, zoomIdentity.translate(W / 2 - p[0] * scale, H / 2 - p[1] * scale).scale(scale));
  }, [focusKey, destinations, projection]);

  const zoomBy = (f: number) => {
    if (svgRef.current && zoomRef.current) select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy as never, f);
  };
  const reset = () => {
    if (svgRef.current && zoomRef.current)
      select(svgRef.current).transition().duration(400).call(zoomRef.current.transform as never, zoomIdentity);
  };

  const handleMove = (e: React.MouseEvent, name: string) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover({ name, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className={cn("relative overflow-hidden bg-ocean", className)}>
      {!features && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">Loading atlas…</div>
      )}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={cn("block h-full w-full", interactive && "cursor-grab touch-none active:cursor-grabbing")}
        role="img"
        aria-label="Interactive world map of visited, planned and unvisited destinations"
        onMouseLeave={() => setHover(null)}
      >
        <g ref={gRef}>
          {features?.map((f) => {
            const dest = byKey.get(f.key);
            const selected = selectedKey === f.key || (dest && selectedKey === dest.slug);
            const needsConf = dest?.status === "needs_confirmation";
            return (
              <path
                key={f.key}
                d={f.d}
                fill={fillFor(dest)}
                stroke={selected ? "var(--color-ice)" : needsConf ? "var(--color-ice)" : "var(--color-ocean)"}
                strokeWidth={(selected ? 1.6 : needsConf ? 0.9 : 0.4) / k}
                strokeDasharray={needsConf && !selected ? `${2 / k} ${2 / k}` : undefined}
                className="transition-[fill-opacity] duration-150 hover:fill-opacity-80"
                style={{ cursor: onSelect ? "pointer" : undefined }}
                onMouseMove={(e) => handleMove(e, dest?.name ?? f.name)}
                onClick={() => onSelect?.({ key: f.key, name: dest?.name ?? f.name, destination: dest ?? null })}
              />
            );
          })}
          {features &&
            points.map(({ d, x, y }) => {
              const selected = selectedKey === d.slug;
              return (
                <g
                  key={d.id}
                  transform={`translate(${x},${y})`}
                  style={{ cursor: onSelect ? "pointer" : undefined }}
                  onMouseMove={(e) => handleMove(e, d.name)}
                  onClick={() => onSelect?.({ key: d.slug, name: d.name, destination: d })}
                >
                  <circle r={9 / Math.sqrt(k)} fill="transparent" />
                  {selected && <circle r={8 / Math.sqrt(k)} fill="none" stroke="var(--color-ice)" strokeWidth={1.2 / k} />}
                  <circle
                    r={(selected ? 4.5 : 3.4) / Math.sqrt(k)}
                    fill={fillFor(d)}
                    stroke={d.status === "visited" ? "var(--color-background)" : "var(--color-ice)"}
                    strokeWidth={1 / k}
                  />
                </g>
              );
            })}
          {arcPaths.map((a) => (
            <path
              key={a.key}
              d={a.d}
              fill="none"
              stroke="var(--color-ice)"
              strokeOpacity={0.6}
              strokeWidth={0.9 / k}
              strokeDasharray={`${3 / k} ${2.5 / k}`}
              strokeLinecap="round"
            />
          ))}
          {pinMarks.map((p) => (
            <g key={p.name} transform={`translate(${p.x},${p.y})`}>
              <circle
                r={3.2 / Math.sqrt(k)}
                fill={p.tone === "planned" ? "var(--color-planned)" : "var(--color-primary)"}
                stroke="var(--color-background)"
                strokeWidth={0.8 / k}
              />
              <text
                x={5 / Math.sqrt(k)}
                y={3 / Math.sqrt(k)}
                fontSize={9 / Math.sqrt(k)}
                fill="var(--color-foreground)"
                fillOpacity={0.85}
                style={{ paintOrder: "stroke", stroke: "var(--color-ocean)", strokeWidth: 2.5 / k, letterSpacing: "0.06em" }}
              >
                {p.name}
              </text>
            </g>
          ))}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full border border-border bg-popover px-2.5 py-1 text-xs font-medium text-popover-foreground shadow-lg"
          style={{ left: hover.x, top: hover.y - 10 }}
        >
          <span className="mr-1.5 text-sm leading-none" aria-hidden="true">{flagForCountry(hover.name)}</span>
          <span>{hover.name}</span>
        </div>
      )}

      {interactive && (
        <div className="absolute right-3 top-3 flex flex-col border border-border bg-card/90 backdrop-blur">
          <button aria-label="Zoom in" onClick={() => zoomBy(1.6)} className="p-2 hover:bg-accent">
            <Plus className="h-4 w-4" />
          </button>
          <button aria-label="Zoom out" onClick={() => zoomBy(1 / 1.6)} className="border-t border-border p-2 hover:bg-accent">
            <Minus className="h-4 w-4" />
          </button>
          <button aria-label="Reset map view" onClick={reset} className="border-t border-border p-2 hover:bg-accent">
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

export function MapLegend({ className }: { className?: string }) {
  const items = [
    { label: "Visited", el: <span className="h-3 w-3 bg-primary" /> },
    { label: "Planned", el: <span className="h-3 w-3 bg-planned" /> },
    { label: "Not yet visited", el: <span className="h-3 w-3 bg-unvisited" /> },
    { label: "Needs confirmation", el: <span className="h-3 w-3 border border-dashed border-ice" /> },
    { label: "Sub-national / small destination", el: <span className="h-2.5 w-2.5 rounded-full bg-primary" /> },
  ];
  return (
    <ul className={cn("flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground", className)}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-2">
          {i.el}
          {i.label}
        </li>
      ))}
    </ul>
  );
}
