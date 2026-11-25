"use client";

import React from "react";
import { MenuCard } from "@/components/customer/MenuCard";
import { EmptyState } from "@/components/shared/EmptyState";
import type { MenuItem } from "@/types/menu";

interface MenuGridProps {
  items: MenuItem[];
  onAdd: (item: MenuItem) => void;
}

export function MenuGrid({ items, onAdd }: MenuGridProps) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="Menu tidak ditemukan"
        description="Coba kata kunci pencarian lain atau pilih kategori Semua Menu."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-8">
      {items.map((item) => (
        <MenuCard key={item.id} item={item} onAdd={onAdd} />
      ))}
    </div>
  );
}
