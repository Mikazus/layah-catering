import type { UserRole } from "@/types/auth";

export const ROLE_LABELS: Record<UserRole, string> = {
  customer: "Customer",
  kitchen: "Kitchen Staff",
  driver: "Driver",
  management: "Management",
};

export const ROLE_HOME_ROUTES: Record<UserRole, string> = {
  customer: "/catalog",
  kitchen: "/kitchen",
  driver: "/driver",
  management: "/management/dashboard",
};

export const ROLE_ALLOWED_PREFIXES: Record<UserRole, string[]> = {
  customer: ["/catalog", "/checkout", "/order-success"],
  kitchen: ["/kitchen"],
  driver: ["/driver"],
  management: ["/management"],
};

export const MANAGEMENT_NAV_ITEMS = [
  { label: "Dashboard", href: "/management/dashboard", icon: "dashboard" },
  { label: "Pesanan", href: "/management/orders", icon: "orders" },
  { label: "Menu", href: "/management/menu", icon: "menu" },
  { label: "Membership", href: "/management/membership", icon: "membership" },
] as const;

export const KITCHEN_NAV_ITEMS = [
  { label: "Kitchen display", href: "/kitchen" },
  { label: "Order history", href: "/kitchen/history" },
] as const;
