"use client";

import React, { useEffect, useState } from "react";
import { Calendar, Download } from "lucide-react";
import { getSalesReportApi } from "@/lib/api/management";
import { printSalesReportPdf } from "@/lib/utils/export";
import { formatRupiah } from "@/lib/utils/format";
import { SalesKpiGrid } from "@/components/management/SalesKpiGrid";
import { MonthlyRevenueChart } from "@/components/management/MonthlyRevenueChart";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { SalesReportResponse } from "@/types/management";

export default function ManagementDashboardPage() {
  const [period, setPeriod] = useState<string>("");
  const [report, setReport] = useState<SalesReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setError(null);
    getSalesReportApi(period || undefined)
      .then((res) => {
        if (!active) return;
        setReport(res);
        if (!period && res.summary.period) {
          setPeriod(res.summary.period);
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat laporan penjualan"
          );
        }
      });
    return () => {
      active = false;
    };
  }, [period]);

  const handleExportPdf = () => {
    if (!report) return;
    const s = report.summary;
    printSalesReportPdf(
      "Laporan Penjualan",
      s.period,
      [
        {
          label: "Total Pesanan",
          value: String(s.totalOrders),
          delta: `↑ ${s.ordersGrowthPct}% vs sebelumnya`,
        },
        {
          label: "Pendapatan",
          value: formatRupiah(s.totalRevenue),
          delta: `↑ ${s.revenueGrowthPct}% vs sebelumnya`,
        },
        {
          label: "Pelanggan Aktif",
          value: String(s.activeCustomers),
          delta: `↑ ${s.customersGrowthPct}% vs sebelumnya`,
        },
      ],
      report.monthlyTrend
    );
  };

  const periodOptions = (report?.availablePeriods ?? []).map((p) => ({
    label: p,
    value: p,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#18352B]/65">
            LAYAH / MANAJEMEN KATERING
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#18352B] font-sans">
            Laporan Penjualan
          </h1>
          <p className="mt-1 text-xs text-[#18352B]/70">
            Pusat pemantauan kinerja penjualan dan pertumbuhan usaha secara real-time.
          </p>
        </div>

        <Button variant="burgundy" onClick={handleExportPdf} disabled={!report}>
          <Download className="h-4 w-4" />
          Download Laporan (PDF)
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 text-xs font-medium text-[#18352B]">
            <Calendar className="h-4 w-4" />
            Periode laporan
          </span>
          <div className="w-48">
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={
                periodOptions.length > 0
                  ? periodOptions
                  : [{ label: "Memuat periode...", value: "" }]
              }
            />
          </div>
        </div>

        <span className="text-xs text-[#18352B]/70">
          {report?.summary.periodRangeLabel ?? ""}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-[#641E2A]/35 bg-[#F3E4E6] px-4 py-3 text-xs text-[#641E2A]">
          {error}
        </div>
      )}

      {report ? (
        <>
          <SalesKpiGrid summary={report.summary} />
          <MonthlyRevenueChart
            data={report.monthlyTrend}
            highlightNote={report.summary.highlightNote}
            ytdTotalRevenue={report.summary.ytdTotalRevenue}
          />
        </>
      ) : (
        <div className="rounded-lg border border-[#18352B]/25 p-12 text-center text-xs text-[#18352B]/70">
          Memuat laporan penjualan dari Neon PostgreSQL...
        </div>
      )}
    </div>
  );
}
