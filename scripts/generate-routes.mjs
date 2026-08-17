// Fetches real road geometry from OSRM once and writes it into the repo as
// static data, so the running app never calls a routing service.
import fs from "node:fs";

const PLACES = {
  stellenboschQuarry: { name: "Boland Quarry, Stellenbosch", lon: 18.8602, lat: -33.9321 },
  hermanusIndustria: { name: "Industria Road, Hermanus", lon: 19.2345, lat: -34.4187 },
  caledonDepot: { name: "Caledon Depot", lon: 19.4259, lat: -34.2306 },
  kleinmondMarine: { name: "Marine Drive, Kleinmond", lon: 19.0234, lat: -34.3373 },
  capeTownHarbour: { name: "Cape Town Harbour", lon: 18.4239, lat: -33.9036 },
  hermanusMagnolia: { name: "Magnolia Avenue, Hermanus", lon: 19.2402, lat: -34.4098 },
  somersetWest: { name: "Main Road, Somerset West", lon: 18.854, lat: -34.0784 },
  gansbaaiHarbour: { name: "Harbour Road, Gansbaai", lon: 19.3518, lat: -34.5806 },
  stellenboschR44: { name: "R44 Industrial Park, Stellenbosch", lon: 18.8489, lat: -33.9489 },
};

const ROUTES = [
  ["R1", "stellenboschQuarry", "hermanusIndustria"],
  ["R2", "caledonDepot", "kleinmondMarine"],
  ["R3", "capeTownHarbour", "hermanusMagnolia"],
  ["R4", "stellenboschQuarry", "somersetWest"],
  ["R5", "gansbaaiHarbour", "stellenboschR44"],
  ["R6", "hermanusIndustria", "capeTownHarbour"],
];

// Perpendicular distance from p to the segment a-b, in degrees.
function perpDistance(p, a, b) {
  const [x, y] = p;
  const [x1, y1] = a;
  const [x2, y2] = b;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return Math.hypot(x - x1, y - y1);
  const t = Math.max(0, Math.min(1, ((x - x1) * dx + (y - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (x1 + t * dx), y - (y1 + t * dy));
}

// Douglas-Peucker. OSRM returns a point every few metres; at the zoom levels
// this map uses that detail is invisible but would triple the bundle.
function simplify(points, tolerance) {
  if (points.length < 3) return points;
  let maxDist = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const d = perpDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxDist) {
      maxDist = d;
      index = i;
    }
  }
  if (maxDist <= tolerance) return [points[0], points[points.length - 1]];
  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}

const out = [];
for (const [id, fromKey, toKey] of ROUTES) {
  const from = PLACES[fromKey];
  const to = PLACES[toKey];
  const url = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.code !== "Ok") throw new Error(`${id}: ${json.code}`);

  const route = json.routes[0];
  const raw = route.geometry.coordinates;
  // ~0.00008 deg ≈ 9 m
  const simplified = simplify(raw, 0.00008);
  // Store as [lat, lng] and round to 5 dp (~1 m) to keep the payload small.
  const path = simplified.map(([lon, lat]) => [
    Number(lat.toFixed(5)),
    Number(lon.toFixed(5)),
  ]);

  out.push({
    id,
    from: from.name,
    to: to.name,
    distanceKm: Number((route.distance / 1000).toFixed(1)),
    // OSRM's own driving estimate, used as the baseline a loaded truck runs slower than.
    osrmMinutes: Math.round(route.duration / 60),
    path,
  });
  console.log(`${id} ${from.name} -> ${to.name}: ${raw.length} -> ${path.length} pts, ${(route.distance / 1000).toFixed(1)} km`);
  await new Promise((r) => setTimeout(r, 400));
}

const header = `// Generated from OpenStreetMap road geometry via OSRM — do not hand-edit.
// Regenerate with scripts/generate-routes.mjs when the depot list changes.
//
// Paths are real road centrelines, simplified to roughly 9 m tolerance, so a
// vehicle animated along one follows actual roads rather than a straight line
// between two points. Coordinates are [lat, lng].

export type FleetRoute = {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  osrmMinutes: number;
  path: [number, number][];
};

export const FLEET_ROUTES: FleetRoute[] = ${JSON.stringify(out, null, 2)};

export const ROUTES_BY_ID = new Map(FLEET_ROUTES.map((route) => [route.id, route]));
`;

fs.writeFileSync(process.argv[2] ?? "src/lib/tracking/routes.ts", header);
const bytes = fs.statSync(process.argv[2] ?? "src/lib/tracking/routes.ts").size;
console.log(`\nwritten: ${(bytes / 1024).toFixed(0)} KB`);
