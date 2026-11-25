import type { Metadata } from "next";
import { Cormorant_Garamond, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Layah Catering — Thoughtful Food. Seamless Service.",
  description:
    "Integrated catering management platform for Customer ordering, Kitchen Display System (KDS), Driver QR verification, and Management analytics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${cormorant.variable} ${plusJakarta.variable}`}>
      <body className="min-h-screen bg-[#C9B99A] text-[#18352B] antialiased selection:bg-[#641E2A] selection:text-[#FBF9F4]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
