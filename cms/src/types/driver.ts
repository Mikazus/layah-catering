export type DriverVerificationState = "scanning" | "mismatch" | "verified";

export interface QrVerifyRequest {
  kitchenQr: string;
  receiptQr: string;
}

export interface QrVerifyResponse {
  matched: boolean;
  orderId?: string;
  orderCode?: string;
  receiptCode?: string;
  recipientName?: string;
  deliveryAddress?: string;
  route?: string;
  status?: string;
  message?: string;
}
