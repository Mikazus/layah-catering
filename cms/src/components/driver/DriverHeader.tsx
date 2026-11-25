"use client";

import React from "react";
import { LogOut, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import type { DriverVerificationState } from "@/types/driver";

interface DriverHeaderProps {
  activeTab: "queue" | "map" | "verify";
  step: DriverVerificationState;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const VERIFY_LABELS: Record<DriverVerificationState, string> = {
  scanning: "VERIFIKASI",
  mismatch: "PERIKSA ULANG",
  verified: "TERVERIFIKASI",
};

export function DriverHeader({
  activeTab,
  step,
  onRefresh,
  isRefreshing,
}: DriverHeaderProps) {
  const { logout } = useAuth();

  const statusBadge =
    activeTab === "queue"
      ? "ANTREAN"
      : activeTab === "map"
      ? "NAVIGASI"
      : VERIFY_LABELS[step];

  return (
    <header className="flex items-center justify-between pt-5 pb-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#18352B]">
          KATERING / KURIR
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`text-[11px] font-bold tracking-[0.14em] uppercase ${
            activeTab === "verify" && step === "mismatch"
              ? "text-[#641E2A]"
              : "text-[#18352B]"
          }`}
        >
          {statusBadge}
        </span>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            className="rounded-md p-1.5 text-[#18352B]/75 hover:bg-[#18352B]/10 cursor-pointer"
            title="Segarkan pesanan"
            aria-label="Segarkan pesanan"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        )}

        <button
          type="button"
          onClick={logout}
          className="rounded-md p-1.5 text-[#18352B]/70 hover:bg-[#18352B]/10 hover:text-[#18352B] cursor-pointer"
          title="Keluar akun kurir"
          aria-label="Keluar akun kurir"
        >
          <LogOut className="h-3.5 w-3.5" />
        </button>
      </div>
    </header>
  );
}