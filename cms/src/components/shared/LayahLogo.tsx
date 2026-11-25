import React from "react";

interface LayahLogoProps {
  variant?: "navbar" | "stacked" | "wordmark";
  subtitle?: string;
  tone?: "light" | "dark";
}

export function LayahLogo({
  variant = "navbar",
  subtitle = "CATERING · MALANG",
  tone = "light",
}: LayahLogoProps) {
  const textColor = tone === "light" ? "text-[#C9B99A]" : "text-[#18352B]";
  const subColor =
    tone === "light" ? "text-[#C9B99A]/70" : "text-[#18352B]/65";
  const strokeColor = tone === "light" ? "#C9B99A" : "#18352B";

  if (variant === "stacked") {
    return (
      <div className="text-center select-none">
        <div
          className={`font-serif text-4xl sm:text-5xl font-medium tracking-tight leading-none ${textColor}`}
        >
          Layah
        </div>
        <div
          className={`mt-1 text-[10px] tracking-[0.35em] uppercase ${subColor}`}
        >
          {subtitle}
        </div>
      </div>
    );
  }

  if (variant === "wordmark") {
    return (
      <div className="select-none leading-none">
        <div className={`font-serif text-2xl font-medium ${textColor}`}>
          Layah
        </div>
        <div
          className={`text-[9px] tracking-[0.28em] uppercase mt-0.5 ${subColor}`}
        >
          {subtitle}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className="flex h-10 w-9 items-center justify-center rounded-t-full rounded-b-sm border"
        style={{ borderColor: `${strokeColor}88` }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 20V9" />
          <path d="M12 13c-3 0-5-2-5-5 3 0 5 2 5 5Z" />
          <path d="M12 11c3 0 5-2 5-5-3 0-5 2-5 5Z" />
          <path d="M8 20h8" />
        </svg>
      </div>
      <div>
        <div className={`font-serif text-xl font-medium leading-tight ${textColor}`}>
          Layah.
        </div>
        <div className={`text-[9px] tracking-[0.22em] uppercase ${subColor}`}>
          {subtitle}
        </div>
      </div>
    </div>
  );
}
