import React from "react";
import { padTwo } from "@/lib/utils/format";

interface KdsStatsBarProps {
  activeOrders: number;
  itemsToServe: number;
  readyToDispatch: number;
  dietaryRequests: number;
}

export function KdsStatsBar({
  activeOrders,
  itemsToServe,
  readyToDispatch,
  dietaryRequests,
}: KdsStatsBarProps) {
  const stats = [
    {
      value: padTwo(activeOrders),
      label: "Active orders",
      sub: "Across all stations",
      highlight: false,
    },
    {
      value: padTwo(itemsToServe),
      label: "Items to serve",
      sub: "Food & beverages",
      highlight: false,
    },
    {
      value: padTwo(readyToDispatch),
      label: "Ready to dispatch",
      sub: "Awaiting collection",
      highlight: false,
    },
    {
      value: padTwo(dietaryRequests),
      label: "Dietary requests",
      sub: "Please handle with care",
      highlight: true,
    },
  ];

  return (
    <div className="grid grid-cols-4 divide-x divide-[#18352B]/12 rounded-xl bg-[#FBF9F4] px-2 py-4 shadow-xs border border-[#18352B]/10">
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-3.5 px-5">
          <span
            className={`font-serif text-4xl font-medium leading-none ${
              stat.highlight ? "text-[#641E2A]" : "text-[#18352B]"
            }`}
          >
            {stat.value}
          </span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-[#18352B]">{stat.label}</p>
            <p className="mt-0.5 text-[11px] text-[#18352B]/60">{stat.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
