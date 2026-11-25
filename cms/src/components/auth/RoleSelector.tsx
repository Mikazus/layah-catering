"use client";

import React from "react";
import type { UserRole } from "@/types/auth";

interface RoleSelectorProps {
  value: UserRole;
  onChange: (role: UserRole) => void;
}

const ROLES: { value: UserRole; label: string }[] = [
  { value: "customer", label: "Customer" },
  { value: "kitchen", label: "Kitchen Staff" },
  { value: "driver", label: "Driver" },
  { value: "management", label: "Management" },
];

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="w-full">
      <p className="mb-2 text-center text-[11px] font-medium text-[#18352B]/70">
        Choose your workspace
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 rounded-lg bg-[#C9B99A]/80 p-1 border border-[#18352B]/10">
        {ROLES.map((role) => {
          const isActive = value === role.value;
          return (
            <button
              key={role.value}
              type="button"
              onClick={() => onChange(role.value)}
              className={`rounded-md px-2 py-2 text-[11px] font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-white text-[#18352B] font-semibold shadow-xs"
                  : "text-[#18352B]/70 hover:text-[#18352B] hover:bg-white/40"
              }`}
            >
              {role.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
