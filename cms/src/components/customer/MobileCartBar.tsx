"use client";

import React from "react";
import { ShoppingBag, ChevronUp } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatRupiah } from "@/lib/utils/format";

interface MobileCartBarProps {
  onOpen: () => void;
}

export function MobileCartBar({ onOpen }: MobileCartBarProps) {
  const { items, totalPortions, totalPrice } = useCart();

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#C9B99A]/25 bg-[#18352B] px-4 py-3 text-[#FBF9F4] shadow-2xl lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full items-center justify-between gap-3 cursor-pointer"
      >
        <div className="flex items-center gap-3 text-left">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#641E2A] text-[#FBF9F4]">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-[#C9B99A]">
              {items.length} menu · {totalPortions} porsi
            </p>
            <p className="font-serif text-xl font-semibold leading-tight">
              {formatRupiah(totalPrice)}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-md bg-[#641E2A] px-3.5 py-2 text-xs font-semibold text-[#FBF9F4]">
          Keranjang
          <ChevronUp className="h-4 w-4" />
        </span>
      </button>
    </div>
  );
}
