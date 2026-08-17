import { ROUTES_BY_ID, type FleetRoute } from "@/lib/tracking/routes";

export type LatLng = [number, number];

const EARTH_RADIUS_M = 6_371_000;
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function haversineMetres(a: LatLng, b: LatLng): number {
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
}

export function bearingDegrees(a: LatLng, b: LatLng): number {
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const dLng = toRad(b[1] - a[1]);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

// A route with the per-point maths needed to place a vehicle on it. Built once
// per route and reused every frame; the animation loop only does a binary
// search and a lerp.
export type RouteProfile = {
  route: FleetRoute;
  /** Cumulative distance in metres at each path point. */
  cumulative: number[];
  /** Total route length in metres. */
  totalMetres: number;
  /** Speed ceiling in km/h at each point, from road curvature. */
  speedLimits: number[];
};

// South African law caps heavy goods vehicles at 80 km/h regardless of the
// posted limit, so that is the ceiling on open road rather than 120.
const OPEN_ROAD_KPH = 80;
const TIGHT_BEND_KPH = 30;
const TOWN_KPH = 42;
// Approach speeds ramp down over the last stretch into a destination.
const TOWN_ZONE_METRES = 2_500;

/**
 * Derives a speed ceiling for every point on the route.
 *
 * There is no road classification in the geometry, so curvature stands in for
 * it: the sharper the turn a vehicle is about to take, the lower the speed it
 * can hold through it. That reproduces the behaviour that actually reads as
 * realistic — trucks slowing for bends and interchanges, then winding back up
 * on straights — without needing per-road speed limit data.
 */
function computeSpeedLimits(path: LatLng[], cumulative: number[]): number[] {
  const total = cumulative[cumulative.length - 1];
  const limits = new Array<number>(path.length);

  for (let i = 0; i < path.length; i++) {
    let limit = OPEN_ROAD_KPH;

    if (i > 0 && i < path.length - 1) {
      const inBearing = bearingDegrees(path[i - 1], path[i]);
      const outBearing = bearingDegrees(path[i], path[i + 1]);
      let turn = Math.abs(outBearing - inBearing);
      if (turn > 180) turn = 360 - turn;

      // Spread the turn over the distance it happens across, so a sweeping
      // motorway curve is not penalised like a junction.
      const spanMetres = Math.max(15, cumulative[i + 1] - cumulative[i - 1]);
      const turnRate = turn / spanMetres; // degrees per metre
      if (turnRate > 0.5) limit = TIGHT_BEND_KPH;
      else if (turnRate > 0.2) limit = 50;
      else if (turnRate > 0.08) limit = 70;
    }

    // Slow through the built-up area at either end of the run.
    const fromStart = cumulative[i];
    const fromEnd = total - cumulative[i];
    if (Math.min(fromStart, fromEnd) < TOWN_ZONE_METRES) {
      limit = Math.min(limit, TOWN_KPH);
    }

    limits[i] = limit;
  }

  // Smooth so a vehicle brakes into a bend and accelerates out, rather than
  // snapping between ceilings.
  const smoothed = limits.slice();
  for (let pass = 0; pass < 3; pass++) {
    for (let i = 1; i < smoothed.length - 1; i++) {
      smoothed[i] = (smoothed[i - 1] + smoothed[i] * 2 + smoothed[i + 1]) / 4;
    }
  }
  return smoothed;
}

export function buildRouteProfile(route: FleetRoute): RouteProfile {
  const path = route.path;
  const cumulative = new Array<number>(path.length);
  cumulative[0] = 0;
  for (let i = 1; i < path.length; i++) {
    cumulative[i] = cumulative[i - 1] + haversineMetres(path[i - 1], path[i]);
  }
  return {
    route,
    cumulative,
    totalMetres: cumulative[cumulative.length - 1],
    speedLimits: computeSpeedLimits(path, cumulative),
  };
}

const profileCache = new Map<string, RouteProfile>();

export function getRouteProfile(routeId: string): RouteProfile {
  const cached = profileCache.get(routeId);
  if (cached) return cached;
  const route = ROUTES_BY_ID.get(routeId);
  if (!route) throw new Error(`Unknown route: ${routeId}`);
  const profile = buildRouteProfile(route);
  profileCache.set(routeId, profile);
  return profile;
}

/** Index of the last path point at or before `metres`. */
function segmentIndexFor(cumulative: number[], metres: number): number {
  let low = 0;
  let high = cumulative.length - 1;
  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (cumulative[mid] <= metres) low = mid;
    else high = mid - 1;
  }
  return Math.min(low, cumulative.length - 2);
}

export type RoutePosition = {
  position: LatLng;
  bearing: number;
  /** Speed ceiling in km/h at this point on the road. */
  limitKph: number;
};

export function positionAt(profile: RouteProfile, metres: number): RoutePosition {
  const { route, cumulative, speedLimits } = profile;
  const clamped = Math.max(0, Math.min(metres, profile.totalMetres));
  const i = segmentIndexFor(cumulative, clamped);

  const segStart = cumulative[i];
  const segLength = cumulative[i + 1] - segStart;
  const t = segLength > 0 ? (clamped - segStart) / segLength : 0;

  const a = route.path[i];
  const b = route.path[i + 1];

  return {
    position: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t],
    bearing: bearingDegrees(a, b),
    limitKph: speedLimits[i] + (speedLimits[i + 1] - speedLimits[i]) * t,
  };
}

/**
 * Advances a vehicle one animation step.
 *
 * Speed converges on whichever is lower — the road's ceiling or the vehicle's
 * own cruise speed — and is rate-limited so acceleration and braking look like
 * a laden truck rather than a step change. Trucks brake considerably harder
 * than they accelerate, which is what makes the movement read as heavy.
 */
export function advance(
  profile: RouteProfile,
  metres: number,
  currentKph: number,
  cruiseKph: number,
  deltaSeconds: number,
): { metres: number; kph: number } {
  const { limitKph } = positionAt(profile, metres);

  // Traffic drag: a slow oscillation keyed to position rather than to the
  // clock, so a vehicle meets the same conditions at the same point on the
  // road every run. Without it every truck sits pinned at exactly its cruise
  // speed, which is the main thing that gives a simulation away.
  const traffic = 0.88 + 0.12 * Math.sin(metres / 2200);
  const target = Math.min(limitKph, cruiseKph) * traffic;

  const ACCEL_KPH_PER_SEC = 1.6;
  const BRAKE_KPH_PER_SEC = 4.5;
  const maxChange = (target > currentKph ? ACCEL_KPH_PER_SEC : BRAKE_KPH_PER_SEC) * deltaSeconds;
  const kph = Math.abs(target - currentKph) <= maxChange
    ? target
    : currentKph + Math.sign(target - currentKph) * maxChange;

  return { metres: metres + (kph / 3.6) * deltaSeconds, kph };
}

export function formatEta(remainingMetres: number, kph: number): string {
  if (kph < 1) return "—";
  const minutes = Math.round(remainingMetres / 1000 / kph * 60);
  if (minutes < 1) return "arriving";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function compassPoint(bearing: number): string {
  const points = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return points[Math.round(bearing / 45) % 8];
}
