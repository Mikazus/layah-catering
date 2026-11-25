"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getOrderByIdApi, updateOrderStatusApi } from "@/lib/api/orders";
import { OrderDetailCard } from "@/components/kitchen/OrderDetailCard";
import { QrLabelPanel } from "@/components/kitchen/QrLabelPanel";
import { KitchenFooter } from "@/components/kitchen/KitchenFooter";
import { Badge } from "@/components/ui/Badge";
import type { Order, OrderStatus } from "@/types/order";

const STATUS_LABELS: Record<OrderStatus, string> = {
  incoming: "Incoming",
  preparing: "Preparing",
  ready: "Ready to dispatch",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function KitchenOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = decodeURIComponent(params.id);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderByIdApi(orderId)
      .then(setOrder)
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    if (!order) return;
    const updated = await updateOrderStatusApi(order.id, nextStatus);
    setOrder(updated);
  };

  return (
    <>
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-8 py-7">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#18352B]/65">
          <Link
            href="/kitchen"
            className="inline-flex items-center gap-1 hover:text-[#18352B]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kitchen display
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#18352B]">
            {order?.orderCode || `#${orderId}`}
          </span>
        </div>

        {/* Title Row */}
        <div className="mt-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-4xl font-medium text-[#18352B]">
                Order {order?.orderCode || `#${orderId}`}
              </h1>
              {order && (
                <Badge
                  variant={
                    order.status === "incoming"
                      ? "amber"
                      : order.status === "ready" || order.status === "delivered"
                      ? "green"
                      : "tan"
                  }
                >
                  {STATUS_LABELS[order.status]}
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-[#18352B]/70">
              Every detail matters. Review this order before preparation.
            </p>
          </div>

          <Link
            href="/kitchen"
            className="inline-flex items-center gap-2 rounded-lg bg-[#FBF9F4] px-4 py-2.5 text-xs font-semibold text-[#18352B] shadow-xs border border-[#18352B]/15 hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to kitchen
          </Link>
        </div>

        {/* Content Grid */}
        {loading ? (
          <div className="mt-8 rounded-xl bg-[#FBF9F4] p-12 text-center text-sm text-[#18352B]/70">
            Loading order details...
          </div>
        ) : !order ? (
          <div className="mt-8 rounded-xl bg-[#FBF9F4] p-12 text-center text-sm text-[#641E2A]">
            Order #{orderId} was not found.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-12 gap-6 items-start">
            <div className="col-span-8">
              <OrderDetailCard order={order} />
            </div>
            <div className="col-span-4">
              <QrLabelPanel
                order={order}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        )}
      </main>

      <KitchenFooter />
    </>
  );
}
