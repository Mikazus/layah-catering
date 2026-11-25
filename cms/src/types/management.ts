export interface SalesSummary {
  period: string;
  periodRangeLabel: string;
  totalOrders: number;
  ordersGrowthPct: number;
  prevOrders: number;
  totalRevenue: number;
  revenueGrowthPct: number;
  prevRevenue: number;
  activeCustomers: number;
  customersGrowthPct: number;
  prevCustomers: number;
  ytdTotalRevenue: number;
  highlightNote: string;
  lastUpdated: string;
}

export interface MonthlyRevenuePoint {
  month: string;
  revenueMillions: number;
  revenueRaw?: number;
  isCurrent?: boolean;
}

export interface SalesReportResponse {
  availablePeriods?: string[];
  summary: SalesSummary;
  monthlyTrend: MonthlyRevenuePoint[];
}

export type MemberStatus = "Active" | "Inactive";

export interface MemberRecord {
  id: string;
  memberCode: string;
  fullName: string;
  email: string;
  status: MemberStatus;
  joinedDate: string;
  totalTransactions: number;
}

export interface MembershipResponse {
  totalRegistered: number;
  activeCount: number;
  inactiveCount: number;
  asOfLabel: string;
  members: MemberRecord[];
}
