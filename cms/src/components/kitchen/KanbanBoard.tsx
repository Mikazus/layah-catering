"use client";

import React from "react";
import { OrderTicketCard } from "@/components/kitchen/OrderTicketCard";
import type { Order, OrderStatus } from "@/types/order";

interface KanbanBoardProps {
  orders: Order[];
  onAdvanceStatus: (orderId: string, nextStatus: OrderStatus) => void;
}

const COLUMNS: {
  key: OrderStatus;
  title: string;
  subtitle: string;
  dotColor: string;
}[] = [
  {
    key: "incoming",
    title: "Incoming",
    subtitle: "Review & confirm",
    dotColor: "bg-[#641E2A]",
  },
  {
    key: "preparing",
    title: "Preparing",
    subtitle: "Made with care",
    dotColor: "bg-[#9E6B24]",
  },
  {
    key: "ready",
    title: "Ready to dispatch",
    subtitle: "Packed & checked",
    dotColor: "bg-[#18352B]",
  },
];

export function KanbanBoard({ orders, onAdvanceStatus }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.key);

        return (
          <section
            key={col.key}
            className="flex flex-col rounded-2xl bg-[#EFE9DC]/85 p-4 border border-[#18352B]/10 min-h-[520px]"
          >
            {/* Column Header */}
            <div className="mb-4 flex items-start justify-between px-1">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${col.dotColor}`} />
                  <h2 className="font-serif text-2xl font-medium text-[#18352B]">
                    {col.title}
                  </h2>
                </div>
                <p className="mt-0.5 text-[11px] text-[#18352B]/55">
                  {col.subtitle}
                </p>
              </div>
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full border border-[#18352B]/20 bg-[#FBF9F4] px-2 text-xs font-semibold text-[#18352B]">
                {colOrders.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3.5 flex-1">
              {colOrders.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-[#18352B]/20 text-xs text-[#18352B]/50">
                  No orders in this stage
                </div>
              ) : (
                colOrders.map((order) => (
                  <OrderTicketCard
                    key={order.id}
                    order={order}
                    onAdvanceStatus={onAdvanceStatus}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
