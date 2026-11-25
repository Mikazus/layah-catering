import React from "react";
import { AlertTriangle, Clock } from "lucide-react";
import {
  formatElapsedMinutes,
  formatWibOrderReceived,
} from "@/lib/utils/format";
import type { Order } from "@/types/order";

interface OrderDetailCardProps {
  order: Order;
}

export function OrderDetailCard({ order }: OrderDetailCardProps) {
  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
  const received = formatWibOrderReceived(order.createdAt);

  return (
    <div className="rounded-2xl bg-[#FBF9F4] p-7 shadow-xs border border-[#18352B]/10">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-medium text-[#18352B]">
          Order details
        </h2>
        <span className="inline-flex items-center gap-1.5 text-xs text-[#18352B]/60">
          <Clock className="h-3.5 w-3.5" />
          {formatElapsedMinutes(order.elapsedMinutes)}
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-5 border-b border-[#18352B]/12 pb-6 text-xs">
        <div>
          <p className="text-[11px] text-[#18352B]/55">Customer</p>
          <p className="mt-1 text-sm font-semibold text-[#18352B]">
            {order.customerName}
          </p>
          <p className="mt-0.5 text-[#18352B]/65">{order.customerPhone}</p>
        </div>

        <div>
          <p className="text-[11px] text-[#18352B]/55">Order received</p>
          <p className="mt-1 text-sm font-semibold text-[#18352B]">
            {received.timeLabel}
          </p>
          <p className="mt-0.5 text-[#18352B]/65">{received.dateLabel}</p>
        </div>

        <div>
          <p className="text-[11px] text-[#18352B]/55">Delivery route</p>
          <p className="mt-1 text-sm font-semibold text-[#18352B]">
            {order.deliveryRoute}
          </p>
          <p className="mt-0.5 text-[#18352B]/65">{order.deliveryAddress}</p>
        </div>

        <div>
          <p className="text-[11px] text-[#18352B]/55">Scheduled delivery</p>
          <p className="mt-1 text-sm font-semibold text-[#18352B]">
            {order.scheduledLabel || `${order.scheduledTime} WIB`}
          </p>
          <p className="mt-0.5 text-[#18352B]/65">
            {order.serviceType || "Home delivery"}
          </p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.15em] uppercase text-[#18352B]/55 pb-2.5 border-b border-[#18352B]/10">
          <div className="flex items-center gap-6">
            <span className="w-10">QTY</span>
            <span>ORDERED ITEMS</span>
          </div>
          <span>{totalItems} items</span>
        </div>

        <div className="divide-y divide-[#18352B]/10">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-4"
            >
              <div className="flex items-center gap-6">
                <span className="flex h-9 w-10 items-center justify-center rounded-md bg-[#EFE9DC] text-xs font-bold text-[#18352B]">
                  {item.quantity}x
                </span>
                <div>
                  <p className="text-sm font-semibold text-[#18352B]">
                    {item.menuName}
                  </p>
                  {item.description && (
                    <p
                      className={`text-xs mt-0.5 ${
                        item.allergenNote
                          ? "font-medium text-[#641E2A]"
                          : "text-[#18352B]/60"
                      }`}
                    >
                      {item.description}
                    </p>
                  )}
                  {!item.description && item.allergenNote && (
                    <p className="text-xs mt-0.5 font-medium text-[#641E2A]">
                      {item.allergenNote}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs text-[#18352B]/55">{item.category}</span>
            </div>
          ))}
        </div>
      </div>

      {(order.allergyInstruction || order.allergyAlert) && (
        <div className="mt-6 rounded-xl border border-[#641E2A]/35 bg-[#F3E4E6] px-5 py-4 text-[#641E2A]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">
                WARNING: {order.allergyAlert}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#641E2A]/90">
                {order.allergyInstruction ||
                  "Use clean utensils and a separate preparation area. Avoid cross-contact."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
