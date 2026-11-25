"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, LogOut, Search } from "lucide-react";
import { LayahLogo } from "@/components/shared/LayahLogo";
import { KITCHEN_NAV_ITEMS } from "@/lib/constants/navigation";
import { useAuth } from "@/context/AuthContext";

export function KitchenNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [open, setOpen] = useState(false);

  const handleSearch = (val: string) => {
    setQuery(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val.trim()) params.set("q", val);
    else params.delete("q");
    const base = pathname.startsWith("/kitchen/history")
      ? "/kitchen/history"
      : "/kitchen";
    router.replace(`${base}${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    });
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#18352B] text-[#C9B99A] border-b border-[#C9B99A]/15">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-8 py-3.5">
        <div className="flex items-center gap-10">
          <Link href="/kitchen">
            <LayahLogo variant="wordmark" subtitle="CATERING" tone="light" />
          </Link>

          <nav className="flex items-center gap-7">
            {KITCHEN_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/kitchen"
                  ? pathname === "/kitchen" || pathname.startsWith("/kitchen/orders")
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-1.5 text-sm transition-colors border-b-2 ${
                    isActive
                      ? "border-[#C9B99A] font-semibold text-[#FBF9F4]"
                      : "border-transparent text-[#C9B99A]/75 hover:text-[#FBF9F4]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <div className="relative w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#C9B99A]/60" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search orders or customers"
              className="w-full rounded-md border border-[#C9B99A]/25 bg-[#132B22] py-2 pl-9 pr-3 text-xs text-[#FBF9F4] placeholder:text-[#C9B99A]/60 outline-none focus:border-[#C9B99A]"
            />
          </div>

          <div className="h-6 w-px bg-[#C9B99A]/20" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((p) => !p)}
              className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9B99A] text-xs font-bold text-[#18352B]">
                {user?.initials || "AP"}
              </span>
              <div className="text-left leading-tight">
                <p className="text-xs font-semibold text-[#FBF9F4]">
                  {user?.fullName || "Ayu Pramesti"}
                </p>
                <p className="text-[10px] text-[#C9B99A]/75">
                  {user?.title || "Kitchen Staff"}
                </p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-[#C9B99A]/80" />
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
                    Sign out
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
