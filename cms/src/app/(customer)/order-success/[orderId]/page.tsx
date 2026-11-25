"use client";

import React, { Suspense } from "react";
import { useParams } from "next/navigation";
import { OrderStepper } from "@/components/shared/OrderStepper";
import { OrderSuccessCard } from "@/components/customer/OrderSuccessCard";

function OrderSuccessContent() {
  const params = useParams<{ orderId: string }>();
  const rawOrderId = Array.isArray(params?.orderId)
    ? params.orderId[0]
    : params?.orderId || "ORD-0000";

  return <OrderSuccessCard orderId={decodeURIComponent(rawOrderId)} />;
}

export default function OrderSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col justify-between">
      <div className="px-4">
        <OrderStepper currentStep={3} />
        <Suspense
          fallback={
            <div className="py-20 text-center text-sm text-[#18352B]/70">
              Memuat konfirmasi pesanan...
            </div>
          }
        >
          <OrderSuccessContent />
        </Suspense>
      </div>

      <footer className="border-t border-[#18352B]/15 px-6 sm:px-10 py-4 text-[11px] text-[#18352B]/70">
        <div className="mx-auto flex max-w-[1440px] flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-serif text-sm font-semibold text-[#18352B]">
            Layah.
          </span>
          <span>Diracik dengan perhatian. Disajikan untuk kebersamaan.</span>
          <span>© 2026</span>
        </div>
      </footer>
    </div>
  );
}