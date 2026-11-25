import React from "react";
import { TrendingUp } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";
import type { MonthlyRevenuePoint } from "@/types/management";

interface MonthlyRevenueChartProps {
  data: MonthlyRevenuePoint[];
  highlightNote: string;
  ytdTotalRevenue: number;
}

export function MonthlyRevenueChart({
  data,
  highlightNote,
  ytdTotalRevenue,
}: MonthlyRevenueChartProps) {
  const peak = Math.max(...data.map((d) => d.revenueMillions), 10);
  const maxVal = Math.max(120, Math.ceil(peak / 30) * 30);
  const step = maxVal / 4;
  const yTicks = [maxVal, step * 3, step * 2, step, 0];
  const currentYear = new Date().getFullYear();

  return (
    <div className="rounded-lg border border-[#18352B]/35 bg-[#C9B99A] p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[#18352B] font-sans">
            Tren Penjualan Bulanan
          </h2>
          <p className="mt-0.5 text-xs text-[#18352B]/70">
            Pendapatan bersih · dalam juta rupiah (Rp)
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-xs font-medium text-[#18352B]/80">
          <span className="h-2.5 w-2.5 rounded-xs bg-[#18352B]" />
          Pendapatan {currentYear}
        </div>
      </div>

      <div className="mt-7 relative">
        <div className="relative h-60 flex flex-col justify-between">
          {yTicks.map((tick) => (
            <div key={tick} className="flex items-center gap-3">
              <span className="w-8 text-right text-[10px] text-[#18352B]/65">
                {Math.round(tick)}
              </span>
              <div className="flex-1 border-t border-[#18352B]/25" />
            </div>
          ))}

          <div className="absolute inset-y-0 left-11 right-2 flex items-end justify-between gap-2 sm:gap-4 pb-2 pt-2">
            {data.map((point) => {
              const heightPct =
                point.revenueMillions > 0
                  ? Math.max(6, Math.min(100, (point.revenueMillions / maxVal) * 100))
                  : 0;
              const labelVal =
                point.revenueMillions >= 1
                  ? String(Math.round(point.revenueMillions))
                  : point.revenueMillions.toFixed(1);

              return (
                <div
                  key={point.month}
                  className="flex h-full flex-1 flex-col items-center justify-end group"
                >
                  <div
                    className={`w-full max-w-[44px] rounded-t-xs transition-all duration-300 flex items-start justify-center pt-1.5 ${
                      point.isCurrent
                        ? "bg-[#18352B] ring-2 ring-[#641E2A]/45"
                        : "bg-[#18352B]/90 group-hover:bg-[#641E2A]"
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${point.month} ${currentYear}: ${formatRupiah(
                      point.revenueRaw ?? point.revenueMillions * 1_000_000
                    )}`}
                  >
                    {heightPct >= 10 && (
                      <span className="text-[10px] font-semibold text-[#C9B99A]">
                        {labelVal}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-2.5 ml-11 mr-2 flex items-center justify-between gap-2 sm:gap-4">
          {data.map((point) => (
            <span
              key={point.month}
              className={`flex-1 text-center text-[11px] ${
                point.isCurrent
                  ? "font-bold text-[#18352B]"
                  : "text-[#18352B]/75"
              }`}
            >
              {point.month}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#18352B]/20 pt-4 text-xs text-[#18352B]/80">
        <span className="inline-flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-[#18352B]" />
          {highlightNote}
        </span>
        <span className="font-semibold text-[#18352B]">
          Total YTD: {formatRupiah(ytdTotalRevenue)}
        </span>
      </div>
    </div>
  );
}
