"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  maxWidthClass = "max-w-lg",
  children,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-[#18352B]/65 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className={`relative z-10 w-full ${maxWidthClass} rounded-xl bg-[#EFE9DC] border border-[#18352B]/25 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-start justify-between px-6 py-4 bg-[#18352B] text-[#FBF9F4]">
          <div>
            <h3 className="font-serif text-xl font-semibold leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-[#C9B99A] mt-0.5">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-[#C9B99A] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Tutup modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}
