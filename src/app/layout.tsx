import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "CASReady — Enterprise Pre-CAS Interview Simulator & Assessment",
  description: "Production-grade UK University Pre-CAS Interview Preparation Platform with Real-time Speech Fluency, Visual Attention Tracking & Rule-based Assessment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
