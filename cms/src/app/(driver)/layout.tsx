import React, { Suspense } from "react";
import { CartProvider } from "@/context/CartContext";
import { CustomerNavbar } from "@/components/customer/CustomerNavbar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-[#C9B99A] text-[#18352B]">
        <Suspense fallback={<div className="h-[73px] w-full bg-[#18352B]" />}>
          <CustomerNavbar />
        </Suspense>
        <main className="flex-1">
          <Suspense
            fallback={
              <div className="p-10 text-center text-sm text-[#18352B]/70">
                Memuat halaman...
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </CartProvider>
  );
}