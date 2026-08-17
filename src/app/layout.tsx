import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { publicConfig } from "@/lib/config.client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${publicConfig.NEXT_PUBLIC_BUSINESS_NAME} — Operations`,
  description: "Fleet, dispatch, and billing operations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
