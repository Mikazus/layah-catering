"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  summaryText: string;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  summaryText,
  onPageChange,
}: PaginationProps) {
  const pages: (number | "...")[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1, 2, 3, "...", totalPages);
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#18352B]/20 text-xs text-[#18352B]/75">
      <span>{summaryText}</span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="h-7 w-7 inline-flex items-center justify-center rounded border border-transparent hover:border-[#18352B]/30 disabled:opacity-40 cursor-pointer"
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        {pages.map((p, idx) =>
          p === "..." ? (
            <span key={`dots-${idx}`} className="px-1.5">
              ...
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`h-7 min-w-7 px-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                currentPage === p
                  ? "bg-[#18352B] text-[#FBF9F4]"
                  : "border border-[#18352B]/30 text-[#18352B] hover:bg-[#18352B]/10"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="h-7 w-7 inline-flex items-center justify-center rounded border border-transparent hover:border-[#18352B]/30 disabled:opacity-40 cursor-pointer"
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
