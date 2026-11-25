"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Download, Search } from "lucide-react";
import { getOrdersApi, updateOrderStatusApi } from "@/lib/api/orders";
import { downloadCsv } from "@/lib/utils/export";
import { ManagementOrdersTable } from "@/components/management/ManagementOrdersTable";
import { ManagementOrderModal } from "@/components/management/ManagementOrderModal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import type { Order, OrderStatus } from "@/types/order";

export default function ManagementOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    getOrdersApi().then(setOrders);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (!q) return true;
      return `${o.orderCode} ${o.receiptCode} ${o.customerName} ${o.deliveryRoute}`
        .toLowerCase()
        .includes(q);
    });
  }, [orders, search, statusFilter]);

  const counts = useMemo(
    () => ({
      total: orders.length,
      incoming: orders.filter((o) => o.status === "incoming").length,
      preparing: orders.filter((o) => o.status === "preparing").length,
      ready: orders.filter((o) => o.status === "ready").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    }),
    [orders]
  );

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    const updated = await updateOrderStatusApi(orderId, nextStatus);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
  };

  const handleExportCsv = () => {
    downloadCsv(
      "layah-pesanan.csv",
      ["Order Code", "Resi", "Pelanggan", "Rute", "Status", "Alergen", "Total (Rp)"],
      filtered.map((o) => [
        o.orderCode,
        o.receiptCode,
        o.customerName,
        o.deliveryRoute,
        o.status,
        o.allergyAlert || "-",
        o.totalAmount,
      ])
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#18352B]/65">
            LAYAH / MANAJEMEN KATERING
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#18352B] font-sans">
            Manajemen Pesanan
          </h1>
          <p className="mt-1 text-xs text-[#18352B]/70">
            Pantau seluruh pesanan masuk, status produksi dapur, hingga pengiriman kurir.
          </p>
        </div>

        <Button variant="burgundy" onClick={handleExportCsv}>
          <Download className="h-4 w-4" />
          Ekspor Pesanan (CSV)
        </Button>
      </div>

      {/* Quick Summary Strip */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-[#18352B]">
        <span className="font-semibold">{counts.total} total pesanan</span>
        <span className="text-[#18352B]/30">|</span>
        <span>
          <strong className="text-[#641E2A]">{counts.incoming}</strong> Incoming
        </span>
        <span>
          <strong>{counts.preparing}</strong> Preparing
        </span>
        <span>
          <strong>{counts.ready}</strong> Ready
        </span>
        <span>
          <strong>{counts.delivered}</strong> Diantar
        </span>
      </div>

      {/* Container */}
      <div className="rounded-lg border border-[#18352B]/35 bg-[#C9B99A] overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-[#18352B]/20">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#18352B]/60" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari ID pesanan, resi, atau pelanggan"
              className="w-full rounded-md border border-[#18352B]/35 bg-transparent py-2 pl-9 pr-3 text-xs text-[#18352B] placeholder:text-[#18352B]/55 outline-none focus:border-[#18352B]"
            />
          </div>

          <div className="w-48">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { label: "Semua status", value: "all" },
                { label: "Incoming", value: "incoming" },
                { label: "Preparing", value: "preparing" },
                { label: "Ready", value: "ready" },
                { label: "Dispatched", value: "dispatched" },
                { label: "Diantar", value: "delivered" },
              ]}
            />
          </div>
        </div>

        <ManagementOrdersTable orders={filtered} onInspect={setSelectedOrder} />
      </div>

      <ManagementOrderModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
