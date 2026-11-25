"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import {
  createMenuApi,
  deleteMenuApi,
  getMenusApi,
  updateMenuApi,
} from "@/lib/api/menu";
import { MenuManagementGrid } from "@/components/management/MenuManagementGrid";
import { MenuFormModal } from "@/components/management/MenuFormModal";
import { Button } from "@/components/ui/Button";
import type { CreateMenuDTO, MenuItem } from "@/types/menu";

const CATEGORY_TABS = [
  "Semua Menu",
  "Paket Nasi",
  "Lauk Pilihan",
  "Sayuran",
  "Minuman",
] as const;

export default function ManagementMenuPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("Semua Menu");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);

  useEffect(() => {
    getMenusApi().then(setMenus);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menus.filter((m) => {
      const catMatch = category === "Semua Menu" || m.category === category;
      const queryMatch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q);
      return catMatch && queryMatch;
    });
  }, [menus, search, category]);

  const handleSaveMenu = async (payload: CreateMenuDTO, editId?: string) => {
    if (editId) {
      const updated = await updateMenuApi(editId, payload);
      setMenus((prev) => prev.map((m) => (m.id === editId ? updated : m)));
    } else {
      const created = await createMenuApi(payload);
      setMenus((prev) => [created, ...prev]);
    }
  };

  const handleToggleAvailability = async (menu: MenuItem) => {
    const updated = await updateMenuApi(menu.id, {
      isAvailable: !menu.isAvailable,
    });
    setMenus((prev) => prev.map((m) => (m.id === menu.id ? updated : m)));
  };

  const handleDelete = async (id: string) => {
    await deleteMenuApi(id);
    setMenus((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#18352B]/65">
            LAYAH / MANAJEMEN KATERING
          </p>
          <h1 className="mt-1 text-3xl font-bold text-[#18352B] font-sans">
            Manajemen Menu
          </h1>
          <p className="mt-1 text-xs text-[#18352B]/70">
            Atur katalog hidangan, harga per porsi, dan ketersediaan stok harian.
          </p>
        </div>

        <Button
          variant="burgundy"
          onClick={() => {
            setEditingMenu(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Tambah Menu Baru
        </Button>
      </div>

      {/* Category & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#18352B]/20 pb-3">
        <div className="flex items-center gap-5 overflow-x-auto">
          {CATEGORY_TABS.map((tab) => {
            const active = category === tab;
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setCategory(tab)}
                className={`whitespace-nowrap pb-2 text-xs font-medium border-b-2 -mb-[13px] transition-colors cursor-pointer ${
                  active
                    ? "border-[#18352B] font-bold text-[#18352B]"
                    : "border-transparent text-[#18352B]/65 hover:text-[#18352B]"
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#18352B]/60" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama hidangan"
            className="w-full rounded-md border border-[#18352B]/35 bg-transparent py-1.5 pl-9 pr-3 text-xs text-[#18352B] placeholder:text-[#18352B]/55 outline-none focus:border-[#18352B]"
          />
        </div>
      </div>

      <MenuManagementGrid
        menus={filtered}
        onEdit={(menu) => {
          setEditingMenu(menu);
          setModalOpen(true);
        }}
        onDelete={handleDelete}
        onToggleAvailability={handleToggleAvailability}
      />

      <MenuFormModal
        isOpen={modalOpen}
        initialMenu={editingMenu}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSaveMenu}
      />
    </div>
  );
}
