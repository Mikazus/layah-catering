"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ClipboardList, Map as MapIcon, QrCode } from "lucide-react";
import { getOrdersApi } from "@/lib/api/orders";
import { updateDriverLocationApi } from "@/lib/api/driver";
import { useQrScanner } from "@/hooks/useQrScanner";
import {
  geocodeOrderAddress,
  isWithinMalangRaya,
  MALANG_DEPOT,
  resolveFallbackCoords,
  type LatLng,
} from "@/lib/utils/geo";
import { DriverHeader } from "@/components/driver/DriverHeader";
import { DriverOrderList } from "@/components/driver/DriverOrderList";
import { DriverRouteMap } from "@/components/driver/DriverRouteMap";
import { DualQrScanner } from "@/components/driver/DualQrScanner";
import { MismatchWarningView } from "@/components/driver/MismatchWarningView";
import { VerifiedDeliveryView } from "@/components/driver/VerifiedDeliveryView";
import type { Order } from "@/types/order";

type DriverTab = "queue" | "map" | "verify";

export default function DriverPage() {
  const [activeTab, setActiveTab] = useState<DriverTab>("queue");
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderCoords, setOrderCoords] = useState<Record<string, LatLng>>({});
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [routeMode, setRouteMode] = useState<"single" | "multi">("single");
  const [gpsOrigin, setGpsOrigin] = useState<LatLng | null>(null);
  const [isSharingLocation, setIsSharingLocation] = useState(false);

  const {
    kitchenQr,
    setKitchenQr,
    receiptQr,
    setReceiptQr,
    step,
    isVerifying,
    isUpdating,
    statusUpdated,
    verificationResult,
    verify,
    confirmDelivered,
    reset,
  } = useQrScanner();

  const loadOrders = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const data = await getOrdersApi();
      setOrders(data);

      const initialCoords: Record<string, LatLng> = {};
      for (const o of data) {
        initialCoords[o.id] = resolveFallbackCoords(o);
      }
      setOrderCoords((prev) => ({ ...initialCoords, ...prev }));

      const pending = data.filter(
        (o) => o.status === "ready" || o.status === "dispatched"
      );
      for (const o of pending) {
        geocodeOrderAddress(o).then((coords) => {
          setOrderCoords((prev) => ({ ...prev, [o.id]: coords }));
        });
      }
    } finally {
      setIsLoadingOrders(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const requestGps = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsOrigin({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setGpsOrigin(null);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  useEffect(() => {
    requestGps();
  }, [requestGps]);

  const effectiveOrigin = useMemo(() => {
    if (gpsOrigin && isWithinMalangRaya(gpsOrigin)) {
      return gpsOrigin;
    }
    return MALANG_DEPOT;
  }, [gpsOrigin]);

  // Continuously watch GPS & push live driver position to Neon DB when sharing is active
  useEffect(() => {
    if (!isSharingLocation) return;

    const targetOrder =
      selectedOrder ??
      orders.find((o) => o.status === "dispatched" || o.status === "ready");
    if (!targetOrder) return;

    let watchId: number | undefined;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setGpsOrigin(coords);
          if (isWithinMalangRaya(coords)) {
            updateDriverLocationApi({
              orderId: targetOrder.id,
              lat: coords.lat,
              lng: coords.lng,
            }).catch(() => {});
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 5000 }
      );
    }

    const heartbeat = setInterval(() => {
      updateDriverLocationApi({
        orderId: targetOrder.id,
        lat: effectiveOrigin.lat,
        lng: effectiveOrigin.lng,
      }).catch(() => {});
    }, 10000);

    return () => {
      if (watchId !== undefined && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
      clearInterval(heartbeat);
    };
  }, [isSharingLocation, selectedOrder, orders, effectiveOrigin]);

  const pendingCount = useMemo(
    () =>
      orders.filter((o) => o.status === "ready" || o.status === "dispatched")
        .length,
    [orders]
  );

  const handleNavigateSingle = (order: Order) => {
    setSelectedOrder(order);
    setRouteMode("single");
    setActiveTab("map");
  };

  const handleOptimizeAll = (pending: Order[]) => {
    if (pending.length > 0) setSelectedOrder(pending[0]);
    setRouteMode("multi");
    setActiveTab("map");
  };

  const handleOpenVerify = (order: Order) => {
    setSelectedOrder(order);
    reset();
    setKitchenQr(order.id);
    setReceiptQr("");
    setActiveTab("verify");
  };

  const handleConfirmDelivered = async () => {
    await confirmDelivered();
    setIsSharingLocation(false);
    await loadOrders();
  };

  return (
    <div className="flex flex-1 flex-col">
      <DriverHeader
        activeTab={activeTab}
        step={step}
        onRefresh={loadOrders}
        isRefreshing={isLoadingOrders}
      />

      <nav className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-[#18352B]/12 p-1 border border-[#18352B]/15">
        <button
          type="button"
          onClick={() => setActiveTab("queue")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "queue"
              ? "bg-[#18352B] text-[#FBF9F4] shadow-xs"
              : "text-[#18352B]/80 hover:bg-[#18352B]/10"
          }`}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          Antrean
          {pendingCount > 0 && (
            <span className="rounded-full bg-[#641E2A] px-1.5 py-0.2 text-[10px] font-bold text-[#FBF9F4]">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("map")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "map"
              ? "bg-[#18352B] text-[#FBF9F4] shadow-xs"
              : "text-[#18352B]/80 hover:bg-[#18352B]/10"
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" />
          Peta Rute
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("verify")}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-semibold transition-colors cursor-pointer ${
            activeTab === "verify"
              ? "bg-[#18352B] text-[#FBF9F4] shadow-xs"
              : "text-[#18352B]/80 hover:bg-[#18352B]/10"
          }`}
        >
          <QrCode className="h-3.5 w-3.5" />
          Scan QR
        </button>
      </nav>

      {activeTab === "queue" && (
        <DriverOrderList
          orders={orders}
          orderCoords={orderCoords}
          driverOrigin={effectiveOrigin}
          isLoading={isLoadingOrders}
          onNavigateSingle={handleNavigateSingle}
          onOptimizeAll={handleOptimizeAll}
          onVerifyOrder={handleOpenVerify}
        />
      )}

      {activeTab === "map" && (
        <DriverRouteMap
          orders={orders}
          selectedOrder={selectedOrder}
          routeMode={routeMode}
          orderCoords={orderCoords}
          driverOrigin={effectiveOrigin}
          usingGps={Boolean(gpsOrigin)}
          isSharingLocation={isSharingLocation}
          onToggleShareLocation={setIsSharingLocation}
          onRequestGps={requestGps}
          onSelectOrder={setSelectedOrder}
          onToggleMode={setRouteMode}
          onOpenVerify={handleOpenVerify}
          onOrderDispatched={loadOrders}
        />
      )}

      {activeTab === "verify" && (
        <div className="flex flex-1 flex-col pb-24">
          {step === "scanning" && (
            <DualQrScanner
              kitchenQr={kitchenQr}
              receiptQr={receiptQr}
              onKitchenQrChange={setKitchenQr}
              onReceiptQrChange={setReceiptQr}
              onVerify={verify}
              isVerifying={isVerifying}
            />
          )}

          {step === "mismatch" && (
            <MismatchWarningView
              message={verificationResult?.message}
              onRescan={reset}
            />
          )}

          {step === "verified" && verificationResult && (
            <VerifiedDeliveryView
              data={verificationResult}
              statusUpdated={statusUpdated}
              isUpdating={isUpdating}
              onConfirmDelivered={handleConfirmDelivered}
              onScanNext={() => {
                reset();
                setActiveTab("queue");
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
