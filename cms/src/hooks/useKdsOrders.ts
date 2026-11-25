"use client";

import { useCallback, useEffect, useState } from "react";
import { getOrdersApi, updateOrderStatusApi } from "@/lib/api/orders";
import { formatWibTime } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types/order";

export function useKdsOrders(pollIntervalMs: number = 10000) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string>("--:--");

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrdersApi();
      setOrders(data);
      setIsConnected(true);
      setError(null);
      setLastSynced(formatWibTime(new Date()).replace(" WIB", ""));
    } catch (err) {
      setIsConnected(false);
      setError(
        err instanceof Error ? err.message : "Failed to connect to kitchen API"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, pollIntervalMs);
    return () => clearInterval(interval);
  }, [fetchOrders, pollIntervalMs]);

  const advanceStatus = useCallback(
    async (orderId: string, nextStatus: OrderStatus) => {
      const updated = await updateOrderStatusApi(orderId, nextStatus);
      setOrders((prev) =>
        prev.map((order) => (order.id === orderId ? updated : order))
      );
      return updated;
    },
    []
  );

  return {
    orders,
    isLoading,
    isConnected,
    error,
    lastSynced,
    refresh: fetchOrders,
    advanceStatus,
  };
}
