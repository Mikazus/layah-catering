import { apiRequest } from "@/lib/api/client";
import type {
  MembershipResponse,
  SalesReportResponse,
} from "@/types/management";

export async function getSalesReportApi(
  period?: string
): Promise<SalesReportResponse> {
  const qs = period ? `?period=${encodeURIComponent(period)}` : "";
  return apiRequest<SalesReportResponse>(`/management/sales${qs}`);
}

export async function getMembershipsApi(): Promise<MembershipResponse> {
  return apiRequest<MembershipResponse>("/management/memberships");
}
