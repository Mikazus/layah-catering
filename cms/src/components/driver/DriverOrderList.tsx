"use client";

import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  MapPin,
  Navigation,
  Package,
  Phone,
  QrCode,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { haversineKm, type LatLng } from "@/lib/utils/geo";
import type { Order } from "@/types/order";

interface DriverOrderListProps {
  orders: Order[];
  orderCoords: Record<string, LatLng>;
  driverOrigin: LatLng;
  isLoading: boolean;
  onNavigateSingle: (order: Order) => void;
  onOptimizeAll: (pendingOrders: Order[]) => void;
  onVerifyOrder: (order: Order) => void;
}

type QueueFilter = "pending" | "ready" | "dispatched" | "delivered";

export function DriverOrderList({
  orders,
  orderCoords,
  driverOrigin,
  isLoading,
  onNavigateSingle,
  onOptimizeAll,
  onVerifyOrder,
}: DriverOrderListProps) {
  const [filter, setFilter] = useState<QueueFilter>("pending");

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === "ready" || o.status === "dispatched"),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const base = orders.filter((o) => {
      if (filter === "pending") {
        return o.status === "ready" || o.status === "dispatched";
      }
      return o.status === filter;
    });

    // Sort nearest first based on current driver origin
    return [...base].sort((a, b) => {
      const ca = orderCoords[a.id];
      const cb = orderCoords[b.id];
      if (!ca || !cb) return 0;
      return haversineKm(driverOrigin, ca) - haversineKm(driverOrigin, cb);
    });
  }, [orders, filter, orderCoords, driverOrigin]);

  const counts = useMemo(
    () => ({
      pending: pendingOrders.length,
      ready: orders.filter((o) => o.status === "ready").length,
      dispatched: orders.filter((o) => o.status === "dispatched").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    }),
    [orders, pendingOrders]
  );

  return (
    <div className="flex flex-1 flex-col space-y-4 pb-24">
      {/* Header & Optimize Multi-Stop CTA */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-[#18352B] tracking-tight font-sans">
            Antrean Pengiriman
          </h1>
          <p className="mt-0.5 text-xs text-[#18352B]/75">
            {counts.pending} paket menunggu diantar · diurutkan dari jarak terdekat.
          </p>
        </div>
      </div>

      {pendingOrders.length > 0 && (
        <div className="rounded-xl bg-[#18352B] p-4 text-[#FBF9F4] shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-[#C9B99A]">
                RUTE TERCEPAT OTOMATIS
              </p>
              <p className="mt-1 text-xs text-[#FBF9F4]/90">
                Optimalkan urutan {pendingOrders.length} titik pengantaran sekaligus di peta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOptimizeAll(pendingOrders)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-[#641E2A] px-3 py-2 text-xs font-semibold text-[#FBF9F4] hover:bg-[#4E1620] transition-colors cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Optimasi
            </button>
          </div>
        </div>
      )}

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(
          [
            { key: "pending", label: `Perlu Diantar (${counts.pending})` },
            { key: "ready", label: `Siap Kirim (${counts.ready})` },
            { key: "dispatched", label: `Di Jalan (${counts.dispatched})` },
            { key: "delivered", label: `Selesai (${counts.delivered})` },
          ] as { key: QueueFilter; label: string }[]
        ).map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
              filter === tab.key
                ? "bg-[#18352B] text-[#FBF9F4]"
                : "border border-[#18352B]/25 bg-[#DDD2BC]/70 text-[#18352B] hover:bg-[#DDD2BC]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Order Cards */}
      {isLoading ? (
        <div className="rounded-xl border border-[#18352B]/20 bg-[#EFE9DC]/70 p-8 text-center text-xs text-[#18352B]/70">
          Memuat daftar pesanan pengiriman...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#18352B]/30 bg-[#EFE9DC]/50 p-8 text-center">
          <Package className="mx-auto h-7 w-7 text-[#18352B]/50" />
          <p className="mt-2 text-sm font-semibold text-[#18352B]">
            Tidak ada pesanan di kategori ini
          </p>
          <p className="mt-1 text-xs text-[#18352B]/65">
            Pesanan yang berstatus &ldquo;Ready to dispatch&rdquo; dari dapur akan otomatis muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const coords = orderCoords[order.id];
            const distKm = coords ? haversineKm(driverOrigin, coords) : null;
            const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
            const isDelivered = order.status === "delivered";

            return (
              <article
                key={order.id}
                className="rounded-xl border border-[#18352B]/20 bg-[#FBF9F4] p-4 shadow-xs"
              >
                {/* Top Meta */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#18352B]">
                      {order.orderCode}
                    </span>
                    <span className="text-[10px] font-medium text-[#18352B]/55">
                      · {order.receiptCode}
                    </span>
                  </div>
                  <Badge
                    variant={
                      isDelivered
                        ? "green"
                        : order.status === "dispatched"
                        ? "amber"
                        : "burgundy"
                    }
                    dot
                  >
                    {isDelivered
                      ? "Diantar"
                      : order.status === "dispatched"
                      ? "Dalam Perjalanan"
                      : "Siap Kirim"}
                  </Badge>
                </div>

                {/* Recipient & Distance */}
                <div className="mt-2 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#18352B] font-sans leading-tight">
                      {order.customerName}
                    </h3>
                    <p className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-[#18352B]/65">
                      <Clock className="h-3 w-3" />
                      Target: {order.scheduledLabel || `${order.scheduledTime} WIB`} ·{" "}
                      {totalQty} porsi
                    </p>
                  </div>
                  {distKm !== null && (
                    <span className="shrink-0 rounded-md bg-[#EFE9DC] px-2 py-1 text-[11px] font-bold text-[#18352B]">
                      {distKm < 100 ? `${distKm.toFixed(1)} km` : order.deliveryRoute.split("·")[0]}
                    </span>
                  )}
                </div>

                {/* Address */}
                <div className="mt-2.5 flex items-start gap-2 rounded-lg bg-[#EFE9DC]/75 p-2.5 text-xs text-[#18352B]/85">
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-[#641E2A]" />
                  <span className="leading-snug">{order.deliveryAddress}</span>
                </div>

                {/* Allergy Warning if present */}
                {order.allergyAlert && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-[#F3E4E6] px-2.5 py-1 text-[11px] font-semibold text-[#641E2A]">
                    <AlertTriangle className="h-3 w-3 shrink-0" />
                    Perhatian Alergen: {order.allergyAlert}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-3.5 flex items-center gap-2 pt-2.5 border-t border-[#18352B]/10">
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#18352B]/30 text-[#18352B] hover:bg-[#18352B]/10"
                    title={`Hubungi ${order.customerName}`}
                    aria-label={`Hubungi ${order.customerName}`}
                  >
                    <Phone className="h-4 w-4" />
                  </a>

                  <Button
                    variant="green"
                    size="sm"
                    className="flex-1 py-2"
                    onClick={() => onNavigateSingle(order)}
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Rute Tercepat
                  </Button>

                  {!isDelivered ? (
                    <Button
                      variant="burgundy"
                      size="sm"
                      className="flex-1 py-2"
                      onClick={() => onVerifyOrder(order)}
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      Verifikasi QR
                    </Button>
                  ) : (
                    <span className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold text-[#18352B]">
                      <CheckCircle2 className="h-4 w-4" />
                      Terkirim
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}