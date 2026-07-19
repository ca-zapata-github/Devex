import type { Metadata } from "next";
import { AppNav } from "@/components/layout/AppNav";
import { SampleDataBanner } from "@/components/layout/SampleDataBanner";
import { getLayoutSession } from "@/lib/layout-session";
import "./globals.css";

export const metadata: Metadata = {
  title: "FTDS DevEx Command Center",
  description:
    "Progress tracker for the FTDS Developer Experience 90-day execution plan (Jul 20 – Oct 16, 2026).",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getLayoutSession();

  return (
    <html lang="en">
      <body>
        <SampleDataBanner
          visible={session.showSampleBanner}
          canDismiss={session.canEdit}
        />
        <AppNav
          canEdit={session.canEdit}
          editAuthConfigured={session.editAuthConfigured}
        />
        {children}
      </body>
    </html>
  );
}
