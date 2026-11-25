"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  surface?: "white" | "tan" | "dark";
}

export function Input({
  label,
  error,
  leftIcon,
  rightElement,
  surface = "tan",
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  const surfaceStyles = {
    white:
      "bg-white border-[#18352B]/15 text-[#18352B] placeholder:text-[#18352B]/40 focus:border-[#18352B]",
    tan: "bg-[#D5C7AE]/60 border-[#18352B]/25 text-[#18352B] placeholder:text-[#18352B]/45 focus:border-[#18352B]",
    dark: "bg-[#132B22] border-[#C9B99A]/30 text-[#FBF9F4] placeholder:text-[#C9B99A]/60 focus:border-[#C9B99A]",
  }[surface];

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-[#18352B] mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 text-current opacity-60">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          className={`w-full rounded-md border px-3.5 py-2.5 text-sm outline-none transition-colors ${surfaceStyles} ${
            leftIcon ? "pl-9" : ""
          } ${rightElement ? "pr-10" : ""} ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-2.5 flex items-center">{rightElement}</div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-[#641E2A] font-medium">{error}</p>}
    </div>
  );
}
