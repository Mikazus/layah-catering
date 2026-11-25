"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { createOrderApi } from "@/lib/api/orders";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatRupiah } from "@/lib/utils/format";

export function CheckoutForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, totalPortions, totalPrice, clearCart } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName((prev) => prev || user.fullName || "");
      setPhone((prev) => prev || user.phone || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Keranjang belanja masih kosong. Pilih menu terlebih dahulu.");
      return;
    }
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError("Mohon lengkapi nama lengkap, nomor telepon, dan alamat pengiriman.");
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const createdOrder = await createOrderApi({
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        deliveryAddress: address.trim(),
        items: items.map((i) => ({
          menuId: i.menuId,
          menuName: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          allergenNote: i.allergenNote,
        })),
      });

      clearCart();
      router.push(`/order-success/${encodeURIComponent(createdOrder.id)}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal membuat pesanan. Silakan coba lagi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl rounded-md bg-[#DDD2BC] px-8 py-12 text-center shadow-sm border border-[#18352B]/10">
        <h1 className="font-serif text-3xl font-medium text-[#18352B]">
          Keranjang Belanja Kosong
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#18352B]/70">
          Tambahkan minimal satu menu dari katalog sebelum melanjutkan ke Form Pemesanan.
        </p>
        <div className="mt-6">
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-md bg-[#641E2A] px-6 py-2.5 text-sm font-medium text-[#FBF9F4] hover:bg-[#4E1620]"
          >
            Kembali ke Menu Katalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-md bg-[#DDD2BC] px-6 py-8 sm:px-11 sm:py-10 shadow-sm border border-[#18352B]/10">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
        <span className="tracking-[0.16em] uppercase text-[#18352B]/65 font-medium">
          DETAIL PENGIRIMAN
        </span>
        <span className="font-semibold text-[#18352B]">
          {totalPortions} porsi · {formatRupiah(totalPrice)}
        </span>
      </div>

      <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium text-[#18352B]">
        Form Pemesanan
      </h1>
      <p className="mt-1.5 text-xs sm:text-sm text-[#18352B]/70">
        Lengkapi detail Anda agar setiap hidangan tiba dengan tepat.
      </p>

      <hr className="my-6 border-[#18352B]/15" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nama Lengkap"
            surface="tan"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Masukkan nama lengkap penerima"
            required
          />
          <Input
            label="Nomor Telepon"
            surface="tan"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xx xxxx xxxx"
            required
          />
        </div>

        <div>
          <label
            htmlFor="delivery-address"
            className="block text-xs font-semibold text-[#18352B] mb-1.5"
          >
            Alamat Pengiriman
          </label>
          <textarea
            id="delivery-address"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Masukkan alamat lengkap pengiriman (jalan, nomor, kecamatan, kota)..."
            className="w-full rounded-md border border-[#18352B]/25 bg-[#D5C7AE]/60 px-3.5 py-2.5 text-sm text-[#18352B] placeholder:text-[#18352B]/45 outline-none focus:border-[#18352B]"
            required
          />
        </div>

        {items.some((i) => i.allergenNote.trim()) && (
          <div className="rounded-md border border-[#641E2A]/25 bg-[#F3E4E6]/70 px-3.5 py-2.5 text-xs text-[#641E2A]">
            <p className="font-semibold mb-1">Catatan Alergen Terlampir:</p>
            <ul className="list-disc pl-4 space-y-0.5">
              {items
                .filter((i) => i.allergenNote.trim())
                .map((i) => (
                  <li key={i.menuId}>
                    <strong>{i.name}:</strong> {i.allergenNote}
                  </li>
                ))}
            </ul>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-[#F3E4E6] border border-[#641E2A]/30 px-3.5 py-2.5 text-xs text-[#641E2A]">
            {error}
          </div>
        )}

        <Button
          type="submit"
          variant="burgundy"
          size="lg"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? "Memproses Pesanan..." : "Konfirmasi Pesanan"}
        </Button>

        <p className="text-center text-[11px] text-[#18352B]/65">
          Pastikan alamat dan nomor telepon Anda sudah benar.
        </p>
      </form>
    </div>
  );
}
