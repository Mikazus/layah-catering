"use client";

import { useState } from "react";
import { markOrderDeliveredApi, verifyDriverQrApi } from "@/lib/api/driver";
import type { DriverVerificationState, QrVerifyResponse } from "@/types/driver";

export function useQrScanner() {
  const [kitchenQr, setKitchenQr] = useState("");
  const [receiptQr, setReceiptQr] = useState("");
  const [step, setStep] = useState<DriverVerificationState>("scanning");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusUpdated, setStatusUpdated] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<QrVerifyResponse | null>(null);

  const verify = async () => {
    if (!kitchenQr.trim() || !receiptQr.trim()) return;
    setIsVerifying(true);
    try {
      const res = await verifyDriverQrApi({ kitchenQr, receiptQr });
      setVerificationResult(res);
      setStatusUpdated(false);
      setStep(res.matched ? "verified" : "mismatch");
    } finally {
      setIsVerifying(false);
    }
  };

  const confirmDelivered = async () => {
    if (!verificationResult?.orderId) return;
    setIsUpdating(true);
    try {
      await markOrderDeliveredApi(verificationResult.orderId);
      setStatusUpdated(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const reset = () => {
    setKitchenQr("");
    setReceiptQr("");
    setVerificationResult(null);
    setStatusUpdated(false);
    setStep("scanning");
  };

  return {
    kitchenQr,
    setKitchenQr,
    receiptQr,
    setReceiptQr,
    step,
    isVerifying,
    isUpdating,
    statusUpdated,
    verificationResult,
    verify,
    confirmDelivered,
    reset,
  };
}
