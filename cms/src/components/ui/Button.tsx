"use client";

import React from "react";

type ButtonVariant = "burgundy" | "green" | "outline" | "outlineBurgundy" | "ghost" | "white";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  burgundy:
    "bg-[#641E2A] text-[#FBF9F4] hover:bg-[#4E1620] active:bg-[#3F1119] border border-transparent shadow-xs",
  green:
    "bg-[#18352B] text-[#FBF9F4] hover:bg-[#11261F] active:bg-[#0B1B15] border border-transparent shadow-xs",
  outline:
    "bg-transparent text-[#18352B] border border-[#18352B]/60 hover:bg-[#18352B]/10",
  outlineBurgundy:
    "bg-transparent text-[#641E2A] border border-[#641E2A] hover:bg-[#641E2A]/10",
  ghost:
    "bg-transparent text-[#18352B] hover:bg-[#18352B]/10 border border-transparent",
  white:
    "bg-[#FBF9F4] text-[#18352B] border border-[#18352B]/15 hover:bg-white shadow-xs",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs rounded-md",
  md: "px-4 py-2.5 text-sm rounded-md",
  lg: "px-5 py-3 text-sm rounded-lg",
};

export function Button({
  variant = "burgundy",
  size = "md",
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#641E2A]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
        VARIANT_CLASSES[variant]
      } ${SIZE_CLASSES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
