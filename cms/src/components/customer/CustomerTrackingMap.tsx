"use client";

import React, { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Clock, MapPin, Navigation, RefreshCw, Truck } from "lucide-react";
import {
  fetchShortestPath,
  geocodeOrderAddress,
  MALANG_DEPOT,
  resolveFallbackCoords,
  type ComputedRoute,
  type LatLng,
} from "@/lib/utils/geo";
import type { Order } from "@/types/order";

interface CustomerTrackingMapProps {
  order: Order;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function CustomerTrackingMap({
  order,
  onRefresh,
  isRefreshing,
}: CustomerTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const layerGroupRef = useRef<import("leaflet").LayerGroup | null>(null);

  const [destCoords, setDestCoords] = useState<LatLng>(() =>
    resolveFallbackCoords(order)
  );
  const [route, setRoute] = useState<ComputedRoute | null>(null);

  const hasLiveDriverCoords =
    typeof order.driverLat === "number" &&
    typeof order.driverLng === "number" &&
    (order.driverLat !== 0 || order.driverLng !== 0);

  const driverCoords: LatLng | null = hasLiveDriverCoords
    ? { lat: order.driverLat!, lng: order.driverLng! }
    : null;

  // Geocode customer destination in Malang
  useEffect(() => {
    setDestCoords(resolveFallbackCoords(order));
    let active = true;
    geocodeOrderAddress(order).then((coords) => {
      if (active) setDestCoords(coords);
    });
    return () => {
      active = false;
    };
  }, [order.id, order.deliveryAddress]);

  // Compute live shortest path from Driver's current position (or Depot) -> Customer
  useEffect(() => {
    let cancelled = false;
    const origin = driverCoords ?? MALANG_DEPOT;

    fetchShortestPath(origin, [{ id: order.id, coords: destCoords }], false).then(
      (res) => {
        if (!cancelled) setRoute(res);
      }
    );

    return () => {
      cancelled = true;
    };
  }, [order.id, destCoords, driverCoords?.lat, driverCoords?.lng]);

  // Initialize Leaflet OpenStreetMap (no API key required)
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      const L = (await import("leaflet")).default;
      if (!mounted || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([MALANG_DEPOT.lat, MALANG_DEPOT.lng], 13);

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const group = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      layerGroupRef.current = group;
    };

    init();

    return () => {
      mounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // Draw pins & shortest-path polyline whenever driver GPS updates
  useEffect(() => {
    const draw = async () => {
      const map = mapInstanceRef.current;
      const group = layerGroupRef.current;
      if (!map || !group) return;

      const L = (await import("leaflet")).default;
      group.clearLayers();

      const bounds: [number, number][] = [];

      // 1. Dapur Layah (Tidar Atas) pin
      const depotIcon = L.divIcon({
        className: "",
        html: `<div style="width:26px;height:26px;border-radius:9999px;background:#18352B;border:2.5px solid #FBF9F4;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#C9B99A;font-size:10px;font-weight:700;">L</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      L.marker([MALANG_DEPOT.lat, MALANG_DEPOT.lng], { icon: depotIcon })
        .bindPopup("<strong>Dapur Layah Catering</strong><br/>Tidar Atas, Malang")
        .addTo(group);
      bounds.push([MALANG_DEPOT.lat, MALANG_DEPOT.lng]);

      // 2. Customer destination pin
      const destIcon = L.divIcon({
        className: "",
        html: `<div style="width:28px;height:28px;border-radius:9999px;background:#641E2A;border:2.5px solid #FBF9F4;box-shadow:0 3px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;color:#FBF9F4;font-size:11px;font-weight:700;">★</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      L.marker([destCoords.lat, destCoords.lng], { icon: destIcon })
        .bindPopup(
          `<strong>Alamat Pengiriman Anda</strong><br/>${order.deliveryAddress}`
        )
        .addTo(group);
      bounds.push([destCoords.lat, destCoords.lng]);

      // 3. Route polyline
      if (route && route.coordinates.length > 1) {
        L.polyline(route.coordinates, {
          color: "#18352B",
          weight: 5,
          opacity: 0.88,
          lineJoin: "round",
        }).addTo(group);

        L.polyline(route.coordinates, {
          color: "#C9B99A",
          weight: 2,
          dashArray: "6, 8",
          opacity: 0.9,
        }).addTo(group);

        for (const pt of route.coordinates) {
          bounds.push(pt);
        }
      }

      // 4. Live Driver GPS pin
      if (driverCoords) {
        const driverIcon = L.divIcon({
          className: "",
          html: `<div style="width:34px;height:34px;border-radius:9999px;background:#18352B;border:3px solid #C9B99A;box-shadow:0 0 0 6px rgba(100,30,42,0.28);display:flex;align-items:center;justify-content:center;color:#FBF9F4;font-size:13px;font-weight:700;">🛵</div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        L.marker([driverCoords.lat, driverCoords.lng], { icon: driverIcon })
          .bindPopup(
            `<strong>Kurir: ${order.driverName || "Kurir Layah"}</strong><br/>Posisi live${
              order.driverLocationUpdatedAt
                ? ` (${order.driverLocationUpdatedAt})`
                : ""
            }`
          )
          .addTo(group);
        bounds.push([driverCoords.lat, driverCoords.lng]);
      }

      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 15 });
      }
    };

    draw();
  }, [destCoords, driverCoords?.lat, driverCoords?.lng, route, order.driverName, order.driverLocationUpdatedAt, order.deliveryAddress]);

  return (
    <div className="rounded-xl border border-[#18352B]/20 bg-[#FBF9F4] overflow-hidden shadow-xs flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 border-b border-[#18352B]/12">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#18352B]/60">
            PELACAKAN KURIR LANGSUNG
          </p>
          <h3 className="font-serif text-xl font-medium text-[#18352B]">
            Posisi Kurir &amp; Rute Pengiriman
          </h3>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 rounded-md border border-[#18352B]/25 bg-[#EFE9DC] px-3 py-1.5 text-xs font-semibold text-[#18352B] hover:bg-[#DDD2BC] cursor-pointer"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Perbarui Lokasi
        </button>
      </div>

      {/* Map Container */}
      <div className="relative h-72 sm:h-80 w-full bg-[#DDD2BC]">
        <div ref={mapContainerRef} className="h-full w-full z-0" />

        {/* Distance & ETA pill */}
        {route && order.status !== "delivered" && (
          <div className="pointer-events-none absolute right-3 top-3 z-[400] rounded-full bg-[#18352B]/95 px-3.5 py-1.5 text-xs font-semibold text-[#FBF9F4] shadow-md flex items-center gap-1.5">
            <Navigation className="h-3.5 w-3.5 text-[#C9B99A]" />
            <span>
              {route.distanceKm} km · ~{route.durationMin} menit
            </span>
          </div>
        )}

        {/* Map Legend */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] flex flex-wrap items-center gap-2.5 rounded-md bg-[#FBF9F4]/95 px-3 py-1.5 text-[10px] font-semibold text-[#18352B] shadow-xs">
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#18352B]" /> Dapur Tidar
          </span>
          {driverCoords && (
            <span className="inline-flex items-center gap-1">
              <span>🛵</span> Kurir Live
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-[#641E2A]" /> Lokasi Anda
          </span>
        </div>
      </div>

      {/* Live Driver Telemetry Strip */}
      <div className="bg-[#18352B] px-5 py-4 text-[#FBF9F4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#641E2A] text-[#FBF9F4]">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#FBF9F4]">
              {order.status === "delivered"
                ? `Telah Diantar oleh ${order.driverName || "Kurir Layah"}`
                : driverCoords
                ? `${order.driverName || "Kurir Layah"} sedang menuju lokasi Anda`
                : order.status === "ready" || order.status === "dispatched"
                ? "Menunggu sinyal GPS kurir..."
                : "Kurir akan ditugaskan setelah dapur selesai memasak"}
            </p>
            <p className="mt-0.5 text-[11px] text-[#C9B99A] flex items-center gap-1.5">
              <Clock className="h-3 w-3 shrink-0" />
              {driverCoords
                ? `GPS: ${driverCoords.lat.toFixed(5)}, ${driverCoords.lng.toFixed(5)} · Update ${
                    order.driverLocationUpdatedAt || "baru saja"
                  }`
                : `Rute: ${order.deliveryRoute}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[#C9B99A] sm:text-right">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="line-clamp-1 max-w-[240px]">
            {order.deliveryAddress}
          </span>
        </div>
      </div>
    </div>
  );
}
