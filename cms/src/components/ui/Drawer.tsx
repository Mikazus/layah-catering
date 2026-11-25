"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center lg:hidden">
      <div
        className="fixed inset-0 bg-[#18352B]/65 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-h-[88vh] rounded-t-2xl bg-[#C9B99A] border-t border-[#18352B]/30 shadow-2xl flex flex-col overflow-hidden">
        <div className="mx-auto mt-2.5 h-1.5 w-12 rounded-full bg-[#18352B]/30" />
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#18352B]/20">
          <div>
            <h3 className="font-serif text-xl font-semibold text-[#18352B]">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#18352B]/70">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#18352B] hover:bg-[#18352B]/10"
            aria-label="Tutup keranjang"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4 flex-1">{children}</div>
      </div>
    </div>
  );
}
