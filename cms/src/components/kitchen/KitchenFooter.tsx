import React from "react";

interface KitchenFooterProps {
  lastSynced?: string;
  isConnected?: boolean;
}

export function KitchenFooter({
  lastSynced = "--:--",
  isConnected = true,
}: KitchenFooterProps) {
  return (
    <footer className="mt-auto border-t border-[#18352B]/15 bg-[#C9B99A] px-8 py-3.5 text-[11px] text-[#18352B]/70">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between">
        <span>Layah Catering · Thoughtfully prepared, beautifully served.</span>
        <span className="inline-flex items-center gap-2 font-medium text-[#18352B]">
          <span
            className={`h-2 w-2 rounded-full ${
              isConnected ? "bg-[#18352B]" : "bg-[#641E2A]"
            }`}
          />
          {isConnected
            ? `Kitchen connected · Last synced ${lastSynced}`
            : "Kitchen offline · Retrying connection..."}
        </span>
      </div>
    </footer>
  );
}
