"use client";

import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MismatchWarningViewProps {
  message?: string;
  onRescan: () => void;
}

export function MismatchWarningView({
  message,
  onRescan,
}: MismatchWarningViewProps) {
  const [contactNotice, setContactNotice] = useState(false);

  return (
    <div className="flex flex-1 flex-col justify-between py-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center px-3">
        {/* Solid Polo Burgundy Triangle Alert matching screenshot */}
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#641E2A]/12 text-[#641E2A]">
          <AlertTriangle className="h-14 w-14 fill-[#641E2A] text-[#C9B99A]" />
        </div>

        <h1 className="mt-5 text-3xl font-extrabold tracking-wide text-[#641E2A] font-sans">
          PERINGATAN!
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-[#18352B]/90">
          {message ||
            "Data QR tidak sesuai dengan rute pengiriman. Periksa kembali alamat atau paket sebelum melanjutkan."}
        </p>

        <div className="my-5 h-px w-10 bg-[#641E2A]/40" />

        <p className="text-xs font-bold text-[#641E2A]">
          Jangan serahkan paket sebelum data dikonfirmasi.
        </p>

        {contactNotice && (
          <div className="mt-4 w-full rounded-lg border border-[#18352B]/25 bg-[#DDD2BC] px-3.5 py-2.5 text-xs text-[#18352B]">
            Menghubungi Dispatch Layah Catering: <strong>+62 341 555 0199</strong>
          </div>
        )}
      </div>

      <div className="space-y-3 pt-6">
        <Button
          variant="burgundy"
          size="lg"
          fullWidth
          onClick={() => setContactNotice(true)}
        >
          Hubungi Manajemen
        </Button>

        <Button
          variant="outlineBurgundy"
          size="lg"
          fullWidth
          onClick={onRescan}
        >
          Scan Ulang
        </Button>
      </div>
    </div>
  );
}
