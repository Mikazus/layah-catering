"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useKdsOrders } from "@/hooks/useKdsOrders";
import {
  formatWibLongDate,
  formatWibTime,
  getWibServicePeriod,
} from "@/lib/utils/format";
import { KdsStatsBar } from "@/components/kitchen/KdsStatsBar";
import { KdsFilterBar } from "@/components/kitchen/KdsFilterBar";
import { KanbanBoard } from "@/components/kitchen/KanbanBoard";
import { KitchenFooter } from "@/components/kitchen/KitchenFooter";

function KitchenDisplayContent() {
  const searchParams = useSearchParams();
  const searchQuery = (searchParams.get("q") ?? "").trim().toLowerCase();
  const { orders, isLoading, isConnected, error, lastSynced, advanceStatus } =
    useKdsOrders();

  const [now, setNow] = useState<Date | null>(null);
  const [filterMode, setFilterMode] = useState<"all" | "dietary">("all");
  const [routeFilter, setRouteFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  const activeBoardOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status === "incoming" ||
          o.status === "preparing" ||
          o.status === "ready"
      ),
    [orders]
  );

  const routes = useMemo(() => {
    const set = new Set(activeBoardOrders.map((o) => o.deliveryRoute));
    return Array.from(set).sort();
  }, [activeBoardOrders]);

  const filteredOrders = useMemo(() => {
    const result = activeBoardOrders.filter((o) => {
      if (filterMode === "dietary" && !o.allergyAlert) return false;
      if (routeFilter !== "all" && o.deliveryRoute !== routeFilter) return false;
      if (searchQuery) {
        const haystack = `${o.orderCode} ${o.customerName} ${o.deliveryRoute}`.toLowerCase();
        if (!haystack.includes(searchQuery)) return false;
      }
      return true;
    });

    return result.sort((a, b) =>
      sortOrder === "newest"
        ? a.elapsedMinutes - b.elapsedMinutes
        : b.elapsedMinutes - a.elapsedMinutes
    );
  }, [activeBoardOrders, filterMode, routeFilter, searchQuery, sortOrder]);

  const stats = useMemo(() => {
    const itemsToServe = activeBoardOrders.reduce(
      (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
      0
    );
    const readyToDispatch = activeBoardOrders.filter(
      (o) => o.status === "ready"
    ).length;
    const dietaryRequests = activeBoardOrders.filter(
      (o) => Boolean(o.allergyAlert)
    ).length;

    return {
      activeOrders: activeBoardOrders.length,
      itemsToServe,
      readyToDispatch,
      dietaryRequests,
    };
  }, [activeBoardOrders]);

  return (
    <>
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-8 py-7 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#18352B]/65">
              KITCHEN OPERATIONS
            </p>
            <h1 className="mt-1 font-serif text-4xl font-medium text-[#18352B]">
              Kitchen display system
            </h1>
            <p className="mt-1 text-xs text-[#18352B]/70">
              A little care in every order. Review, prepare, and dispatch with
              confidence.
            </p>
          </div>

          <div className="text-right text-xs">
            <p className="text-[#18352B]/65">
              {now ? formatWibLongDate(now) : "Loading date..."}
            </p>
            <p className="mt-0.5 inline-flex items-center gap-1.5 font-semibold text-[#18352B]">
              <span
                className={`h-2 w-2 rounded-full ${
                  isConnected ? "bg-[#18352B]" : "bg-[#641E2A]"
                }`}
              />
              {now ? formatWibTime(now) : "--:-- WIB"}{" "}
              <span className="font-normal text-[#18352B]/65">
                · {now ? getWibServicePeriod(now) : "Kitchen service"}
              </span>
            </p>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-[#641E2A]/35 bg-[#F3E4E6] px-4 py-3 text-xs font-medium text-[#641E2A]">
            Unable to load live orders from server: {error}
          </div>
        )}

        <KdsStatsBar {...stats} />

        <KdsFilterBar
          filterMode={filterMode}
          onFilterModeChange={setFilterMode}
          totalCount={activeBoardOrders.length}
          dietaryCount={stats.dietaryRequests}
          routeFilter={routeFilter}
          routes={routes}
          onRouteFilterChange={setRouteFilter}
          sortOrder={sortOrder}
          onToggleSort={() =>
            setSortOrder((prev) => (prev === "newest" ? "oldest" : "newest"))
          }
        />

        {isLoading ? (
          <div className="rounded-2xl bg-[#EFE9DC]/80 p-12 text-center text-sm text-[#18352B]/70">
            Syncing live kitchen orders from Neon PostgreSQL...
          </div>
        ) : (
          <KanbanBoard
            orders={filteredOrders}
            onAdvanceStatus={advanceStatus}
          />
        )}
      </main>

      <KitchenFooter lastSynced={lastSynced} isConnected={isConnected} />
    </>
  );
}

export default function KitchenPage() {
  return (
    <Suspense fallback={<div className="p-8 text-sm">Loading Kitchen Display...</div>}>
      <KitchenDisplayContent />
    </Suspense>
  );
}