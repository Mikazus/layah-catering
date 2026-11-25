"use client";

import React from "react";
import { AlertTriangle, Eye } from "lucide-react";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types/order";

interface ManagementOrdersTableProps {
  orders: Order[];
  onInspect: (order: Order) => void;
}

const STATUS_BADGE: Record<
  OrderStatus,
  { label: string; variant: "green" | "burgundy" | "tan" | "outline" | "amber" }
> = {
  incoming: { label: "Incoming", variant: "burgundy" },
  preparing: { label: "Preparing", variant: "amber" },
  ready: { label: "Ready", variant: "tan" },
  dispatched: { label: "Dispatched", variant: "outline" },
  delivered: { label: "Diantar", variant: "green" },
  cancelled: { label: "Dibatalkan", variant: "outline" },
};

export function ManagementOrdersTable({
  orders,
  onInspect,
}: ManagementOrdersTableProps) {
  return (
    <Table
      headers={[
        { label: "ID Pesanan" },
        { label: "Pelanggan" },
        { label: "Rute & Jadwal" },
        { label: "Porsi & Alergen" },
        { label: "Status" },
        { label: "Total", align: "right" },
        { label: "Aksi", align: "right" },
      ]}
    >
      {orders.length === 0 ? (
        <tr>
          <td
            colSpan={7}
            className="px-4 py-10 text-center text-xs text-[#18352B]/65"
          >
            Tidak ada pesanan yang cocok dengan filter saat ini.
          </td>
        </tr>
      ) : (
        orders.map((order) => {
          const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
          const st = STATUS_BADGE[order.status];
          return (
            <tr
              key={order.id}
              className="hover:bg-[#18352B]/5 transition-colors"
            >
              <td className="px-4 py-3.5 text-xs font-bold text-[#18352B]">
                {order.orderCode}
                <div className="text-[10px] font-normal text-[#18352B]/60">
                  {order.receiptCode}
                </div>
              </td>
              <td className="px-4 py-3.5">
                <p className="text-xs font-semibold text-[#18352B]">
                  {order.customerName}
                </p>
                <p className="text-[11px] text-[#18352B]/65">
                  {order.customerPhone}
                </p>
              </td>
              <td className="px-4 py-3.5 text-xs text-[#18352B]/80">
                <p>{order.deliveryRoute}</p>
                <p className="text-[11px] text-[#18352B]/60">
                  {order.scheduledLabel || order.scheduledTime}
                </p>
              </td>
              <td className="px-4 py-3.5 text-xs">
                <p className="font-medium text-[#18352B]">{totalQty} porsi</p>
                {order.allergyAlert && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[#641E2A]">
                    <AlertTriangle className="h-3 w-3" />
                    {order.allergyAlert}
                  </span>
                )}
              </td>
              <td className="px-4 py-3.5">
                <Badge variant={st.variant} dot>
                  {st.label}
                </Badge>
              </td>
              <td className="px-4 py-3.5 text-right text-xs font-semibold text-[#18352B]">
                {formatRupiah(order.totalAmount)}
              </td>
              <td className="px-4 py-3.5 text-right">
                <button
                  type="button"
                  onClick={() => onInspect(order)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-[#18352B]/35 px-2.5 py-1 text-xs font-semibold text-[#18352B] hover:bg-[#18352B] hover:text-[#FBF9F4] transition-colors cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Detail
                </button>
              </td>
            </tr>
          );
        })
      )}
    </Table>
  );
}
