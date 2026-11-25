"use client";

import React from "react";
import { ArrowUpDown, ChevronDown } from "lucide-react";

interface KdsFilterBarProps {
  filterMode: "all" | "dietary";
  onFilterModeChange: (mode: "all" | "dietary") => void;
  totalCount: number;
  dietaryCount: number;
  routeFilter: string;
  routes: string[];
  onRouteFilterChange: (route: string) => void;
  sortOrder: "newest" | "oldest";
  onToggleSort: () => void;
}

export function KdsFilterBar({
  filterMode,
  onFilterModeChange,
  totalCount,
  dietaryCount,
  routeFilter,
  routes,
  onRouteFilterChange,
  sortOrder,
  onToggleSort,
}: KdsFilterBarProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => onFilterModeChange("all")}
          className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            filterMode === "all"
              ? "bg-[#18352B] text-[#FBF9F4]"
              : "bg-transparent text-[#18352B]/75 hover:bg-[#18352B]/10"
          }`}
        >
          <span>All orders</span>
          <span className="opacity-75">{totalCount}</span>
        </button>

        <button
          type="button"
          onClick={() => onFilterModeChange("dietary")}
          className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
            filterMode === "dietary"
              ? "bg-[#641E2A] text-[#FBF9F4]"
              : "bg-transparent text-[#18352B]/75 hover:bg-[#641E2A]/10"
          }`}
        >
          <span>Dietary requests</span>
          <span
            className={
              filterMode === "dietary"
                ? "text-[#FBF9F4]"
                : "font-bold text-[#641E2A]"
            }
          >
            {dietaryCount}
          </span>
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <select
            value={routeFilter}
            onChange={(e) => onRouteFilterChange(e.target.value)}
            className="appearance-none rounded-md border border-[#18352B]/20 bg-[#DDD2BC] pl-3.5 pr-8 py-2 text-xs font-medium text-[#18352B] outline-none focus:border-[#18352B] cursor-pointer"
          >
            <option value="all">All routes</option>
            {routes.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#18352B]/70" />
        </div>

        <button
          type="button"
          onClick={onToggleSort}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium text-[#18352B]/80 hover:bg-[#18352B]/10 transition-colors cursor-pointer"
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortOrder === "newest" ? "Newest first" : "Oldest first"}
        </button>
      </div>
    </div>
  );
}
