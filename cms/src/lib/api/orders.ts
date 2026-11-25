import { apiRequest } from "@/lib/api/client";
import type { CreateOrderPayload, Order, OrderStatus } from "@/types/order";

export async function getOrdersApi(): Promise<Order[]> {
  return apiRequest<Order[]>("/orders");
}

export async function getOrderByIdApi(id: string): Promise<Order | null> {
  try {
    return await apiRequest<Order>(`/orders/${encodeURIComponent(id)}`);
  } catch {
    return null;
  }
}

export async function createOrderApi(
  payload: CreateOrderPayload
): Promise<Order> {
  return apiRequest<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateOrderStatusApi(
  id: string,
  status: OrderStatus
): Promise<Order> {
  return apiRequest<Order>(`/orders/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
