"use client";

import React from "react";
import { Drawer } from "@/components/ui/Drawer";
import { CartSidebar } from "@/components/customer/CartSidebar";
import { useCart } from "@/context/CartContext";

interface MobileCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileCartDrawer({ isOpen, onClose }: MobileCartDrawerProps) {
  const { items, totalPortions } = useCart();

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Keranjang Belanja"
      subtitle={`${items.length} menu · ${totalPortions} porsi`}
    >
      <CartSidebar embedded onCheckoutClick={onClose} />
    </Drawer>
  );
}
