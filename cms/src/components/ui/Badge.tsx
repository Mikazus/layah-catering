import React from "react";

type BadgeVariant = "green" | "burgundy" | "tan" | "outline" | "amber";

interface BadgeProps {
  variant?: BadgeVariant;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const STYLES: Record<BadgeVariant, string> = {
  green: "bg-[#18352B] text-[#FBF9F4] border border-[#18352B]",
  burgundy: "bg-[#F3E4E6] text-[#641E2A] border border-[#641E2A]/25",
  tan: "bg-[#EFE9DC] text-[#18352B] border border-[#18352B]/20",
  outline: "bg-transparent text-[#18352B] border border-[#18352B]/45",
  amber: "bg-[#F4EAD2] text-[#7A4B16] border border-[#C69249]/35",
};

export function Badge({
  variant = "tan",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${STYLES[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            variant === "green"
              ? "bg-[#C9B99A]"
              : variant === "burgundy"
              ? "bg-[#641E2A]"
              : "bg-[#18352B]/70"
          }`}
        />
      )}
      {children}
    </span>
  );
}
