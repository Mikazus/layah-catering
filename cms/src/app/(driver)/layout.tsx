import React from "react";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-[#18352B] flex justify-center sm:py-6">
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] sm:rounded-[28px] bg-[#C9B99A] text-[#18352B] shadow-2xl sm:border sm:border-[#C9B99A]/30 flex flex-col px-5">
        {children}
      </div>
    </div>
  );
}
