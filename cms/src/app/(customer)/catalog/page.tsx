"use client";

import React, { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConciergeBell } from "lucide-react";
import { getMenusApi } from "@/lib/api/menu";
import { useCart } from "@/context/CartContext";
import {
  CategoryTabs,
  type CategoryFilter,
} from "@/components/customer/CategoryTabs";
import { MenuGrid } from "@/components/customer/MenuGrid";
import { CartSidebar } from "@/components/customer/CartSidebar";
import { MobileCartBar } from "@/components/customer/MobileCartBar";
import { MobileCartDrawer } from "@/components/customer/MobileCartDrawer";
import type { MenuItem } from "@/types/menu";

function CatalogContent() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const { addToCart } = useCart();

  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [category, setCategory] = useState<CategoryFilter>("Semua Menu");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    getMenusApi().then(setMenus);
  }, []);

  const filteredMenus = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return menus.filter((item) => {
      const matchesCat =
        category === "Semua Menu" || item.category === category;
      const matchesQuery =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCat && matchesQuery;
    });
  }, [menus, category, searchQuery]);

  return (
    <div className="mx-auto flex max-w-[1440px] flex-col lg:flex-row">
      {/* Main Catalog Column */}
      <section className="flex-1 px-4 sm:px-8 lg:px-10 py-8 pb-28 lg:pb-12">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#18352B]/65">
              THE CATERING COLLECTION
            </p>
            <h1 className="mt-1.5 font-serif text-4xl sm:text-5xl font-medium text-[#18352B]">
              Menu Katalog
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-[#18352B]/75">
              Cita rasa pilihan untuk setiap momen istimewa Anda.
            </p>
          </div>
          <span className="text-xs font-medium text-[#18352B]/70">
            {filteredMenus.length} menu pilihan
          </span>
        </div>

        <div className="mt-6">
          <CategoryTabs activeCategory={category} onSelect={setCategory} />
        </div>

        <div className="mt-7">
          <MenuGrid items={filteredMenus} onAdd={addToCart} />
        </div>

        <div className="mt-10 flex items-center gap-2 border-t border-[#18352B]/15 pt-4 text-xs text-[#18352B]/70">
          <ConciergeBell className="h-4 w-4 shrink-0" />
          <span>
            Disiapkan segar sesuai pesanan. Harga tertera untuk satu porsi.
          </span>
        </div>
      </section>

      {/* Desktop Sticky Cart Sidebar */}
      <CartSidebar />

      {/* Mobile Sticky Summary Bar + Drawer */}
      <MobileCartBar onOpen={() => setIsDrawerOpen(true)} />
      <MobileCartDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-[#18352B]">Memuat katalog...</div>}>
      <CatalogContent />
    </Suspense>
  );
}
