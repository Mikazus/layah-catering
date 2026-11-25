"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutGrid,
  MapPin,
  ShieldCheck,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { LayahLogo } from "@/components/shared/LayahLogo";
import { MANAGEMENT_NAV_ITEMS } from "@/lib/constants/navigation";

const ICON_MAP = {
  dashboard: LayoutGrid,
  orders: ClipboardList,
  menu: UtensilsCrossed,
  membership: Users,
};

export function ManagementSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col justify-between bg-[#18352B] text-[#C9B99A] px-5 py-6">
      <div>
        <Link href="/management/dashboard" className="block px-1">
          <LayahLogo variant="navbar" subtitle="CATERING · MALANG" tone="light" />
        </Link>

        <div className="mt-8">
          <p className="px-2 text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9B99A]/55">
            RUANG KERJA
          </p>

          <nav className="mt-3 space-y-1.5">
            {MANAGEMENT_NAV_ITEMS.map((item) => {
              const Icon = ICON_MAP[item.icon];
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-md px-3.5 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#C9B99A] text-[#18352B] font-semibold shadow-xs"
                      : "text-[#C9B99A]/85 hover:bg-white/5 hover:text-[#FBF9F4]"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-[#18352B]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Branch Info matching screenshots */}
      <div className="space-y-5">
        <div className="border-t border-[#C9B99A]/15 pt-5 px-1">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C9B99A]/55">
            CABANG AKTIF
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#FBF9F4]">
            <MapPin className="h-3.5 w-3.5 text-[#C9B99A]" />
            Tidar Atas, Malang
          </p>
          <p className="mt-2.5 text-[11px] leading-relaxed text-[#C9B99A]/65">
            Dikelola dengan sepenuh hati.
            <br />
            Disajikan dengan kualitas.
          </p>
        </div>

        <div className="flex items-center gap-2 px-1 text-[10px] tracking-[0.16em] uppercase text-[#C9B99A]/50">
          <ShieldCheck className="h-3.5 w-3.5" />
          ADMINISTRASI · V 2.4
        </div>
      </div>
    </aside>
  );
}
