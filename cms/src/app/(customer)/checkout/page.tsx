import React from "react";
import { OrderStepper } from "@/components/shared/OrderStepper";
import { CheckoutForm } from "@/components/customer/CheckoutForm";

export default function CheckoutPage() {
  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col justify-between">
      <div className="px-4 sm:px-6 pb-12">
        <OrderStepper currentStep={2} />
        <CheckoutForm />
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
