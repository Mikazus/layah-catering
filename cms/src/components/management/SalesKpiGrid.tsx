import React from "react";
import { ArrowUp, ClipboardList, Users, Wallet } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";
import type { SalesSummary } from "@/types/management";

interface SalesKpiGridProps {
  summary: SalesSummary;
}

export function SalesKpiGrid({ summary }: SalesKpiGridProps) {
  const cards = [
    {
      label: "Total Pesanan",
      value: String(summary.totalOrders),
      growth: `${summary.ordersGrowthPct.toFixed(1).replace(".", ",")}%`,
      comparison: `vs. periode sebelumnya · ${summary.prevOrders} pesanan`,
      icon: ClipboardList,
    },
    {
      label: "Pendapatan",
      value: formatRupiah(summary.totalRevenue),
      growth: `${summary.revenueGrowthPct.toFixed(1).replace(".", ",")}%`,
      comparison: `vs. periode sebelumnya · ${formatRupiah(summary.prevRevenue)}`,
      icon: Wallet,
    },
    {
      label: "Pelanggan Aktif",
      value: String(summary.activeCustomers),
      growth: `${summary.customersGrowthPct.toFixed(1).replace(".", ",")}%`,
      comparison: `vs. periode sebelumnya · ${summary.prevCustomers} pelanggan`,
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="rounded-lg border border-[#18352B]/35 bg-[#C9B99A] p-5"
          >
            <div className="flex items-center justify-between text-xs text-[#18352B]/75">
              <span>{card.label}</span>
              <Icon className="h-4 w-4 text-[#18352B]/75" />
            </div>

            <p className="mt-3 text-3xl font-bold tracking-tight text-[#18352B] font-sans">
              {card.value}
            </p>

            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-[#18352B]/75">
              <span className="inline-flex items-center gap-0.5 font-bold text-[#18352B]">
                <ArrowUp className="h-3 w-3" />
                {card.growth}
              </span>
              <span className="truncate">{card.comparison}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
