"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useKdsOrders } from "@/hooks/useKdsOrders";
import { OrderHistoryTable } from "@/components/kitchen/OrderHistoryTable";
import { KitchenFooter } from "@/components/kitchen/KitchenFooter";
import { Select } from "@/components/ui/Select";

function OrderHistoryContent() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim().toLowerCase();
  const { orders, lastSynced } = useKdsOrders();
  const [statusFilter, setStatusFilter] = useState("all");

  const historyOrders = useMemo(() => {
    return orders.filter((o) => {
      const isArchive =
        statusFilter === "all"
          ? o.status === "dispatched" || o.status === "delivered" || o.status === "ready"
          : o.status === statusFilter;

      if (!isArchive) return false;
      if (!query) return true;
      return `${o.orderCode} ${o.customerName} ${o.receiptCode} ${o.deliveryRoute}`
        .toLowerCase()
        .includes(query);
    });
  }, [orders, statusFilter, query]);

  return (
    <>
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-8 py-7 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#18352B]/65">
              KITCHEN ARCHIVE
            </p>
            <h1 className="mt-1 font-serif text-4xl font-medium text-[#18352B]">
              Order history
            </h1>
            <p className="mt-1 text-xs text-[#18352B]/70">
              Completed, dispatched, and ready-for-handover kitchen logs with
              instant QR label reprinting.
            </p>
          </div>

          <div className="w-52">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "All completed & ready", value: "all" },
                { label: "Ready to dispatch", value: "ready" },
                { label: "Dispatched", value: "dispatched" },
                { label: "Delivered", value: "delivered" },
              ]}
            />
          </div>
        </div>

        <OrderHistoryTable orders={historyOrders} />
      </main>

      <KitchenFooter lastSynced={lastSynced} />
    </>
  );
}

export default function KitchenHistoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading history...</div>}>
      <OrderHistoryContent />
    </Suspense>
  );
}
