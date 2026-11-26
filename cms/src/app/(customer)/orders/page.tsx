"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Package,
  RefreshCw,
} from "lucide-react";
import { getOrdersApi } from "@/lib/api/orders";
import { formatRupiah } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { OrderTrackingTimeline } from "@/components/customer/OrderTrackingTimeline";
import { CustomerTrackingMap } from "@/components/customer/CustomerTrackingMap";
import { CustomerReceiptQrCard } from "@/components/customer/CustomerReceiptQrCard";
import type { Order, OrderStatus } from "@/types/order";

const STATUS_BADGE: Record<
  OrderStatus,
  { label: string; variant: "green" | "burgundy" | "tan" | "outline" | "amber" }
> = {
  incoming: { label: "Menunggu Dapur", variant: "burgundy" },
  preparing: { label: "Dimasak", variant: "amber" },
  ready: { label: "Siap Kirim", variant: "tan" },
  dispatched: { label: "Sedang Diantar", variant: "green" },
  delivered: { label: "Selesai", variant: "green" },
  cancelled: { label: "Dibatalkan", variant: "outline" },
};

function CustomerOrdersContent() {
  const searchParams = useSearchParams();
  const requestedOrderId = searchParams.get("orderId");

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (silent = false) => {
      if (!silent) setRefreshing(true);
      try {
        const data = await getOrdersApi();
        setOrders(data);
        setError(null);
        setSelectedId((prev) => {
          if (
            requestedOrderId &&
            data.some(
              (o) => o.id.toLowerCase() === requestedOrderId.toLowerCase()
            )
          ) {
            return (
              data.find(
                (o) => o.id.toLowerCase() === requestedOrderId.toLowerCase()
              )?.id ?? data[0]?.id ?? ""
            );
          }
          if (prev && data.some((o) => o.id === prev)) return prev;
          return data[0]?.id ?? "";
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Gagal memuat daftar pesanan"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [requestedOrderId]
  );

  useEffect(() => {
    fetchOrders(false);
    const interval = setInterval(() => fetchOrders(true), 8000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const activeOrder =
    orders.find((o) => o.id === selectedId) ?? orders[0] ?? null;

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#18352B]/70 hover:text-[#18352B]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Menu Katalog
          </Link>
          <p className="mt-3 text-[10px] font-semibold tracking-[0.22em] uppercase text-[#18352B]/65">
            PELACAKAN &amp; VERIFIKASI PESANAN
          </p>
          <h1 className="mt-1 font-serif text-4xl sm:text-5xl font-medium text-[#18352B]">
            Pesanan Saya
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[#18352B]/75">
            Pantau status dapur, lokasi kurir secara langsung, dan tunjukkan QR
            Resi saat paket tiba.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchOrders(false)}
          className="inline-flex items-center gap-2 rounded-md border border-[#18352B]/30 bg-[#EFE9DC] px-4 py-2 text-xs font-semibold text-[#18352B] hover:bg-[#DDD2BC] cursor-pointer"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
          />
          Sinkronkan Status
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-[#641E2A]/35 bg-[#F3E4E6] px-4 py-3 text-xs text-[#641E2A]">
          {error}
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-[#18352B]/20 bg-[#EFE9DC]/70 p-12 text-center text-sm text-[#18352B]/70">
          Memuat riwayat dan pelacakan pesanan Anda...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#18352B]/30 bg-[#EFE9DC]/60 px-6 py-16 text-center">
          <Package className="mx-auto h-10 w-10 text-[#18352B]/50" />
          <h2 className="mt-3 font-serif text-2xl font-medium text-[#18352B]">
            Belum Ada Pesanan Aktif
          </h2>
          <p className="mt-1.5 text-xs text-[#18352B]/70 max-w-md mx-auto">
            Pesanan yang Anda buat melalui Menu Katalog akan otomatis muncul di
            halaman ini lengkap dengan pelacakan kurir dan QR verifikasi.
          </p>
          <Link
            href="/catalog"
            className="mt-6 inline-flex items-center justify-center rounded-md bg-[#641E2A] px-6 py-2.5 text-sm font-medium text-[#FBF9F4] hover:bg-[#4E1620]"
          >
            Mulai Pesan Sekarang
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Customer's Orders List */}
          <aside className="lg:col-span-3 space-y-2.5">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#18352B]/65 px-1">
              DAFTAR PESANAN ({orders.length})
            </p>
            <div className="flex lg:flex-col gap-2.5 overflow-x-auto pb-2 lg:pb-0">
              {orders.map((ord) => {
                const isSelected = activeOrder?.id === ord.id;
                const badge = STATUS_BADGE[ord.status];
                const qty = ord.items.reduce((s, i) => s + i.quantity, 0);

                return (
                  <button
                    key={ord.id}
                    type="button"
                    onClick={() => setSelectedId(ord.id)}
                    className={`min-w-[240px] lg:min-w-0 w-full text-left rounded-xl p-4 border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#18352B] border-[#18352B] text-[#FBF9F4] shadow-md"
                        : "bg-[#FBF9F4] border-[#18352B]/15 text-[#18352B] hover:border-[#18352B]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">{ord.orderCode}</span>
                      <Badge
                        variant={isSelected ? "tan" : badge.variant}
                        dot={!isSelected}
                      >
                        {badge.label}
                      </Badge>
                    </div>
                    <p
                      className={`mt-1.5 text-xs ${
                        isSelected ? "text-[#C9B99A]" : "text-[#18352B]/70"
                      }`}
                    >
                      {qty} porsi · Resi {ord.receiptCode}
                    </p>
                    <p className="mt-2 text-sm font-bold">
                      {formatRupiah(ord.totalAmount)}
                    </p>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Right Column: Live Tracking Dashboard */}
          {activeOrder && (
            <section className="lg:col-span-9 space-y-6">
              {/* 1. Order Status Stepper */}
              <OrderTrackingTimeline order={activeOrder} />

              {/* 2. Live Driver Map + Scannable Customer QR Code */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
                <div className="xl:col-span-7">
                  <CustomerTrackingMap
                    order={activeOrder}
                    onRefresh={() => fetchOrders(false)}
                    isRefreshing={refreshing}
                  />
                </div>
                <div className="xl:col-span-5 flex">
                  <div className="w-full flex flex-col">
                    <CustomerReceiptQrCard order={activeOrder} />
                  </div>
                </div>
              </div>

              {/* 3. Order Items & Delivery Summary */}
              <div className="rounded-xl border border-[#18352B]/20 bg-[#FBF9F4] p-5 sm:p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#18352B]/12">
                  <h3 className="font-serif text-xl font-medium text-[#18352B]">
                    Rincian Hidangan
                  </h3>
                  <span className="text-xs font-semibold text-[#18352B]/70">
                    Total: {formatRupiah(activeOrder.totalAmount)}
                  </span>
                </div>

                {activeOrder.allergyAlert && (
                  <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#641E2A]/30 bg-[#F3E4E6] px-3.5 py-2.5 text-xs font-semibold text-[#641E2A]">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Catatan Alergen Aktif: {activeOrder.allergyAlert}
                  </div>
                )}

                <div className="mt-3 divide-y divide-[#18352B]/10 text-sm">
                  {activeOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-3 gap-4"
                    >
                      <div>
                        <span className="font-bold text-[#18352B] mr-2">
                          {item.quantity}x
                        </span>
                        <span className="font-medium text-[#18352B]">
                          {item.menuName}
                        </span>
                        {item.allergenNote && (
                          <p className="text-xs text-[#641E2A] mt-0.5">
                            Catatan: {item.allergenNote}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-[#18352B] shrink-0">
                        {formatRupiah(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default function CustomerOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="p-10 text-center text-sm text-[#18352B]/70">
          Memuat halaman pelacakan pesanan...
        </div>
      }
    >
      <CustomerOrdersContent />
    </Suspense>
  );
}
