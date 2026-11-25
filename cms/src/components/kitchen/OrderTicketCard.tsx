"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Clock, MapPin } from "lucide-react";
import { formatElapsedMinutes } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types/order";

interface OrderTicketCardProps {
  order: Order;
  onAdvanceStatus?: (orderId: string, nextStatus: OrderStatus) => void;
}

const NEXT_STAGE: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  incoming: { status: "preparing", label: "Start Prep" },
  preparing: { status: "ready", label: "Mark Ready" },
  ready: { status: "dispatched", label: "Dispatch" },
};

export function OrderTicketCard({
  order,
  onAdvanceStatus,
}: OrderTicketCardProps) {
  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const hasAllergy = Boolean(order.allergyAlert);
  const nextAction = NEXT_STAGE[order.status];

  return (
    <div
      className={`rounded-xl bg-[#FBF9F4] p-4 shadow-xs transition-shadow hover:shadow-md border ${
        hasAllergy ? "border-[#641E2A]/60" : "border-[#18352B]/10"
      }`}
    >
      {/* Top row: Order code + elapsed */}
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-bold tracking-wide text-[#18352B]">
          {order.orderCode}
        </span>
        <span className="inline-flex items-center gap-1 text-[#18352B]/55">
          <Clock className="h-3 w-3" />
          {formatElapsedMinutes(order.elapsedMinutes)}
        </span>
      </div>

      {/* Customer Name */}
      <h3 className="mt-1.5 font-serif text-2xl font-medium text-[#18352B] leading-tight">
        {order.customerName}
      </h3>

      {/* Items List */}
      <ul className="mt-3 space-y-1 text-xs text-[#18352B]/85">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-baseline gap-2">
            <span className="font-semibold text-[#18352B]/65 w-6">
              {item.quantity}x
            </span>
            <span className="truncate">{item.menuName}</span>
          </li>
        ))}
      </ul>

      {/* Allergy Pill / Special Request Row */}
      <div className="mt-4 flex items-center justify-between gap-2">
        {hasAllergy ? (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-[#F3E4E6] px-2.5 py-1 text-[11px] font-semibold text-[#641E2A]">
            <AlertTriangle className="h-3 w-3 shrink-0" />
            {order.allergyAlert}
          </span>
        ) : (
          <span className="text-[11px] text-[#18352B]/50">
            No special requests
          </span>
        )}
        <span className="text-[11px] text-[#18352B]/55">{totalItems} items</span>
      </div>

      {/* Divider + Footer */}
      <div className="mt-3.5 flex items-center justify-between border-t border-[#18352B]/10 pt-3 text-[11px]">
        <span className="inline-flex items-center gap-1 text-[#18352B]/65 truncate">
          <MapPin className="h-3 w-3 shrink-0" />
          {order.deliveryRoute} · {order.scheduledTime}
        </span>

        <div className="flex items-center gap-2.5 shrink-0">
          {nextAction && onAdvanceStatus && (
            <button
              type="button"
              onClick={() => onAdvanceStatus(order.id, nextAction.status)}
              className="rounded px-2 py-0.5 text-[10px] font-semibold bg-[#18352B]/10 text-[#18352B] hover:bg-[#18352B] hover:text-[#FBF9F4] transition-colors cursor-pointer"
            >
              {nextAction.label}
            </button>
          )}
          <Link
            href={`/kitchen/orders/${encodeURIComponent(order.id)}`}
            className="inline-flex items-center gap-0.5 font-semibold text-[#641E2A] hover:underline"
          >
            View
            <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
