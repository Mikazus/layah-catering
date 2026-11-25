import React from "react";
import { UtensilsCrossed } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#18352B]/30 bg-[#EFE9DC]/40 px-6 py-12 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#18352B]/10 text-[#18352B]">
        <UtensilsCrossed className="h-5 w-5" />
      </div>
      <h3 className="mt-3 font-serif text-xl font-semibold text-[#18352B]">
        {title}
      </h3>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-[#18352B]/70">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
