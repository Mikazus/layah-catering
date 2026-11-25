"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, ChevronRight, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const PAGE_NAMES: Record<string, string> = {
  "/management/dashboard": "Dashboard",
  "/management/orders": "Pesanan",
  "/management/menu": "Menu",
  "/management/membership": "Membership",
};

export function ManagementTopbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const currentSection =
    Object.entries(PAGE_NAMES).find(([path]) =>
      pathname.startsWith(path)
    )?.[1] ?? "Dashboard";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#18352B]/20 bg-[#C9B99A]/95 backdrop-blur-xs px-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-[#18352B]">
        <span className="text-[#18352B]/70">Manajemen</span>
        <ChevronRight className="h-3.5 w-3.5 text-[#18352B]/50" />
        <span className="font-semibold text-[#18352B]">{currentSection}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          className="relative rounded-md p-2 text-[#18352B] hover:bg-[#18352B]/10 transition-colors cursor-pointer"
          aria-label="Notifikasi"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#641E2A]" />
        </button>

        <div className="h-6 w-px bg-[#18352B]/20" />

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-[#18352B]/10 transition-colors cursor-pointer"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#18352B] text-xs font-bold text-[#FBF9F4]">
              {user?.initials || "AP"}
            </span>
            <div className="text-left leading-tight">
              <p className="text-xs font-semibold text-[#18352B]">
                {user?.fullName || "Anindya Putri"}
              </p>
              <p className="text-[10px] text-[#18352B]/65">
                {user?.title || "Administrator"}
              </p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#18352B]/70" />
          </button>

          {open && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-[#18352B]/20 bg-[#EFE9DC] py-1.5 text-[#18352B] shadow-xl">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-xs font-medium text-[#641E2A] hover:bg-[#641E2A]/10 cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Keluar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
