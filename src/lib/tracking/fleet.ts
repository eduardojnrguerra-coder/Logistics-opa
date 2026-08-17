import { FLEET_ROUTES } from "@/lib/tracking/routes";

export type VehicleStatus = "on_route" | "delayed" | "at_site" | "offline";

export type TrackedVehicle = {
  id: string;
  registration: string;
  model: string;
  driver: string;
  customer: string;
  cargo: string;
  routeId: string;
  status: VehicleStatus;
  /** Fraction along the route at start, 0–1. */
  startProgress: number;
  /** The speed this vehicle holds where the road allows it, km/h. */
  cruiseKph: number;
  fuelPercent: number;
};

// Registrations, drivers and customers mirror the seeded operational data, so
// what the map shows lines up with what the jobs and fleet pages list.
export const TRACKED_FLEET: TrackedVehicle[] = [
  {
    id: "V1",
    registration: "CA 412 883",
    model: "Mercedes Axor",
    driver: "Sipho Ndlovu",
    customer: "HFC Construction",
    cargo: "G5 base course · 32 t",
    routeId: "R1",
    status: "on_route",
    startProgress: 0.34,
    cruiseKph: 78,
    fuelPercent: 61,
  },
  {
    id: "V2",
    registration: "CA 556 201",
    model: "Isuzu FTR",
    driver: "Andre Fourie",
    customer: "Coastal Build",
    cargo: "Crusher run · 18 t",
    routeId: "R2",
    status: "on_route",
    startProgress: 0.12,
    cruiseKph: 74,
    fuelPercent: 44,
  },
  {
    id: "V3",
    registration: "CA 118 440",
    model: "Scania G460",
    driver: "Michael Adams",
    customer: "Overstrand Municipality",
    cargo: "Reinforcing steel · 26 t",
    routeId: "R3",
    status: "delayed",
    startProgress: 0.58,
    // Running well under the limit — this is the vehicle reported delayed.
    cruiseKph: 48,
    fuelPercent: 28,
  },
  {
    id: "V4",
    registration: "CA 349 617",
    model: "Mercedes Actros",
    driver: "Michael Adams",
    customer: "HFC Construction",
    cargo: "Washed sand · 30 t",
    routeId: "R4",
    status: "on_route",
    startProgress: 0.05,
    cruiseKph: 76,
    fuelPercent: 88,
  },
  {
    id: "V5",
    registration: "CA 233 776",
    model: "MAN TGS",
    driver: "Nomsa Khumalo",
    customer: "Boland Quarry Supplies",
    cargo: "Aggregate · 28 t",
    routeId: "R5",
    status: "on_route",
    startProgress: 0.71,
    cruiseKph: 80,
    fuelPercent: 53,
  },
  {
    id: "V6",
    registration: "CA 774 052",
    model: "Isuzu NQR",
    driver: "Willem Botha",
    customer: "Gansbaai Marine Works",
    cargo: "Empty return",
    routeId: "R6",
    status: "offline",
    startProgress: 0.41,
    // Tracker has stopped reporting; last known position is where it stays.
    cruiseKph: 0,
    fuelPercent: 35,
  },
  {
    id: "V7",
    registration: "CA 688 194",
    model: "Volvo FH",
    driver: "Grace Sithole",
    customer: "Pine Avenue Civils",
    cargo: "Loading",
    routeId: "R4",
    status: "at_site",
    startProgress: 0.98,
    cruiseKph: 0,
    fuelPercent: 72,
  },
];

export const STATUS_META: Record<
  VehicleStatus,
  { label: string; colour: string; ring: string }
> = {
  on_route: { label: "On route", colour: "#10b981", ring: "rgba(16,185,129,0.35)" },
  delayed: { label: "Delayed", colour: "#f59e0b", ring: "rgba(245,158,11,0.35)" },
  at_site: { label: "At site", colour: "#3b82f6", ring: "rgba(59,130,246,0.35)" },
  offline: { label: "Signal lost", colour: "#ef4444", ring: "rgba(239,68,68,0.35)" },
};

export const FLEET_BOUNDS: [[number, number], [number, number]] = (() => {
  let minLat = 90;
  let maxLat = -90;
  let minLng = 180;
  let maxLng = -180;
  for (const route of FLEET_ROUTES) {
    for (const [lat, lng] of route.path) {
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
      if (lng < minLng) minLng = lng;
      if (lng > maxLng) maxLng = lng;
    }
  }
  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
})();
