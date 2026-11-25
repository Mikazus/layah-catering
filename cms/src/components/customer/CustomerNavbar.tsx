"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, LogOut, Search, ShoppingBag, User } from "lucide-react";
import { LayahLogo } from "@/components/shared/LayahLogo";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

export function CustomerNavbar() {
  const { user, logout } = useAuth();
  const { totalPortions } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const handleSearchChange = (value: string) => {
    setQuery(value);
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set("q", value);
    } else {
      params.delete("q");
    }
    const target = `/catalog${params.toString() ? `?${params.toString()}` : ""}`;
    if (pathname === "/catalog") {
      router.replace(target, { scroll: false });
    } else if (value.trim().length > 1) {
      router.push(target);
    }
  };

  const displayName = user?.fullName?.split(" ")[0] || "Aditya";

  return (
    <header className="sticky top-0 z-30 w-full bg-[#18352B] text-[#C9B99A] border-b border-[#C9B99A]/15">
      <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 sm:px-8 py-3.5">
        <Link href="/catalog" className="shrink-0">
          <LayahLogo variant="navbar" subtitle="CATERING · MALANG" tone="light" />
        </Link>

        {/* Search bar - full width row on narrow mobile, inline on desktop */}
        <div className="order-3 w-full md:order-2 md:w-auto md:flex-1 md:max-w-sm md:ml-auto md:mr-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9B99A]/60" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari menu favorit Anda"
              className="w-full rounded-md border border-[#C9B99A]/30 bg-[#132B22] py-2 pl-9 pr-3 text-xs sm:text-sm text-[#FBF9F4] placeholder:text-[#C9B99A]/60 outline-none focus:border-[#C9B99A]"
            />
          </div>
        </div>

        {/* Right controls */}
        <div className="order-2 md:order-3 flex items-center gap-3 sm:gap-4">
          <Link
            href="/catalog"
            className="relative flex lg:hidden items-center justify-center rounded-md border border-[#C9B99A]/30 p-2 text-[#C9B99A]"
            aria-label="Keranjang"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalPortions > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#641E2A] px-1 text-[10px] font-bold text-white">
                {totalPortions}
              </span>
            )}
          </Link>

          <div className="hidden md:block h-6 w-px bg-[#C9B99A]/20" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[#C9B99A] hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#C9B99A]/50">
                <User className="h-3.5 w-3.5" />
              </span>
              <span className="hidden sm:inline font-medium">{displayName}</span>
              <ChevronDown className="h-3.5 w-3.5 opacity-75" />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-48 rounded-lg border border-[#18352B]/20 bg-[#EFE9DC] py-1.5 text-[#18352B] shadow-xl">
                  <div className="border-b border-[#18352B]/15 px-3.5 py-2">
                    <p className="text-xs font-semibold truncate">
                      {user?.fullName || "Aditya Pratama"}
                    </p>
                    <p className="text-[11px] text-[#18352B]/65">Customer</p>
                  </div>
                  <Link
                    href="/catalog"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3.5 py-2 text-xs hover:bg-[#18352B]/10"
                  >
                    Menu Katalog
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3.5 py-2 text-xs hover:bg-[#18352B]/10"
                  >
                    Form Pemesanan
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
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
      </div>
    </header>
  );
}
