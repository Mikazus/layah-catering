"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { AlertTriangle, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { Order, OrderStatus } from "@/types/order";

interface QrLabelPanelProps {
  order: Order;
  onStatusChange?: (nextStatus: OrderStatus) => Promise<void>;
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

      {/* Thermal QR Label Preview (70 x 90 mm) — Real Scannable QR encoding order.id */}
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

          <div className="inline-block p-1 bg-white">
            <QRCodeSVG
              value={order.id}
              size={156}
              level="M"
              fgColor="#18352B"
              bgColor="#FFFFFF"
            />
          </div>

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
          QR label preview · 70 × 90 mm (Scannable by Driver)
        </p>
      </div>

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
