import React, { Suspense } from "react";
import { DesktopOnlyGuard } from "@/components/shared/DesktopOnlyGuard";
import { KitchenNavbar } from "@/components/kitchen/KitchenNavbar";

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DesktopOnlyGuard>
      <div className="flex min-h-screen flex-col bg-[#C9B99A] text-[#18352B]">
        <Suspense fallback={<div className="h-[68px] w-full bg-[#18352B]" />}>
          <KitchenNavbar />
        </Suspense>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </DesktopOnlyGuard>
  );
}
