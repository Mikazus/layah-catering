"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, QrCode, X } from "lucide-react";

interface QrScannerBoxProps {
  stepTitle: string;
  placeholderText: string;
  inputPlaceholder: string;
  value: string;
  onChange: (val: string) => void;
}

declare global {
  interface Window {
    BarcodeDetector?: new (opts?: { formats: string[] }) => {
      detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
    };
  }
}

export function QrScannerBox({
  stepTitle,
  placeholderText,
  inputPlaceholder,
  value,
  onChange,
}: QrScannerBoxProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!cameraActive) return;
    let stream: MediaStream | null = null;
    let scanTimer: number | undefined;

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment" } })
      .then((mediaStream) => {
        stream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }

        if (typeof window !== "undefined" && window.BarcodeDetector) {
          const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
          scanTimer = window.setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const codes = await detector.detect(videoRef.current);
              if (codes.length > 0 && codes[0].rawValue) {
                onChange(codes[0].rawValue.trim());
                setCameraActive(false);
              }
            } catch {
              // Ignore transient frame errors
            }
          }, 450);
        }
      })
      .catch(() => {
        setCameraError("Kamera tidak dapat diakses. Ketik kode QR secara manual di bawah.");
        setCameraActive(false);
      });

    return () => {
      if (scanTimer) window.clearInterval(scanTimer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [cameraActive, onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-[#18352B]">{stepTitle}</p>
        {value && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#18352B]">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Terbaca
          </span>
        )}
      </div>

      <div className="relative h-44 w-full overflow-hidden rounded-xl bg-[#18352B] p-4 flex flex-col items-center justify-center text-[#C9B99A]">
        {cameraActive && (
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover opacity-65"
          />
        )}

        <span className="pointer-events-none absolute left-4 top-4 h-6 w-6 border-l-2 border-t-2 border-[#C9B99A]/80" />
        <span className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r-2 border-t-2 border-[#C9B99A]/80" />
        <span className="pointer-events-none absolute bottom-4 left-4 h-6 w-6 border-b-2 border-l-2 border-[#C9B99A]/80" />
        <span className="pointer-events-none absolute bottom-4 right-4 h-6 w-6 border-b-2 border-r-2 border-[#C9B99A]/80" />
        <div className="pointer-events-none absolute inset-x-7 top-1/2 h-px bg-[#C9B99A]/45" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <QrCode className="h-6 w-6 text-[#C9B99A]/90 mb-2" />
          <p className="text-[11px] text-[#C9B99A]/90">{placeholderText}</p>

          <button
            type="button"
            onClick={() => {
              setCameraError(null);
              setCameraActive((prev) => !prev);
            }}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md border border-[#C9B99A]/45 bg-[#11261F]/85 px-3 py-1.5 text-[11px] font-medium text-[#FBF9F4] hover:bg-[#11261F] cursor-pointer"
          >
            {cameraActive ? (
              <>
                <X className="h-3.5 w-3.5" /> Tutup Kamera
              </>
            ) : (
              <>
                <Camera className="h-3.5 w-3.5" /> Aktifkan Kamera QR
              </>
            )}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={inputPlaceholder}
        className="w-full rounded-lg border border-[#18352B]/25 bg-[#DDD2BC]/75 px-3 py-2 text-xs font-medium text-[#18352B] placeholder:text-[#18352B]/45 outline-none focus:border-[#18352B]"
      />

      {cameraError && (
        <p className="text-[11px] text-[#641E2A]">{cameraError}</p>
      )}
    </div>
  );
}
