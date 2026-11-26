"use client";

import React from "react";
import Link from "next/link";
import { Check, MapPin } from "lucide-react";

interface OrderSuccessCardProps {
  orderId: string;
}

export function OrderSuccessCard({ orderId }: OrderSuccessCardProps) {
  const cleanId = orderId.replace(/^#/, "");
  const formattedId = `#${cleanId}`;

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-14 sm:py-20 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border-[1.5px] border-[#18352B] text-[#18352B]">
        <Check className="h-9 w-9 stroke-[1.5]" />
      </div>

      <p className="mt-7 text-[11px] tracking-[0.2em] uppercase text-[#18352B]/70 font-medium">
        TERIMA KASIH ATAS PESANAN ANDA
      </p>

      <h1 className="mt-3 font-serif text-4xl sm:text-5xl font-medium text-[#18352B]">
        Pesanan Berhasil Dibuat!
      </h1>

      <p className="mt-4 text-sm text-[#18352B]/80">
        Pesanan Anda sedang diproses oleh dapur. ID Pesanan:{" "}
        <span className="font-semibold text-[#18352B]">{formattedId}</span>
      </p>

      <div className="my-7 h-px w-12 bg-[#18352B]/35" />

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
        <Link
          href={`/orders?orderId=${encodeURIComponent(cleanId)}`}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-md bg-[#641E2A] px-7 py-3 text-sm font-semibold text-[#FBF9F4] hover:bg-[#4E1620] transition-colors"
        >
          <MapPin className="h-4 w-4" />
          Lacak Pesanan &amp; QR Resi
        </Link>

        <Link
          href="/catalog"
          className="inline-flex w-full sm:w-auto items-center justify-center rounded-md border border-[#18352B]/70 px-7 py-3 text-sm font-medium text-[#18352B] hover:bg-[#18352B] hover:text-[#FBF9F4] transition-colors"
        >
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  );
}
