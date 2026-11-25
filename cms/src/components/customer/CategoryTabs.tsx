"use client";

import React from "react";

const CATEGORIES = ["Semua Menu", "Paket Nasi", "Lauk Pilihan", "Sayuran"] as const;

export type CategoryFilter = (typeof CATEGORIES)[number];

interface CategoryTabsProps {
  activeCategory: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
}

export function CategoryTabs({ activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-6 overflow-x-auto border-b border-[#18352B]/20 pb-px">
      {CATEGORIES.map((category) => {
        const isActive = activeCategory === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onSelect(category)}
            className={`whitespace-nowrap pb-2.5 text-xs sm:text-sm transition-colors border-b-2 -mb-px cursor-pointer ${
              isActive
                ? "border-[#18352B] font-semibold text-[#18352B]"
                : "border-transparent text-[#18352B]/65 hover:text-[#18352B]"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
