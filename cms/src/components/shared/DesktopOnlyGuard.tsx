"use client";

import React from "react";
import { Monitor } from "lucide-react";
import { LayahLogo } from "@/components/shared/LayahLogo";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export function DesktopOnlyGuard({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();

  return (
    <>
      <div className="flex lg:hidden min-h-screen flex-col items-center justify-center bg-[#18352B] px-6 text-center text-[#C9B99A]">
        <LayahLogo variant="stacked" subtitle="KITCHEN DISPLAY SYSTEM" />
        <div className="mt-8 max-w-sm rounded-xl bg-[#DDD2BC] p-6 text-[#18352B] shadow-xl">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#18352B]/10 text-[#18352B]">
            <Monitor className="h-6 w-6" />
          </div>
          <h2 className="font-serif text-2xl font-semibold">
            Desktop View Required
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[#18352B]/75">
            Layah Kitchen Display System (KDS) dirancang khusus untuk monitor
            dapur desktop (lebar layar minimal 1024px) agar seluruh kolom Kanban
            dan peringatan alergi terbaca jelas.
          </p>
          <div className="mt-5">
            <Button variant="burgundy" fullWidth onClick={logout}>
              Kembali ke Halaman Login
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-col min-h-screen">{children}</div>
    </>
  );
}
