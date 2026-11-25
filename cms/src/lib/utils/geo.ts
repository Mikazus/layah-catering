import type { Order } from "@/types/order";

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
}

export interface ComputedRoute {
  coordinates: [number, number][]; // [lat, lng] untuk Leaflet
  distanceKm: number;
  durationMin: number;
  steps: RouteStep[];
  orderedStopIds: string[];
  source: "osrm" | "fallback";
}

// Titik Dapur Utama: Layah Catering, Tidar Atas, Malang
export const MALANG_DEPOT: LatLng = { lat: -7.9634, lng: 112.6075 };

// Bounding box Malang Raya untuk membatasi hasil geocoding Nominatim
const MALANG_VIEWBOX = "112.48,-7.85,112.76,-8.12";

const MALANG_LOCATIONS: { keywords: string[]; coords: LatLng }[] = [
  { keywords: ["tidar atas", "tidar", "karangbesuki"], coords: { lat: -7.9634, lng: 112.6075 } },
  { keywords: ["dieng", "pisang candi", "langsep"], coords: { lat: -7.9718, lng: 112.6119 } },
  { keywords: ["sigura", "sumbersari", "bendungan"], coords: { lat: -7.9585, lng: 112.6085 } },
  { keywords: ["veteran", "brawijaya", "ketawanggede", "dinoyo"], coords: { lat: -7.9525, lng: 112.6137 } },
  { keywords: ["soekarno hatta", "suhat", "mojolangu", "lowokwaru"], coords: { lat: -7.9439, lng: 112.6148 } },
  { keywords: ["ijen", "ijen nirwana", "oro-oro dowo", "bareng"], coords: { lat: -7.9772, lng: 112.6215 } },
  { keywords: ["kayutangan", "basuki rahmat", "alun-alun", "klojen"], coords: { lat: -7.9826, lng: 112.6308 } },
  { keywords: ["sukun", "bandulan", "mergan"], coords: { lat: -7.9912, lng: 112.6165 } },
  { keywords: ["blimbing", "sulfat", "araya", "pandanwangi"], coords: { lat: -7.9465, lng: 112.6465 } },
  { keywords: ["sawojajar", "danau bratan", "kedungkandang"], coords: { lat: -7.9778, lng: 112.6602 } },
  { keywords: ["dau", "landungsari", "sengkaling"], coords: { lat: -7.9265, lng: 112.596 } },
  { keywords: ["batu", "junrejo"], coords: { lat: -7.8712, lng: 112.5269 } },
  { keywords: ["singosari", "arjosari"], coords: { lat: -7.9175, lng: 112.6562 } },
  { keywords: ["malang"], coords: { lat: -7.9797, lng: 112.6304 } },
];

const geocodeCache = new Map<string, LatLng>();

function hashJitter(seed: string): { dLat: number; dLng: number } {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) | 0;
  }
  const dLat = ((h & 0xff) / 255 - 0.5) * 0.004;
  const dLng = (((h >> 8) & 0xff) / 255 - 0.5) * 0.004;
  return { dLat, dLng };
}

export function isWithinMalangRaya(point: LatLng): boolean {
  return haversineKm(MALANG_DEPOT, point) <= 35;
}

export function resolveFallbackCoords(order: Order): LatLng {
  const haystack = `${order.deliveryAddress} ${order.deliveryRoute}`.toLowerCase();
  const jitter = hashJitter(order.id);

  for (const loc of MALANG_LOCATIONS) {
    if (loc.keywords.some((k) => haystack.includes(k))) {
      return {
        lat: loc.coords.lat + jitter.dLat,
        lng: loc.coords.lng + jitter.dLng,
      };
    }
  }

  return {
    lat: MALANG_DEPOT.lat + jitter.dLat,
    lng: MALANG_DEPOT.lng + jitter.dLng,
  };
}

