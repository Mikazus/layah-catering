"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { CartItemRow } from "@/components/customer/CartItemRow";
import { Button } from "@/components/ui/Button";
import { formatRupiah } from "@/lib/utils/format";

interface CartSidebarProps {
  onCheckoutClick?: () => void;
  embedded?: boolean;
}

export function CartSidebar({
  onCheckoutClick,
  embedded = false,
}: CartSidebarProps) {
  const router = useRouter();
  const {
    items,
    totalPortions,
    totalPrice,
    updateQuantity,
    removeFromCart,
    updateAllergenNote,
  } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    if (onCheckoutClick) onCheckoutClick();
    router.push("/checkout");
  };

  return (
    <aside
      className={
        embedded
          ? "flex flex-col"
          : "hidden lg:flex lg:flex-col w-full lg:w-[360px] xl:w-[390px] shrink-0 border-l border-[#18352B]/20 bg-[#C9B99A] px-7 py-8 min-h-[calc(100vh-73px)] sticky top-[73px] max-h-[calc(100vh-73px)]"
      }
    >
      {!embedded && (
        <div className="flex items-start justify-between pb-5 border-b border-[#18352B]/15">
          <div>
            <h2 className="font-serif text-2xl font-medium text-[#18352B]">
              Keranjang Belanja
            </h2>
            <p className="mt-0.5 text-xs text-[#18352B]/70">
              {items.length} menu · {totalPortions} porsi
            </p>
          </div>
          <ShoppingBag className="h-5 w-5 text-[#18352B]/75 mt-1" />
        </div>
      )}

      {/* Cart Items */}
      <div
        className={`flex-1 overflow-y-auto space-y-5 ${
          embedded ? "py-1" : "py-5 pr-1"
        }`}
      >
        {items.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#18352B]/65">
            Keranjang Anda masih kosong. Pilih hidangan dari Menu Katalog.
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.menuId}
              item={item}
              onUpdateQty={updateQuantity}
              onRemove={removeFromCart}
              onChangeNote={updateAllergenNote}
            />
          ))
        )}
      </div>

      {/* Order Summary Footer */}
      <div className="mt-4 border-t border-[#18352B]/20 pt-5">
        <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-[#18352B]/65">
          RINGKASAN PESANAN
        </p>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-sm text-[#18352B]/80">Total Price</span>
          <span className="font-serif text-3xl font-semibold text-[#18352B]">
            {formatRupiah(totalPrice)}
          </span>
        </div>

        <Button
          variant="burgundy"
          size="lg"
          fullWidth
          disabled={items.length === 0}
          onClick={handleCheckout}
          className="mt-4"
        >
          Checkout
        </Button>

        <p className="mt-2.5 text-center text-[11px] text-[#18352B]/65">
          Alamat pengiriman &amp; catatan khusus di langkah berikutnya.
        </p>
      </div>
    </aside>
  );
}
