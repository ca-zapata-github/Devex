import type { Metadata } from "next";
import { AppNav } from "@/components/layout/AppNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "FTDS DevEx Command Center",
  description:
    "Progress tracker for the FTDS Developer Experience 90-day execution plan (Jul 20 – Oct 16, 2026).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppNav />
        {children}
      </body>
    </html>
  );
}
