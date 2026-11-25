import React from "react";

interface CardProps {
  variant?: "tan" | "lightTan" | "cream" | "green" | "outline";
  className?: string;
  children: React.ReactNode;
}

const CARD_VARIANTS = {
  tan: "bg-[#C9B99A] border border-[#18352B]/25 text-[#18352B]",
  lightTan: "bg-[#DDD2BC] border border-[#18352B]/15 text-[#18352B]",
  cream: "bg-[#FBF9F4] border border-[#18352B]/12 text-[#18352B] shadow-xs",
  green: "bg-[#18352B] border border-[#18352B] text-[#FBF9F4]",
  outline: "bg-transparent border border-[#18352B]/35 text-[#18352B]",
};

export function Card({ variant = "cream", className = "", children }: CardProps) {
  return (
    <div className={`rounded-xl ${CARD_VARIANTS[variant]} ${className}`}>
      {children}
    </div>
  );
}
