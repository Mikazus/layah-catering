"use client";

import React from "react";
import { Minus, Plus, Utensils } from "lucide-react";
import { formatRupiah } from "@/lib/utils/format";
import type { CartItem } from "@/types/order";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQty: (menuId: string, delta: number) => void;
  onRemove: (menuId: string) => void;
  onChangeNote: (menuId: string, note: string) => void;
}

export function CartItemRow({
  item,
  onUpdateQty,
  onRemove,
  onChangeNote,
}: CartItemRowProps) {
  return (
    <div className="border-b border-[#18352B]/15 pb-4 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-[#18352B]/20 bg-[#C2B191]/70 text-[#18352B]/50">
          <Utensils className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-[#18352B] leading-tight">
            {item.name}
          </h4>
          <p className="mt-0.5 text-xs text-[#18352B]/70">
            {formatRupiah(item.price)} / porsi
          </p>
          <button
            type="button"
            onClick={() => onRemove(item.menuId)}
            className="mt-1 text-[11px] font-medium text-[#641E2A] hover:underline cursor-pointer"
          >
            Hapus
          </button>
        </div>
      </div>

      {/* Inline Allergen & Special Note Input */}
      <div className="mt-3">
        <label className="block text-[11px] font-medium text-[#18352B]/80 mb-1">
          Preferensi Alergen &amp; Catatan Khusus
        </label>
        <input
          type="text"
          value={item.allergenNote}
          onChange={(e) => onChangeNote(item.menuId, e.target.value)}
          placeholder="Contoh: tanpa kacang, ganti minyak goreng, dll."
          className="w-full rounded-sm border border-[#18352B]/25 bg-transparent px-2.5 py-2 text-xs text-[#18352B] placeholder:text-[#18352B]/45 outline-none focus:border-[#18352B]"
        />
      </div>

      {/* Qty Stepper & Line Total */}
      <div className="mt-3 flex items-center justify-between">
        <div className="inline-flex items-center border border-[#18352B]/25 rounded-sm bg-[#C9B99A]/40">
          <button
            type="button"
            onClick={() => onUpdateQty(item.menuId, -1)}
            className="flex h-7 w-7 items-center justify-center text-[#18352B] hover:bg-[#18352B]/10 cursor-pointer"
            aria-label="Kurangi porsi"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-8 text-center text-xs font-semibold text-[#18352B]">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQty(item.menuId, 1)}
            className="flex h-7 w-7 items-center justify-center text-[#18352B] hover:bg-[#18352B]/10 cursor-pointer"
            aria-label="Tambah porsi"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>

        <span className="text-sm font-bold text-[#18352B]">
          {formatRupiah(item.price * item.quantity)}
        </span>
      </div>
    </div>
  );
}
