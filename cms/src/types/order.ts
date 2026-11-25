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
  orderCode: string; // e.g. #ORD-001
  receiptCode: string; // e.g. KTG-0248
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  deliveryRoute: string; // e.g. Selatan · Kemang
  scheduledTime: string; // e.g. 11:30
  scheduledLabel?: string; // e.g. Today, 11:30 WIB
  serviceType?: string; // e.g. Lunch service · Home delivery
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  allergyAlert?: string;
  allergyInstruction?: string;
  createdAt: string; // ISO string
  elapsedMinutes: number;
  dispatchedAt?: string;
  deliveredAt?: string;
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
