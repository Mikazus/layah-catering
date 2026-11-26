import { apiRequest } from "@/lib/api/client";
import type { QrVerifyRequest, QrVerifyResponse } from "@/types/driver";

export async function verifyDriverQrApi(
  payload: QrVerifyRequest
): Promise<QrVerifyResponse> {
  return apiRequest<QrVerifyResponse>("/driver/verify-qr", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateDriverLocationApi(payload: {
  orderId: string;
  lat: number;
  lng: number;
  setDispatched?: boolean;
}): Promise<void> {
  await apiRequest("/driver/location", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function markOrderDeliveredApi(orderId: string): Promise<void> {
  await apiRequest(`/driver/orders/${encodeURIComponent(orderId)}/deliver`, {
    method: "PATCH",
    body: JSON.stringify({ status: "delivered" }),
  });
}
