"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker, Polyline } from "leaflet";
import { FLEET_BOUNDS, STATUS_META, TRACKED_FLEET, type TrackedVehicle } from "@/lib/tracking/fleet";
import {
  advance,
  compassPoint,
  formatEta,
  getRouteProfile,
  positionAt,
  type RouteProfile,
} from "@/lib/tracking/simulator";

export type Telemetry = {
  id: string;
  kph: number;
  bearing: number;
  progress: number;
  remainingMetres: number;
  eta: string;
  position: [number, number];
};

type Runtime = {
  vehicle: TrackedVehicle;
  profile: RouteProfile;
  metres: number;
  kph: number;
  marker: Marker;
  trail: Polyline;
};

// The map covers roughly 200 km, so a truck at 80 km/h crosses it in about
// two and a half hours. At 1× that is true real time and the markers barely
// creep, which is what a real tracking console looks like. 6× keeps the
// motion honest while making it perceptible; the higher scales are for
// watching a run play out end to end.
const SPEED_OPTIONS = [
  { value: 1, label: "LIVE" },
  { value: 6, label: "6×" },
  { value: 20, label: "20×" },
  { value: 60, label: "60×" },
] as const;

const DEFAULT_TIME_SCALE = 6;

export function FleetMap({
  selectedId,
  onSelect,
  onTelemetry,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onTelemetry: (readings: Record<string, Telemetry>) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const runtimeRef = useRef<Runtime[]>([]);
  const rafRef = useRef<number>(0);
  const timeScaleRef = useRef<number>(DEFAULT_TIME_SCALE);
  const followRef = useRef<boolean>(false);
  const selectedRef = useRef<string | null>(selectedId);

  const [timeScale, setTimeScale] = useState<number>(DEFAULT_TIME_SCALE);
  const [follow, setFollow] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    selectedRef.current = selectedId;
    // Restyle without rebuilding: only the icon's classes change.
    for (const item of runtimeRef.current) {
      const el = item.marker.getElement();
      if (el) el.classList.toggle("is-selected", item.vehicle.id === selectedId);
      item.trail.setStyle({
        opacity: selectedId && item.vehicle.id !== selectedId ? 0.12 : 0.45,
        weight: item.vehicle.id === selectedId ? 3 : 1.5,
      });
    }
  }, [selectedId]);

  useEffect(() => {
    timeScaleRef.current = timeScale;
  }, [timeScale]);

  useEffect(() => {
    followRef.current = follow;
  }, [follow]);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;
    if (!container) return;

    // Leaflet touches window on import, so it can only load in the browser.
    (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        // Canvas rendering keeps the frame budget flat as vehicle count grows;
        // the default SVG renderer creates a DOM node per shape.
        preferCanvas: true,
        zoomControl: false,
        attributionControl: true,
        zoomSnap: 0.25,
      });
      mapRef.current = map;

      L.control.zoom({ position: "bottomright" }).addTo(map);
      L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap &copy; CARTO",
      }).addTo(map);

      map.fitBounds(FLEET_BOUNDS, { padding: [40, 40] });

      const runtime: Runtime[] = TRACKED_FLEET.map((vehicle) => {
        const profile = getRouteProfile(vehicle.routeId);
        const meta = STATUS_META[vehicle.status];

        const trail = L.polyline(profile.route.path, {
          color: meta.colour,
          weight: 1.5,
          opacity: 0.45,
          interactive: false,
        }).addTo(map);

        const metres = profile.totalMetres * vehicle.startProgress;
        const { position, bearing } = positionAt(profile, metres);

        const marker = L.marker(position, {
          icon: L.divIcon({
            className: "fleet-unit",
            iconSize: [34, 34],
            iconAnchor: [17, 17],
            html: `
              <span class="fleet-unit-ring" style="--unit:${meta.colour};--ring:${meta.ring}"></span>
              <span class="fleet-unit-arrow" style="--unit:${meta.colour};transform:rotate(${bearing}deg)">
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path d="M12 2 L19 21 L12 16.5 L5 21 Z" fill="currentColor"/>
                </svg>
              </span>
              <span class="fleet-unit-tag">${vehicle.registration}</span>
            `,
          }),
          keyboard: true,
          title: `${vehicle.registration} — ${vehicle.driver}`,
          zIndexOffset: vehicle.status === "offline" ? 0 : 400,
        }).addTo(map);

        marker.on("click", () => onSelect(vehicle.id));

        return { vehicle, profile, metres, kph: vehicle.cruiseKph, marker, trail };
      });

      runtimeRef.current = runtime;
      setReady(true);

      let last = performance.now();
      let lastPublish = 0;

      const frame = (now: number) => {
        // Clamp so a backgrounded tab does not teleport every vehicle on return.
        const deltaSeconds = Math.min((now - last) / 1000, 0.25) * timeScaleRef.current;
        last = now;

        for (const item of runtime) {
          if (item.vehicle.cruiseKph === 0) continue;

          const next = advance(
            item.profile,
            item.metres,
            item.kph,
            item.vehicle.cruiseKph,
            deltaSeconds,
          );
          item.metres = next.metres;
          item.kph = next.kph;

          if (item.metres >= item.profile.totalMetres) {
            item.metres = 0;
            item.kph = item.vehicle.cruiseKph * 0.4;
          }

          const { position, bearing } = positionAt(item.profile, item.metres);
          item.marker.setLatLng(position);

          const el = item.marker.getElement();
          const arrow = el?.querySelector<HTMLElement>(".fleet-unit-arrow");
          if (arrow) arrow.style.transform = `rotate(${bearing}deg)`;
        }

        if (followRef.current && selectedRef.current) {
          const target = runtime.find((item) => item.vehicle.id === selectedRef.current);
          if (target) map.panTo(target.marker.getLatLng(), { animate: false });
        }

        // React only hears about this a few times a second. Driving state at
        // frame rate would re-render the panel 60 times a second for numbers a
        // human cannot read that fast.
        if (now - lastPublish > 200) {
          lastPublish = now;
          const readings: Record<string, Telemetry> = {};
          for (const item of runtime) {
            const remaining = item.profile.totalMetres - item.metres;
            const { position, bearing } = positionAt(item.profile, item.metres);
            readings[item.vehicle.id] = {
              id: item.vehicle.id,
              kph: item.kph,
              bearing,
              progress: item.metres / item.profile.totalMetres,
              remainingMetres: remaining,
              eta: item.vehicle.cruiseKph === 0 ? "—" : formatEta(remaining, item.kph),
              position,
            };
          }
          onTelemetry(readings);
        }

        rafRef.current = requestAnimationFrame(frame);
      };

      rafRef.current = requestAnimationFrame(frame);
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      runtimeRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Mount once. Selection and follow are read through refs so that changing
    // them never tears down the map or restarts the animation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-neutral-800 bg-[#0b0f14]">
      <div ref={containerRef} className="h-full w-full" />

      {/* Reticle framing the viewport centre, drawn over the map. */}
      <div className="pointer-events-none absolute inset-0 z-[500]">
        <div className="absolute inset-0 opacity-[0.06] [background-image:linear-gradient(#5eead4_1px,transparent_1px),linear-gradient(90deg,#5eead4_1px,transparent_1px)] [background-size:48px_48px]" />
        <div className="absolute top-3 left-3 h-5 w-5 border-t border-l border-teal-400/40" />
        <div className="absolute top-3 right-3 h-5 w-5 border-t border-r border-teal-400/40" />
        <div className="absolute bottom-3 left-3 h-5 w-5 border-b border-l border-teal-400/40" />
        <div className="absolute right-3 bottom-3 h-5 w-5 border-r border-b border-teal-400/40" />
      </div>

      <div className="absolute top-3 left-1/2 z-[600] -translate-x-1/2">
        <div className="flex items-center gap-1 rounded-lg border border-neutral-700/80 bg-neutral-900/85 p-1 backdrop-blur">
          <span className="px-2 font-mono text-[10px] tracking-widest text-neutral-500 uppercase">
            Sim
          </span>
          {SPEED_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTimeScale(option.value)}
              title={
                option.value === 1
                  ? "Real time — vehicles move at their true ground speed"
                  : `${option.value} times real time`
              }
              className={`rounded px-2 py-1 font-mono text-[11px] transition ${
                timeScale === option.value
                  ? "bg-teal-400/20 text-teal-300"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {option.label}
            </button>
          ))}
          <span className="mx-1 h-4 w-px bg-neutral-700" />
          <button
            type="button"
            onClick={() => setFollow((value) => !value)}
            disabled={!selectedId}
            className={`rounded px-2 py-1 font-mono text-[11px] transition disabled:opacity-40 ${
              follow ? "bg-teal-400/20 text-teal-300" : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            FOLLOW
          </button>
        </div>
      </div>

      {!ready && (
        <div className="absolute inset-0 z-[700] grid place-items-center bg-[#0b0f14]">
          <span className="font-mono text-xs tracking-widest text-teal-400/70 uppercase">
            Acquiring fleet telemetry…
          </span>
        </div>
      )}

      <style>{`
        .leaflet-container { background: #0b0f14; font-family: inherit; }
        .leaflet-control-attribution {
          background: rgba(10,14,20,.75) !important;
          color: #64748b !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a { color: #94a3b8 !important; }
        .leaflet-bar a {
          background: rgba(15,23,32,.9); color: #cbd5e1; border-color: #1e293b;
        }
        .leaflet-bar a:hover { background: #1e293b; color: #f1f5f9; }

        .fleet-unit { position: relative; cursor: pointer; }
        .fleet-unit-ring {
          position: absolute; inset: 0; border-radius: 9999px;
          background: var(--ring); border: 1px solid var(--unit);
          animation: unit-pulse 2.4s ease-out infinite;
        }
        .fleet-unit-arrow {
          position: absolute; inset: 0; display: grid; place-items: center;
          color: var(--unit); filter: drop-shadow(0 0 4px var(--unit));
          transition: transform .25s linear;
        }
        .fleet-unit-tag {
          position: absolute; top: 34px; left: 50%; transform: translateX(-50%);
          white-space: nowrap; font-family: ui-monospace, monospace; font-size: 10px;
          color: #cbd5e1; background: rgba(10,14,20,.8); padding: 1px 5px;
          border-radius: 3px; opacity: 0; transition: opacity .15s;
        }
        .fleet-unit:hover .fleet-unit-tag,
        .fleet-unit.is-selected .fleet-unit-tag { opacity: 1; }
        .fleet-unit.is-selected .fleet-unit-ring {
          box-shadow: 0 0 0 3px var(--ring), 0 0 18px var(--unit);
        }
        @keyframes unit-pulse {
          0%   { transform: scale(.62); opacity: .95; }
          70%  { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .fleet-unit-ring { animation: none; }
          .fleet-unit-arrow { transition: none; }
        }
      `}</style>
    </div>
  );
}

export { compassPoint };
