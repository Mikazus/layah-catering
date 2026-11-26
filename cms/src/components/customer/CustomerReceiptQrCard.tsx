"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Check,
  CheckCircle2,
  Copy,
  Maximize2,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import type { Order } from "@/types/order";

interface CustomerReceiptQrCardProps {
  order: Order;
}

export function CustomerReceiptQrCard({ order }: CustomerReceiptQrCardProps) {
  const [copied, setCopied] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);

  const isDelivered = order.status === "delivered";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(order.receiptCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked
    }
  };

  return (
    <>
      <div className="rounded-xl border border-[#18352B]/20 bg-[#FBF9F4] p-5 sm:p-6 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#641E2A]">
                QR VERIFIKASI PENERIMA
              </p>
              <h3 className="mt-1 font-serif text-xl font-medium text-[#18352B]">
                QR Resi Pengiriman
              </h3>
            </div>
            <QrCode className="h-5 w-5 text-[#18352B]/65 mt-0.5" />
          </div>

          <p className="mt-1.5 text-xs text-[#18352B]/70 leading-relaxed">
            Tunjukkan QR Code ini kepada kurir saat paket tiba untuk dipindai di
            langkah <strong>2. Scan QR Resi (Tujuan)</strong> agar pengiriman
            dapat diverifikasi.
          </p>

          {/* Scannable QR Frame */}
          <div className="mt-5 rounded-xl bg-[#EFE9DC] p-5 border border-[#18352B]/15 text-center">
            {isDelivered ? (
              <div className="py-6 flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#18352B] text-[#FBF9F4]">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <p className="mt-3 font-serif text-2xl font-medium text-[#18352B]">
                  Terverifikasi!
                </p>
                <p className="mt-1 text-xs text-[#18352B]/70">
                  Paket telah diserahkan dan diverifikasi oleh kurir{" "}
                  {order.deliveredAt ? `(${order.deliveredAt})` : ""}.
                </p>
              </div>
            ) : (
              <>
                <div className="inline-block rounded-xl bg-white p-4 shadow-sm border border-[#18352B]/15">
                  <QRCodeSVG
                    value={order.receiptCode}
                    size={184}
                    level="M"
                    fgColor="#18352B"
                    bgColor="#FFFFFF"
                  />
                </div>

                <div className="mt-3.5">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-[#18352B]/60">
                    KODE RESI TUJUAN
                  </p>
                  <p className="mt-0.5 text-xl font-extrabold tracking-widest text-[#18352B] font-mono">
                    {order.receiptCode}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#18352B]/65">
                    Pasangan QR Dapur: <strong>{order.orderCode}</strong>
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#18352B]/30 bg-[#FBF9F4] px-3 py-1.5 text-xs font-semibold text-[#18352B] hover:bg-white cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#18352B]" />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Salin Kode
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setZoomOpen(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#641E2A] px-3 py-1.5 text-xs font-semibold text-[#FBF9F4] hover:bg-[#4E1620] cursor-pointer"
                  >
                    <Maximize2 className="h-3.5 w-3.5" />
                    Perbesar QR
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#18352B]/8 px-3.5 py-2.5 text-[11px] text-[#18352B]/80">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#18352B] mt-0.5" />
          <span>
            Sistem verifikasi ganda memastikan paket yang Anda terima sesuai
            dengan pesanan dapur &amp; catatan alergi Anda.
          </span>
        </div>
      </div>

      {/* Fullscreen High-Contrast QR Modal for Easy Camera Scanning */}
      <Modal
        isOpen={zoomOpen}
        onClose={() => setZoomOpen(false)}
        title={`QR Resi ${order.receiptCode}`}
        subtitle={`Arahkan kamera kurir untuk memindai · Pesanan ${order.orderCode}`}
        maxWidthClass="max-w-sm"
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="rounded-2xl bg-white p-6 shadow-md border border-[#18352B]/15">
            <QRCodeSVG
              value={order.receiptCode}
              size={240}
              level="H"
              fgColor="#18352B"
              bgColor="#FFFFFF"
            />
          </div>
          <p className="mt-4 text-2xl font-extrabold tracking-widest text-[#18352B] font-mono">
            {order.receiptCode}
          </p>
          <p className="mt-1 text-xs text-[#18352B]/70">
            Penerima: <strong>{order.customerName}</strong>
          </p>
        </div>
      </Modal>
    </>
  );
}
