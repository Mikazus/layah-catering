"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/utils/format";
import type { Order, OrderStatus } from "@/types/order";

interface ManagementOrderModalProps {
  order: Order | null;
  onClose: () => void;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
}

export function ManagementOrderModal({
  order,
  onClose,
  onUpdateStatus,
}: ManagementOrderModalProps) {
  const [status, setStatus] = useState<OrderStatus>("incoming");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (order) setStatus(order.status);
  }, [order]);

  if (!order) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateStatus(order.id, status);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={Boolean(order)}
      onClose={onClose}
      title={`Detail Pesanan ${order.orderCode}`}
      subtitle={`Resi ${order.receiptCode} · ${order.deliveryRoute}`}
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-5 text-xs text-[#18352B]">
        <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#18352B]/15 bg-[#FBF9F4] p-4">
          <div>
            <p className="text-[11px] text-[#18352B]/60">Pelanggan</p>
            <p className="mt-0.5 text-sm font-semibold">{order.customerName}</p>
            <p className="text-[#18352B]/70">{order.customerPhone}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#18352B]/60">Jadwal Pengiriman</p>
            <p className="mt-0.5 text-sm font-semibold">
              {order.scheduledLabel || order.scheduledTime}
            </p>
            <p className="text-[#18352B]/70">{order.deliveryRoute}</p>
          </div>
          <div className="col-span-2 border-t border-[#18352B]/10 pt-3">
            <p className="text-[11px] text-[#18352B]/60">Alamat Pengiriman</p>
            <p className="mt-0.5 text-xs font-medium">{order.deliveryAddress}</p>
          </div>
        </div>

        {order.allergyAlert && (
          <div className="flex items-start gap-2.5 rounded-lg border border-[#641E2A]/35 bg-[#F3E4E6] p-3.5 text-[#641E2A]">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Catatan Alergen: {order.allergyAlert}</p>
              {order.allergyInstruction && (
                <p className="mt-0.5 text-[11px]">{order.allergyInstruction}</p>
              )}
            </div>
          </div>
        )}

        <div>
          <p className="font-semibold mb-2">Daftar Hidangan</p>
          <div className="divide-y divide-[#18352B]/15 rounded-lg border border-[#18352B]/15 bg-[#FBF9F4]">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between px-4 py-2.5"
              >
                <div>
                  <span className="font-bold mr-2">{item.quantity}x</span>
                  <span className="font-medium">{item.menuName}</span>
                  {item.allergenNote && (
                    <span className="ml-2 text-[11px] font-medium text-[#641E2A]">
                      ({item.allergenNote})
                    </span>
                  )}
                </div>
                <span className="font-semibold">
                  {formatRupiah(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between bg-[#18352B]/5 px-4 py-3 font-bold text-sm">
              <span>Total Pembayaran</span>
              <span>{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-[#18352B]/15 pt-4 flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <Select
              label="Perbarui Status Pesanan"
              surface="white"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
              options={[
                { label: "Incoming (Masuk)", value: "incoming" },
                { label: "Preparing (Diproses Dapur)", value: "preparing" },
                { label: "Ready to Dispatch (Siap Kirim)", value: "ready" },
                { label: "Dispatched (Dalam Perjalanan)", value: "dispatched" },
                { label: "Delivered (Diantar)", value: "delivered" },
                { label: "Cancelled (Dibatalkan)", value: "cancelled" },
              ]}
            />
          </div>
          <Button
            variant="burgundy"
            disabled={saving}
            onClick={handleSave}
            className="w-full sm:w-auto"
          >
            {saving ? "Menyimpan..." : "Simpan Status"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
