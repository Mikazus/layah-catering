"use client";

import React from "react";
import { Pencil, Trash2, Utensils } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatRupiah } from "@/lib/utils/format";
import type { MenuItem } from "@/types/menu";

interface MenuManagementGridProps {
  menus: MenuItem[];
  onEdit: (menu: MenuItem) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (menu: MenuItem) => void;
}

export function MenuManagementGrid({
  menus,
  onEdit,
  onDelete,
  onToggleAvailability,
}: MenuManagementGridProps) {
  if (menus.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[#18352B]/30 p-10 text-center text-xs text-[#18352B]/70">
        Belum ada menu pada kategori ini. Klik &ldquo;Tambah Menu Baru&rdquo; untuk menambahkan hidangan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {menus.map((menu) => (
        <div
          key={menu.id}
          className="flex flex-col justify-between rounded-lg border border-[#18352B]/30 bg-[#EFE9DC]/65 p-5"
        >
          <div>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#18352B]/20 bg-[#C9B99A]/80 text-[#18352B]/65">
                  <Utensils className="h-5 w-5" />
                </div>
                <div>
                  <Badge variant="outline">{menu.category}</Badge>
                  <h3 className="mt-1 font-serif text-xl font-semibold text-[#18352B] leading-tight">
                    {menu.name}
                  </h3>
                </div>
              </div>
              <Badge variant={menu.isAvailable ? "green" : "burgundy"} dot>
                {menu.isAvailable ? "Tersedia" : "Habis"}
              </Badge>
            </div>

            <p className="mt-3 text-xs text-[#18352B]/75 leading-relaxed">
              {menu.description}
            </p>
          </div>

          <div className="mt-5 border-t border-[#18352B]/15 pt-3.5 flex items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#18352B]/55">
                Harga / Porsi
              </p>
              <p className="text-base font-bold text-[#18352B]">
                {formatRupiah(menu.price)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleAvailability(menu)}
                className="rounded-md border border-[#18352B]/35 px-2.5 py-1.5 text-[11px] font-semibold text-[#18352B] hover:bg-[#18352B] hover:text-[#FBF9F4] transition-colors cursor-pointer"
              >
                {menu.isAvailable ? "Set Habis" : "Aktifkan"}
              </button>
              <button
                type="button"
                onClick={() => onEdit(menu)}
                className="rounded-md border border-[#18352B]/30 p-1.5 text-[#18352B] hover:bg-[#18352B]/10 cursor-pointer"
                aria-label={`Edit ${menu.name}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(menu.id)}
                className="rounded-md border border-[#641E2A]/30 p-1.5 text-[#641E2A] hover:bg-[#641E2A]/10 cursor-pointer"
                aria-label={`Hapus ${menu.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
