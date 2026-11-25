"use client";

import React from "react";
import { AlertTriangle, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Order, OrderStatus } from "@/types/order";

interface QrLabelPanelProps {
  order: Order;
  onStatusChange?: (nextStatus: OrderStatus) => Promise<void>;
}

function DeterministicQrSvg({ seed }: { seed: string }) {
  const size = 21;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  const isFinder = (r: number, c: number) => {
    const inTopLeft = r < 7 && c < 7;
    const inTopRight = r < 7 && c >= size - 7;
    const inBottomLeft = r >= size - 7 && c < 7;
    return inTopLeft || inTopRight || inBottomLeft;
  };

  const finderFilled = (r: number, c: number) => {
    const lr = r >= size - 7 ? r - (size - 7) : r;
    const lc = c >= size - 7 ? c - (size - 7) : c;
    if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
    if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
    return false;
  };

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      let filled = false;
      if (isFinder(r, c)) {
        filled = finderFilled(r, c);
      } else {
        const bit = ((hash >>> ((r * 5 + c * 3) % 24)) ^ (r * 31 + c * 17)) & 1;
        filled = bit === 1;
      }
      if (filled) {
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={c * 8}
            y={r * 8}
            width={8}
            height={8}
            fill="#18352B"
          />
        );
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${size * 8} ${size * 8}`}
      className="mx-auto h-40 w-40"
      role="img"
      aria-label={`QR Code untuk ${seed}`}
    >
      <rect width={size * 8} height={size * 8} fill="#FFFFFF" />
      {cells}
    </svg>
  );
}

export function QrLabelPanel({ order, onStatusChange }: QrLabelPanelProps) {
  const handlePrint = () => {
    window.print();
  };

  const nextStep: Partial<
    Record<OrderStatus, { next: OrderStatus; label: string }>
  > = {
    incoming: { next: "preparing", label: "Move to Preparing" },
    preparing: { next: "ready", label: "Mark Ready to Dispatch" },
    ready: { next: "dispatched", label: "Mark Dispatched to Driver" },
  };

  const transition = nextStep[order.status];

  return (
    <div className="rounded-2xl bg-[#FBF9F4] p-7 shadow-xs border border-[#18352B]/10 flex flex-col">
      <h2 className="font-serif text-2xl font-medium text-[#18352B]">
        Action panel
      </h2>
      <p className="mt-1 text-xs text-[#18352B]/60">
        A clear label. A seamless handover.
      </p>

      {/* Thermal QR Label Preview (70 x 90 mm) */}
      <div className="mt-5 rounded-xl bg-[#EFE9DC] p-5 border border-[#18352B]/10">
        <div
          id="layah-qr-printable"
          className="mx-auto max-w-[240px] rounded-md bg-white px-5 py-5 text-center shadow-sm border border-[#18352B]/10"
        >
          <p className="font-serif text-xl font-medium text-[#18352B]">Layah</p>
          <hr className="my-2 border-[#18352B]/15" />
          <p className="text-xs font-bold tracking-wider text-[#18352B]">
            {order.orderCode}
          </p>
          <p className="text-[11px] text-[#18352B]/70 mb-3">
            {order.customerName}
          </p>

          <DeterministicQrSvg seed={`${order.orderCode}-${order.receiptCode}`} />

          <p className="mt-3 text-[10px] text-[#18352B]/65">
            {order.deliveryRoute} · {order.scheduledTime} WIB
          </p>
          <p className="text-[9px] text-[#18352B]/50 mt-0.5">
            Resi: {order.receiptCode}
          </p>

          {order.allergyAlert && (
            <div className="mt-2.5 inline-flex items-center justify-center gap-1 rounded bg-[#F3E4E6] px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-[#641E2A]">
              <AlertTriangle className="h-3 w-3 shrink-0" />
              {order.allergyAlert}
            </div>
          )}
        </div>

        <p className="mt-3 text-center text-[10px] text-[#18352B]/55">
          QR label preview · 70 × 90 mm
        </p>
      </div>

      {/* Print Button */}
      <div className="mt-5 space-y-2.5">
        <Button variant="burgundy" size="lg" fullWidth onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          Print QR Label
        </Button>

        {transition && onStatusChange && (
          <Button
            variant="green"
            size="md"
            fullWidth
            onClick={() => onStatusChange(transition.next)}
          >
            {transition.label}
          </Button>
        )}
      </div>

      <p className="mt-3 text-center text-[11px] text-[#18352B]/60">
        Print one label per package. Attach securely before dispatch.
      </p>

      <div className="mt-5 flex items-start gap-2.5 border-t border-[#18352B]/10 pt-4 text-[11px] text-[#18352B]/65">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#18352B] mt-0.5" />
        <span>
          Double-check quantities and allergy instructions before handing over
          to your driver.
        </span>
      </div>
    </div>
  );
}
