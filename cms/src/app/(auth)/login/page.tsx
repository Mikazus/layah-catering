import React from "react";
import { LayahLogo } from "@/components/shared/LayahLogo";
import { LoginCard } from "@/components/auth/LoginCard";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#18352B] flex flex-col items-center justify-between px-4 py-8 sm:py-10">
      {/* Subtle architectural frame & organic rings matching Layah design */}
      <div className="pointer-events-none absolute inset-4 sm:inset-6 rounded-sm border border-[#C9B99A]/15" />
      <div className="pointer-events-none absolute -left-32 bottom-10 h-[420px] w-[420px] rounded-full border border-[#C9B99A]/10" />
      <div className="pointer-events-none absolute -right-24 -top-16 h-[460px] w-[460px] rounded-full border border-[#C9B99A]/10" />

      {/* Top Brand Header */}
      <header className="relative z-10 flex flex-col items-center text-center pt-2">
        <LayahLogo variant="stacked" subtitle="CATERING" tone="light" />
        <p className="mt-3 text-[10px] tracking-[0.26em] uppercase text-[#C9B99A]/70">
          THOUGHTFUL FOOD. SEAMLESS SERVICE.
        </p>
      </header>

      {/* Center Card */}
      <section className="relative z-10 my-6 w-full flex justify-center">
        <LoginCard />
      </section>

      {/* Editorial Footer */}
      <footer className="relative z-10 text-center pb-1">
        <p className="font-serif italic text-base sm:text-lg text-[#C9B99A]">
          The art of thoughtful hospitality.
        </p>
        <p className="mt-1 text-[10px] text-[#C9B99A]/60">
          © 2026 Layah Catering. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
