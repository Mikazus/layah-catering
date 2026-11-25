"use client";

import React from "react";
import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Printer } from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import type { Order } from "@/types/order";

interface OrderHistoryTableProps {
  orders: Order[];
}

export function OrderHistoryTable({ orders }: OrderHistoryTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#18352B]/25 bg-[#EFE9DC]/70">
      <Table
        headers={[
          { label: "Order ID" },
          { label: "Customer" },
          { label: "Route & Schedule" },
          { label: "Items" },
          { label: "Dietary Note" },
          { label: "Status" },
          { label: "Actions", align: "right" },
        ]}
      >
        {orders.length === 0 ? (
          <tr>
            <td
              colSpan={7}
              className="px-4 py-10 text-center text-xs text-[#18352B]/60"
            >
              No completed or dispatched orders match your filter.
            </td>
          </tr>
        ) : (
          orders.map((order) => {
            const qtyCount = order.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <tr
                key={order.id}
                className="hover:bg-[#18352B]/5 transition-colors"
              >
                <td className="px-4 py-3.5 font-bold text-[#18352B] text-xs">
                  {order.orderCode}
                  <div className="text-[10px] font-normal text-[#18352B]/55">
                    {order.receiptCode}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <p className="font-semibold text-[#18352B] text-xs">
                    {order.customerName}
                  </p>
                  <p className="text-[11px] text-[#18352B]/60">
                    {order.customerPhone}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-xs text-[#18352B]/80">
                  <p>{order.deliveryRoute}</p>
                  <p className="text-[11px] text-[#18352B]/55">
                    {order.dispatchedAt || order.scheduledLabel}
                  </p>
                </td>
                <td className="px-4 py-3.5 text-xs text-[#18352B]">
                  {qtyCount} items ({order.items.length} menu)
                </td>
                <td className="px-4 py-3.5">
                  {order.allergyAlert ? (
                    <Badge variant="burgundy">
                      <AlertTriangle className="h-3 w-3" />
                      {order.allergyAlert}
                    </Badge>
                  ) : (
                    <span className="text-xs text-[#18352B]/50">None</span>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  <Badge
                    variant={
                      order.status === "delivered"
                        ? "green"
                        : order.status === "dispatched"
                        ? "amber"
                        : "tan"
                    }
                    dot
                  >
                    {order.status === "delivered"
                      ? "Delivered"
                      : order.status === "dispatched"
                      ? "Dispatched"
                      : order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3.5 text-right">
                  <div className="inline-flex items-center gap-3">
                    <Link
                      href={`/kitchen/orders/${encodeURIComponent(order.id)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#641E2A] hover:underline"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Label
                    </Link>
                    <Link
                      href={`/kitchen/orders/${encodeURIComponent(order.id)}`}
                      className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#18352B] hover:underline"
                    >
                      View
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </td>
              </tr>
            );
          })
        )}
      </Table>
    </div>
  );
}