export async function geocodeOrderAddress(order: Order): Promise<LatLng> {
  const key = order.deliveryAddress.trim().toLowerCase();
  if (geocodeCache.has(key)) {
    return geocodeCache.get(key)!;
  }

  const queryText = key.includes("malang")
    ? order.deliveryAddress
    : `${order.deliveryAddress}, Malang, Jawa Timur`;

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=id&viewbox=${MALANG_VIEWBOX}&bounded=1&q=${encodeURIComponent(
        queryText
      )}`,
      { headers: { Accept: "application/json" } }
    );
    if (res.ok) {
      const results = (await res.json()) as { lat: string; lon: string }[];
      if (results.length > 0) {
        const coords = {
          lat: Number(results[0].lat),
          lng: Number(results[0].lon),
        };
        if (
          !Number.isNaN(coords.lat) &&
          !Number.isNaN(coords.lng) &&
          isWithinMalangRaya(coords)
        ) {
          geocodeCache.set(key, coords);
          return coords;
        }
      }
    }
  } catch {
    // Gunakan fallback koordinat lokal Malang
  }

  const fallback = resolveFallbackCoords(order);
  geocodeCache.set(key, fallback);
  return fallback;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

interface OsrmStep {
  name?: string;
  distance: number;
  duration: number;
  maneuver?: {
    type?: string;
    modifier?: string;
  };
}

function formatManeuver(step: OsrmStep): string {
  const type = step.maneuver?.type ?? "continue";
  const mod = step.maneuver?.modifier ?? "";
  const road = step.name?.trim() ? ` ke ${step.name.trim()}` : "";

  if (type === "depart") return `Mulai dari Tidar Atas${road}`;
  if (type === "arrive") return "Tiba di lokasi penerima";
  if (type === "roundabout") return `Masuk bundaran${road}`;
  if (mod.includes("left")) return `Belok kiri${road}`;
  if (mod.includes("right")) return `Belok kanan${road}`;
  if (mod === "uturn") return `Putar balik${road}`;
  return `Lurus terus${road}`;
}

export async function fetchShortestPath(
  origin: LatLng,
  stops: { id: string; coords: LatLng }[],
  optimizeOrder: boolean
): Promise<ComputedRoute> {
  if (stops.length === 0) {
    return {
      coordinates: [[origin.lat, origin.lng]],
      distanceKm: 0,
      durationMin: 0,
      steps: [],
      orderedStopIds: [],
      source: "fallback",
    };
  }

  const allPoints = [origin, ...stops.map((s) => s.coords)];
  const coordStr = allPoints.map((p) => `${p.lng},${p.lat}`).join(";");

  try {
    const endpoint =
      optimizeOrder && stops.length > 1
        ? `https://router.project-osrm.org/trip/v1/driving/${coordStr}?source=first&roundtrip=false&overview=full&geometries=geojson&steps=true`
        : `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true`;

    const res = await fetch(endpoint);
    if (res.ok) {
      const json = await res.json();
      const routeObj =
        optimizeOrder && stops.length > 1 ? json.trips?.[0] : json.routes?.[0];

      if (routeObj?.geometry?.coordinates?.length) {
        const leafletCoords: [number, number][] = routeObj.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

        const steps: RouteStep[] = [];
        for (const leg of routeObj.legs ?? []) {
          for (const st of leg.steps ?? []) {
            if (st.distance > 15 || st.maneuver?.type === "arrive") {
              steps.push({
                instruction: formatManeuver(st),
                distanceMeters: Math.round(st.distance),
                durationSeconds: Math.round(st.duration),
              });
            }
          }
        }

        let orderedStopIds = stops.map((s) => s.id);
        if (optimizeOrder && stops.length > 1 && Array.isArray(json.waypoints)) {
          const stopWaypoints = json.waypoints
            .slice(1)
            .map((wp: { waypoint_index: number }, idx: number) => ({
              id: stops[idx].id,
              order: wp.waypoint_index,
            }))
            .sort((a: { order: number }, b: { order: number }) => a.order - b.order);
          orderedStopIds = stopWaypoints.map((w: { id: string }) => w.id);
        }

        return {
          coordinates: leafletCoords,
          distanceKm: Number((routeObj.distance / 1000).toFixed(2)),
          durationMin: Math.max(1, Math.round(routeObj.duration / 60)),
          steps,
          orderedStopIds,
          source: "osrm",
        };
      }
    }
  } catch {
    // Lanjut ke fallback nearest-neighbor
  }

  const remaining = [...stops];
  const ordered: { id: string; coords: LatLng }[] = [];
  let cursor = origin;
  let totalKm = 0;

  while (remaining.length > 0) {
    let bestIdx = 0;
    if (optimizeOrder) {
      let bestDist = Infinity;
      for (let i = 0; i < remaining.length; i++) {
        const d = haversineKm(cursor, remaining[i].coords);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
    }
    const [picked] = remaining.splice(bestIdx, 1);
    totalKm += haversineKm(cursor, picked.coords);
    ordered.push(picked);
    cursor = picked.coords;
  }

  return {
    coordinates: [
      [origin.lat, origin.lng],
      ...ordered.map((s) => [s.coords.lat, s.coords.lng] as [number, number]),
    ],
    distanceKm: Number(totalKm.toFixed(2)),
    durationMin: Math.max(2, Math.round((totalKm / 25) * 60)),
    steps: ordered.map((s, idx) => ({
      instruction: `Tujuan ${idx + 1}: Menuju alamat penerima`,
      distanceMeters: Math.round(
        haversineKm(idx === 0 ? origin : ordered[idx - 1].coords, s.coords) * 1000
      ),
      durationSeconds: 0,
    })),
    orderedStopIds: ordered.map((s) => s.id),
    source: "fallback",
  };
}