export type OrderStatus =
  | "incoming"
  | "preparing"
  | "ready"
  | "dispatched"
  | "delivered"
  | "cancelled";

export interface CartItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  allergenNote: string;
  category?: string;
}

export interface OrderItem {
  id: string;
  menuId: string;
  menuName: string;
  description?: string;
  category: "Main" | "Side" | "Beverage" | string;
  quantity: number;
  unitPrice: number;
  allergenNote?: string;
}

export interface Order {
  id: string;
  orderCode: string;
  receiptCode: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryRoute: string;
  scheduledTime: string;
  scheduledLabel?: string;
  serviceType?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  allergyAlert?: string;
  allergyInstruction?: string;
  createdAt: string;
  elapsedMinutes: number;
  dispatchedAt?: string;
  deliveredAt?: string;
  driverName?: string;
  driverLat?: number;
  driverLng?: number;
  driverLocationUpdatedAt?: string;
}

export interface CreateOrderPayload {
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: {
    menuId: string;
    menuName: string;
    quantity: number;
    unitPrice: number;
    allergenNote?: string;
  }[];
}
