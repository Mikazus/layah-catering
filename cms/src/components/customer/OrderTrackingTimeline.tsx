import React from "react";
import {
  Check,
  ChefHat,
  ClipboardCheck,
  PackageCheck,
  Truck,
  XCircle,
} from "lucide-react";
import type { Order, OrderStatus } from "@/types/order";

interface OrderTrackingTimelineProps {
  order: Order;
}

const STEPS: {
  key: OrderStatus;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    key: "incoming",
    label: "Pesanan Masuk",
    desc: "Menunggu konfirmasi dapur",
    icon: ClipboardCheck,
  },
  {
    key: "preparing",
    label: "Dimasak",
    desc: "Hidangan sedang disiapkan",
    icon: ChefHat,
  },
  {
    key: "ready",
    label: "Siap Dikirim",
    desc: "Paket dikemas & berlabel QR",
    icon: PackageCheck,
  },
  {
    key: "dispatched",
    label: "Diantar Kurir",
    desc: "Kurir menuju lokasi Anda",
    icon: Truck,
  },
  {
    key: "delivered",
    label: "Selesai",
    desc: "Terverifikasi & diterima",
    icon: Check,
  },
];

const STATUS_INDEX: Record<OrderStatus, number> = {
  incoming: 0,
  preparing: 1,
  ready: 2,
  dispatched: 3,
  delivered: 4,
  cancelled: -1,
};

export function OrderTrackingTimeline({ order }: OrderTrackingTimelineProps) {
  if (order.status === "cancelled") {
    return (
      <div className="rounded-xl border border-[#641E2A]/35 bg-[#F3E4E6] p-5 flex items-center gap-3 text-[#641E2A]">
        <XCircle className="h-6 w-6 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Pesanan Dibatalkan</p>
          <p className="text-xs opacity-85">
            Pesanan {order.orderCode} tidak lagi diproses. Hubungi Layah Catering untuk bantuan.
          </p>
        </div>
      </div>
    );
  }

  const activeIdx = STATUS_INDEX[order.status] ?? 0;

  return (
    <div className="rounded-xl border border-[#18352B]/20 bg-[#FBF9F4] p-5 sm:p-6 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#18352B]/12">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#18352B]/60">
            STATUS PESANAN REAL-TIME
          </p>
          <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-medium text-[#18352B]">
            {STEPS[activeIdx]?.label}
          </h2>
        </div>
        <div className="text-left sm:text-right text-xs text-[#18352B]/70">
          <p className="font-semibold text-[#18352B]">{order.orderCode}</p>
          <p>
            Estimasi: {order.scheduledLabel || `${order.scheduledTime} WIB`}
          </p>
        </div>
      </div>

      {/* Horizontal stepper on desktop, vertical on mobile */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-5 gap-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < activeIdx || order.status === "delivered";
          const isCurrent = idx === activeIdx && order.status !== "delivered";

          return (
            <div
              key={step.key}
              className="relative flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2"
            >
              {/* Connector line on desktop */}
              {idx < STEPS.length - 1 && (
                <div
                  className={`hidden sm:block absolute top-5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-[2px] ${
                    idx < activeIdx ? "bg-[#18352B]" : "bg-[#18352B]/20"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  isCompleted
                    ? "bg-[#18352B] border-[#18352B] text-[#FBF9F4]"
                    : isCurrent
                    ? "bg-[#641E2A] border-[#641E2A] text-[#FBF9F4] ring-4 ring-[#641E2A]/20"
                    : "bg-[#EFE9DC] border-[#18352B]/25 text-[#18352B]/45"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <p
                  className={`text-xs font-semibold ${
                    isCompleted || isCurrent
                      ? "text-[#18352B]"
                      : "text-[#18352B]/45"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-[11px] text-[#18352B]/60 leading-snug mt-0.5">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
