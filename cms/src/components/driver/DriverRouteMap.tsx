"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import {
  Compass,
  ExternalLink,
  LocateFixed,
  MapPin,
  Navigation,
  QrCode,
  Route,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  fetchShortestPath,
  type ComputedRoute,
  type LatLng,
} from "@/lib/utils/geo";
import type { Order } from "@/types/order";

interface DriverRouteMapProps {
  orders: Order[];
  selectedOrder: Order | null;
  routeMode: "single" | "multi";
  orderCoords: Record<string, LatLng>;
  driverOrigin: LatLng;
  usingGps: boolean;
  onRequestGps: () => void;
  onSelectOrder: (order: Order) => void;
  onToggleMode: (mode: "single" | "multi") => void;
  onOpenVerify: (order: Order) => void;
}

export function DriverRouteMap({
  orders,
  selectedOrder,
  routeMode,
  orderCoords,
  driverOrigin,
  usingGps,
  onRequestGps,
  onSelectOrder,
  onToggleMode,
  onOpenVerify,
}: DriverRouteMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const layerGroupRef = useRef<import("leaflet").LayerGroup | null>(null);

  const [route, setRoute] = useState<ComputedRoute | null>(null);
  const [calculating, setCalculating] = useState(false);
  const [showSteps, setShowSteps] = useState(false);

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "ready" || o.status === "dispatched"),
    [orders]
  );

  const activeTargets = useMemo(() => {
    if (routeMode === "multi") {
      return pendingOrders.filter((o) => Boolean(orderCoords[o.id]));
    }
    const target = selectedOrder ?? pendingOrders[0] ?? orders[0];
    if (target && orderCoords[target.id]) return [target];
    return [];
  }, [routeMode, pendingOrders, selectedOrder, orders, orderCoords]);

  useEffect(() => {
    if (activeTargets.length === 0) {
      setRoute(null);
      return;
    }

    let cancelled = false;
    setCalculating(true);

    const stops = activeTargets.map((o) => ({
      id: o.id,
      coords: orderCoords[o.id],
    }));

    fetchShortestPath(driverOrigin, stops, routeMode === "multi")
      .then((computed) => {
        if (!cancelled) setRoute(computed);
      })
      .finally(() => {
        if (!cancelled) setCalculating(false);
      });

    return () => {
      cancelled = true;
    };
  }, [driverOrigin, activeTargets, orderCoords, routeMode]);

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;
      if (!mounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([driverOrigin.lat, driverOrigin.lng], 13);

      // 100% Gratis & Tanpa API Key: OpenStreetMap Standard Tiles
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      layerGroupRef.current = group;
    };

    initMap();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const renderLayers = async () => {
      const map = mapInstanceRef.current;
      const group = layerGroupRef.current;
      if (!map || !group) return;

      const L = (await import("leaflet")).default;
      group.clearLayers();

      const boundsPoints: [number, number][] = [[driverOrigin.lat, driverOrigin.lng]];

      const originIcon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;border-radius:9999px;background:#18352B;border:3px solid #FBF9F4;box-shadow:0 3px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#C9B99A;font-size:11px;font-weight:700;">L</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      L.marker([driverOrigin.lat, driverOrigin.lng], { icon: originIcon })
        .bindPopup(
          usingGps
            ? "<strong>Lokasi Kurir (GPS Aktif)</strong>"
            : "<strong>Dapur Layah · Tidar Atas, Malang</strong>"
        )
        .addTo(group);

      if (route && route.coordinates.length > 1) {
        L.polyline(route.coordinates, {
          color: "#18352B",
          weight: 5,
          opacity: 0.92,
          lineJoin: "round",
        }).addTo(group);

        L.polyline(route.coordinates, {
          color: "#C9B99A",
          weight: 2,
          dashArray: "6, 8",
          opacity: 0.85,
        }).addTo(group);

        for (const pt of route.coordinates) {
          boundsPoints.push(pt);
        }
      }

      const orderedIds = route?.orderedStopIds?.length
        ? route.orderedStopIds
        : activeTargets.map((o) => o.id);

      orderedIds.forEach((id, idx) => {
        const order = activeTargets.find((o) => o.id === id);
        const coords = orderCoords[id];
        if (!order || !coords) return;

        boundsPoints.push([coords.lat, coords.lng]);

        const stopIcon = L.divIcon({
          className: "",
          html: `<div style="width:28px;height:28px;border-radius:9999px;background:#641E2A;border:2.5px solid #FBF9F4;box-shadow:0 3px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#FBF9F4;font-size:12px;font-weight:700;">${
            idx + 1
          }</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        L.marker([coords.lat, coords.lng], { icon: stopIcon })
          .bindPopup(
            `<div style="font-family:sans-serif;font-size:12px;color:#18352B;">
              <strong>#${idx + 1} ${order.customerName}</strong><br/>
              <span>${order.orderCode} · ${order.receiptCode}</span><br/>
              <span style="font-size:11px;opacity:0.8;">${order.deliveryAddress}</span>
            </div>`
          )
          .on("click", () => onSelectOrder(order))
          .addTo(group);
      });

      if (boundsPoints.length > 1) {
        map.fitBounds(boundsPoints, { padding: [36, 36], maxZoom: 15 });
      } else {
        map.setView([driverOrigin.lat, driverOrigin.lng], 14);
      }
    };

    renderLayers();
  }, [driverOrigin, route, activeTargets, orderCoords, usingGps, onSelectOrder]);

  const orderedStops = useMemo(() => {
    if (!route?.orderedStopIds?.length) return activeTargets;
    return route.orderedStopIds
      .map((id) => activeTargets.find((o) => o.id === id))
      .filter(Boolean) as Order[];
  }, [route, activeTargets]);

  const primaryStop = orderedStops[0] ?? selectedOrder;

  // Format direct URL Google Maps (tanpa perlu API key)
  const googleMapsUrl = useMemo(() => {
    if (orderedStops.length === 0) return "#";
    const segments = [
      `${driverOrigin.lat},${driverOrigin.lng}`,
      ...orderedStops.map((o) => {
        const c = orderCoords[o.id];
        return c ? `${c.lat},${c.lng}` : encodeURIComponent(o.deliveryAddress);
      }),
    ];
    return `https://www.google.com/maps/dir/${segments.join("/")}`;
  }, [orderedStops, driverOrigin, orderCoords]);

  return (
    <div className="flex flex-1 flex-col space-y-3.5 pb-24">
      <div className="flex items-center justify-between gap-2">
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#DDD2BC] p-1 border border-[#18352B]/15 flex-1">
          <button
            type="button"
            onClick={() => onToggleMode("single")}
            className={`rounded-md py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
              routeMode === "single"
                ? "bg-[#18352B] text-[#FBF9F4]"
                : "text-[#18352B]/75"
            }`}
          >
            1 Tujuan
          </button>
          <button
            type="button"
            onClick={() => onToggleMode("multi")}
            className={`inline-flex items-center justify-center gap-1 rounded-md py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
              routeMode === "multi"
                ? "bg-[#18352B] text-[#FBF9F4]"
                : "text-[#18352B]/75"
            }`}
          >
            <Sparkles className="h-3 w-3" />
            Semua ({pendingOrders.length})
          </button>
        </div>

        <button
          type="button"
          onClick={onRequestGps}
          className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-2 text-[11px] font-semibold cursor-pointer transition-colors ${
            usingGps
              ? "border-[#18352B] bg-[#18352B] text-[#FBF9F4]"
              : "border-[#18352B]/30 bg-[#EFE9DC] text-[#18352B]"
          }`}
          title="Gunakan lokasi GPS saat ini"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          GPS
        </button>
      </div>

      {/* Peta Interaktif OpenStreetMap (Gratis, Tanpa API Key) */}
      <div className="relative h-72 w-full overflow-hidden rounded-xl border-2 border-[#18352B]/30 bg-[#DDD2BC] shadow-md">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        <div className="pointer-events-none absolute right-3 top-3 z-[400]">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#18352B]/95 px-3 py-1 text-[11px] font-semibold text-[#FBF9F4] shadow-md">
            <Route className="h-3.5 w-3.5 text-[#C9B99A]" />
            {calculating
              ? "Menghitung jalur..."
              : route
              ? `${route.distanceKm} km · ~${route.durationMin} mnt`
              : "Pilih tujuan"}
          </span>
        </div>

        <div className="pointer-events-none absolute bottom-2.5 left-3 z-[400] flex items-center gap-2 rounded-md bg-[#FBF9F4]/92 px-2.5 py-1 text-[10px] font-semibold text-[#18352B] shadow-xs">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#18352B]" /> Tidar Atas
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#641E2A]" /> Tujuan
          </span>
        </div>
      </div>

      {orderedStops.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#18352B]/30 bg-[#EFE9DC]/60 p-6 text-center text-xs text-[#18352B]/70">
          Belum ada tujuan pengiriman aktif. Pilih pesanan dari tab Antrean.
        </div>
      ) : (
        <div className="rounded-xl bg-[#18352B] p-4 text-[#FBF9F4] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#C9B99A]">
              {routeMode === "multi"
                ? `URUTAN JALUR TERPENDEK (${orderedStops.length} TITIK)`
                : "TUJUAN TERPILIH"}
            </span>
            <button
              type="button"
              onClick={() => setShowSteps((p) => !p)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C9B99A] underline cursor-pointer"
            >
              <Compass className="h-3 w-3" />
              {showSteps ? "Tutup Arah" : "Panduan Belokan"}
            </button>
          </div>

          <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
            {orderedStops.map((stop, idx) => (
              <div
                key={stop.id}
                onClick={() => onSelectOrder(stop)}
                className={`flex items-start justify-between gap-2.5 rounded-lg p-2.5 cursor-pointer transition-colors ${
                  primaryStop?.id === stop.id
                    ? "bg-[#11261F] border border-[#C9B99A]/40"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#641E2A] text-[10px] font-bold text-[#FBF9F4] mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#FBF9F4] truncate">
                      {stop.customerName}{" "}
                      <span className="font-normal text-[#C9B99A]">
                        ({stop.orderCode})
                      </span>
                    </p>
                    <p className="mt-0.5 text-[11px] text-[#C9B99A]/85 line-clamp-2 leading-snug">
                      {stop.deliveryAddress}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenVerify(stop);
                  }}
                  className="shrink-0 rounded-md bg-[#C9B99A] p-1.5 text-[#18352B] hover:bg-[#DDD2BC] cursor-pointer"
                  title="Verifikasi QR pesanan ini"
                >
                  <QrCode className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>

          {showSteps && route && route.steps.length > 0 && (
            <div className="rounded-lg bg-[#11261F] p-3 border border-[#C9B99A]/20 max-h-40 overflow-y-auto space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-[#C9B99A]/70 font-semibold">
                Navigasi Belokan ({route.source === "osrm" ? "Jalan Raya Malang" : "Estimasi"})
              </p>
              {route.steps.slice(0, 12).map((st, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-2 text-[11px] text-[#FBF9F4]/90 border-b border-white/10 pb-1 last:border-b-0"
                >
                  <span className="flex items-center gap-1.5">
                    <Navigation className="h-3 w-3 shrink-0 text-[#C9B99A]" />
                    {st.instruction}
                  </span>
                  <span className="shrink-0 text-[10px] text-[#C9B99A]">
                    {st.distanceMeters >= 1000
                      ? `${(st.distanceMeters / 1000).toFixed(1)} km`
                      : `${st.distanceMeters} m`}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#C9B99A]/45 bg-transparent px-3 py-2.5 text-xs font-semibold text-[#FBF9F4] hover:bg-white/10 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Google Maps
            </a>
            {primaryStop && (
              <Button
                variant="burgundy"
                size="sm"
                className="py-2.5 text-xs"
                onClick={() => onOpenVerify(primaryStop)}
              >
                <MapPin className="h-3.5 w-3.5" />
                Tiba &amp; Scan QR
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}