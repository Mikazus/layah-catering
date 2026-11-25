"use client";

import React from "react";
import { Utensils } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/utils/format";
import type { MenuItem } from "@/types/menu";

interface MenuCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem) => void;
}

export function MenuCard({ item, onAdd }: MenuCardProps) {
  return (
    <article className="flex flex-col">
      {/* Framed Photo Box matching Layah Catalog mockup */}
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-sm border border-[#18352B]/20 bg-[#C2B191]/70 flex flex-col items-center justify-center text-[#18352B]/45">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <>
            <Utensils className="h-5 w-5 mb-1.5 opacity-70" />
            <span className="text-[10px] tracking-[0.2em] uppercase">
              FOTO MENU
            </span>
          </>
        )}
        {!item.isAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#18352B]/65 text-xs font-semibold uppercase tracking-widest text-[#FBF9F4]">
            Habis
          </div>
        )}
      </div>

      {/* Details */}
      <div className="mt-3 flex flex-1 flex-col">
        <h3 className="font-serif text-xl sm:text-[22px] font-medium text-[#18352B] leading-snug">
          {item.name}
        </h3>
        <p className="mt-0.5 text-xs text-[#18352B]/65 line-clamp-1">
          {item.description}
        </p>

        <div className="mt-2.5 flex items-baseline justify-between">
          <span className="text-sm font-bold text-[#18352B]">
            {formatRupiah(item.price)}
          </span>
          <span className="text-[11px] text-[#18352B]/60">/ porsi</span>
        </div>

        <div className="mt-3">
          <Button
            variant="burgundy"
            fullWidth
            disabled={!item.isAvailable}
            onClick={() => onAdd(item)}
            className="py-2 text-xs sm:text-sm"
          >
            {item.isAvailable ? "Add to Cart" : "Stok Habis"}
          </Button>
        </div>
      </div>
    </article>
  );
}
