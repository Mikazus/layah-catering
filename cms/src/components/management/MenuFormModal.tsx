"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import type { CreateMenuDTO, MenuCategory, MenuItem } from "@/types/menu";

interface MenuFormModalProps {
  isOpen: boolean;
  initialMenu: MenuItem | null;
  onClose: () => void;
  onSubmit: (payload: CreateMenuDTO, editId?: string) => Promise<void>;
}

export function MenuFormModal({
  isOpen,
  initialMenu,
  onClose,
  onSubmit,
}: MenuFormModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<MenuCategory>("Paket Nasi");
  const [price, setPrice] = useState("25000");
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialMenu) {
      setName(initialMenu.name);
      setDescription(initialMenu.description);
      setCategory(initialMenu.category);
      setPrice(String(initialMenu.price));
      setIsAvailable(initialMenu.isAvailable);
    } else {
      setName("");
      setDescription("");
      setCategory("Paket Nasi");
      setPrice("25000");
      setIsAvailable(true);
    }
  }, [initialMenu, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit(
        {
          name: name.trim(),
          description: description.trim(),
          category,
          price: Number(price) || 0,
          isAvailable,
        },
        initialMenu?.id
      );
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialMenu ? "Edit Menu Katering" : "Tambah Menu Baru"}
      subtitle="Perubahan langsung tersinkronisasi dengan Menu Katalog pelanggan."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nama Hidangan"
          surface="white"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Nasi Liwet Nusantara"
          required
        />

        <Input
          label="Deskripsi Singkat / Komposisi"
          surface="white"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Contoh: Nasi liwet · ayam suwir · sambal"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Kategori"
            surface="white"
            value={category}
            onChange={(e) => setCategory(e.target.value as MenuCategory)}
            options={[
              { label: "Paket Nasi", value: "Paket Nasi" },
              { label: "Lauk Pilihan", value: "Lauk Pilihan" },
              { label: "Sayuran", value: "Sayuran" },
              { label: "Minuman", value: "Minuman" },
            ]}
          />

          <Input
            label="Harga per Porsi (Rp)"
            surface="white"
            type="number"
            min={1000}
            step={500}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <label className="flex items-center gap-2.5 text-xs font-medium text-[#18352B] pt-1 cursor-pointer">
          <input
            type="checkbox"
            checked={isAvailable}
            onChange={(e) => setIsAvailable(e.target.checked)}
            className="h-4 w-4 accent-[#18352B]"
          />
          Tampilkan sebagai tersedia di Menu Katalog
        </label>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#18352B]/15">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" variant="burgundy" disabled={saving}>
            {saving
              ? "Menyimpan..."
              : initialMenu
              ? "Simpan Perubahan"
              : "Tambah Menu"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
