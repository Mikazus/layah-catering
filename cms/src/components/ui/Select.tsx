"use client";

import React from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  surface?: "tan" | "white";
}

export function Select({
  label,
  options,
  surface = "tan",
  className = "",
  id,
  ...props
}: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");
  const surfaceClass =
    surface === "white"
      ? "bg-[#FBF9F4] border-[#18352B]/20 text-[#18352B]"
      : "bg-transparent border-[#18352B]/35 text-[#18352B]";

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-[#18352B] mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-md border px-3.5 py-2 pr-9 text-sm outline-none focus:border-[#18352B] transition-colors cursor-pointer ${surfaceClass} ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#EFE9DC] text-[#18352B]"
            >
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#18352B]/70" />
      </div>
    </div>
  );
}
