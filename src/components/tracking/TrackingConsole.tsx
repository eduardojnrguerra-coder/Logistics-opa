"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { STATUS_META, TRACKED_FLEET } from "@/lib/tracking/fleet";
import { ROUTES_BY_ID } from "@/lib/tracking/routes";
import { compassPoint } from "@/lib/tracking/simulator";
import type { Telemetry } from "@/components/tracking/FleetMap";

// Leaflet reaches for window at import time, so the map is never part of the
// server render.
const FleetMap = dynamic(
  () => import("@/components/tracking/FleetMap").then((m) => m.FleetMap),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center rounded-xl border border-neutral-800 bg-[#0b0f14]">
        <span className="font-mono text-xs tracking-widest text-teal-400/70 uppercase">
          Loading map…
        </span>
      </div>
    ),
  },
);

export function TrackingConsole() {
  const [selectedId, setSelectedId] = useState<string | null>(TRACKED_FLEET[0]?.id ?? null);
  const [telemetry, setTelemetry] = useState<Record<string, Telemetry>>({});

  // Referentially stable, so the map effect never re-runs and the animation
  // is never interrupted.
  const handleTelemetry = useCallback((readings: Record<string, Telemetry>) => {
    setTelemetry(readings);
  }, []);
  const handleSelect = useCallback((id: string) => setSelectedId(id), []);

  const selected = TRACKED_FLEET.find((vehicle) => vehicle.id === selectedId) ?? null;
  const selectedReading = selectedId ? telemetry[selectedId] : undefined;
  const selectedRoute = selected ? ROUTES_BY_ID.get(selected.routeId) : undefined;

  const counts = useMemo(() => {
    const moving = TRACKED_FLEET.filter((v) => v.status === "on_route").length;
    const delayed = TRACKED_FLEET.filter((v) => v.status === "delayed").length;
    const offline = TRACKED_FLEET.filter((v) => v.status === "offline").length;
    const atSite = TRACKED_FLEET.filter((v) => v.status === "at_site").length;
    return { moving, delayed, offline, atSite };
  }, []);

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="order-2 h-[520px] xl:order-1 xl:h-[680px]">
        <FleetMap
          selectedId={selectedId}
          onSelect={handleSelect}
          onTelemetry={handleTelemetry}
        />
      </div>

      <div className="order-1 space-y-4 xl:order-2">
        <div className="grid grid-cols-4 gap-2">
          {[
            ["Moving", counts.moving, "text-emerald-400"],
            ["Delayed", counts.delayed, "text-amber-400"],
            ["At site", counts.atSite, "text-blue-400"],
            ["No signal", counts.offline, "text-red-400"],
          ].map(([label, value, tone]) => (
            <div
              key={String(label)}
              className="rounded-lg border border-neutral-200 bg-white p-2 text-center dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className={`font-mono text-lg font-semibold ${tone}`}>{value}</div>
              <div className="text-[10px] tracking-wide text-neutral-500 uppercase">{label}</div>
            </div>
          ))}
        </div>

        {selected && (
          <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
              <div>
                <div className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-50">
                  {selected.registration}
                </div>
                <div className="text-xs text-neutral-500 dark:text-neutral-400">
                  {selected.model} · {selected.driver}
                </div>
              </div>
              <span
                className="rounded px-2 py-0.5 font-mono text-[10px] tracking-wide uppercase"
                style={{
                  color: STATUS_META[selected.status].colour,
                  background: STATUS_META[selected.status].ring,
                }}
              >
                {STATUS_META[selected.status].label}
              </span>
            </div>

            <dl className="grid grid-cols-2 gap-px bg-neutral-200 dark:bg-neutral-800">
              {[
                ["Speed", selectedReading ? `${Math.round(selectedReading.kph)} km/h` : "—"],
                [
                  "Heading",
                  selectedReading
                    ? `${compassPoint(selectedReading.bearing)} ${Math.round(selectedReading.bearing)}°`
                    : "—",
                ],
                ["ETA", selectedReading?.eta ?? "—"],
                [
                  "Remaining",
                  selectedReading
                    ? `${(selectedReading.remainingMetres / 1000).toFixed(1)} km`
                    : "—",
                ],
                ["Fuel", `${selected.fuelPercent}%`],
                ["Load", selected.cargo],
              ].map(([label, value]) => (
                <div key={label} className="bg-white px-4 py-2.5 dark:bg-neutral-900">
                  <dt className="text-[10px] tracking-wide text-neutral-500 uppercase">{label}</dt>
                  <dd className="font-mono text-sm text-neutral-900 dark:text-neutral-100">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            {selectedRoute && (
              <div className="border-t border-neutral-200 px-4 py-3 dark:border-neutral-800">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="truncate text-neutral-500 dark:text-neutral-400">
                    {selectedRoute.from}
                  </span>
                  <span className="truncate text-neutral-900 dark:text-neutral-100">
                    {selectedRoute.to}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
                  <div
                    className="h-full rounded-full transition-[width] duration-200 ease-linear"
                    style={{
                      width: `${Math.round((selectedReading?.progress ?? 0) * 100)}%`,
                      background: STATUS_META[selected.status].colour,
                    }}
                  />
                </div>
                <div className="mt-1.5 flex justify-between font-mono text-[10px] text-neutral-500">
                  <span>{selectedRoute.distanceKm} km total</span>
                  <span>
                    {selectedReading
                      ? `${(selectedReading.position[0]).toFixed(4)}, ${selectedReading.position[1].toFixed(4)}`
                      : "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
          <div className="border-b border-neutral-200 px-4 py-2.5 text-xs font-semibold text-neutral-900 dark:border-neutral-800 dark:text-neutral-100">
            Fleet units
          </div>
          <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {TRACKED_FLEET.map((vehicle) => {
              const reading = telemetry[vehicle.id];
              const active = vehicle.id === selectedId;
              return (
                <li key={vehicle.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(vehicle.id)}
                    aria-current={active ? "true" : undefined}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition ${
                      active
                        ? "bg-neutral-100 dark:bg-neutral-800"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                    }`}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: STATUS_META[vehicle.status].colour }}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-mono text-xs text-neutral-900 dark:text-neutral-100">
                        {vehicle.registration}
                      </span>
                      <span className="block truncate text-[11px] text-neutral-500 dark:text-neutral-400">
                        {vehicle.customer}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block font-mono text-xs text-neutral-900 dark:text-neutral-100">
                        {reading ? `${Math.round(reading.kph)}` : "—"}
                      </span>
                      <span className="block font-mono text-[10px] text-neutral-500">km/h</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
