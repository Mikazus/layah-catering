"use client";

import React from "react";
import { Check, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { QrVerifyResponse } from "@/types/driver";

interface VerifiedDeliveryViewProps {
  data: QrVerifyResponse;
  statusUpdated: boolean;
  isUpdating: boolean;
  onConfirmDelivered: () => void;
  onScanNext: () => void;
}

export function VerifiedDeliveryView({
  data,
  statusUpdated,
  isUpdating,
  onConfirmDelivered,
  onScanNext,
}: VerifiedDeliveryViewProps) {
  return (
    <div className="flex flex-1 flex-col justify-between py-5">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#18352B] text-[#18352B]">
          <Check className="h-11 w-11 stroke-[2]" />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-[#18352B] font-sans">
          Rute &amp; Paket Sesuai!
        </h1>
        <p className="mt-1.5 text-xs leading-relaxed text-[#18352B]/75 max-w-[280px]">
          Pesanan terverifikasi. Paket siap dikirim ke alamat penerima.
        </p>

        <div className="mt-6 w-full rounded-xl bg-[#18352B] p-5 text-left text-[#FBF9F4] shadow-md">
          <div className="flex items-center justify-between text-[10px] tracking-[0.15em] uppercase text-[#C9B99A]/85">
            <span>PENERIMA</span>
            <span className="font-semibold">{data.receiptCode}</span>
          </div>

          <h2 className="mt-1.5 text-lg font-bold text-[#FBF9F4] font-sans">
            {data.recipientName}
          </h2>

          <hr className="my-3.5 border-[#C9B99A]/25" />

          <div className="flex items-start gap-2.5 text-xs leading-relaxed text-[#C9B99A]">
            <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-[#C9B99A]" />
            <span>{data.deliveryAddress}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {statusUpdated && (
          <div className="flex items-center gap-2.5 rounded-lg border border-[#18352B]/55 bg-[#C9B99A] px-3.5 py-2.5 text-xs font-semibold text-[#18352B]">
            <Check className="h-4 w-4 shrink-0" />
            <span>Status pengiriman berhasil diperbarui: Diantar.</span>
          </div>
        )}

        {!statusUpdated ? (
          <Button
            variant="burgundy"
            size="lg"
            fullWidth
            disabled={isUpdating}
            onClick={onConfirmDelivered}
          >
            {isUpdating ? "Memperbarui..." : "Update Status: Diantar"}
          </Button>
        ) : (
          <Button variant="green" size="lg" fullWidth onClick={onScanNext}>
            Scan Paket Berikutnya
          </Button>
        )}
      </div>
    </div>
  );
}
