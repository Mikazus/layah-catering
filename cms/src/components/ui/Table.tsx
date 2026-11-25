import React from "react";

interface TableProps {
  headers: { label: string; align?: "left" | "center" | "right" }[];
  children: React.ReactNode;
}

export function Table({ headers, children }: TableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead>
          <tr className="bg-[#18352B] text-[#FBF9F4]">
            {headers.map((h) => (
              <th
                key={h.label}
                className={`px-4 py-3 text-xs font-medium tracking-wide ${
                  h.align === "right"
                    ? "text-right"
                    : h.align === "center"
                    ? "text-center"
                    : "text-left"
                }`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#18352B]/20">{children}</tbody>
      </table>
    </div>
  );
}
