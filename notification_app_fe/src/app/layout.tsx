// Reg No: 22MID0305

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppThemeProvider from "@/components/AppThemeProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CampusNotify — Real-time Campus Notifications",
  description: "Stay updated with real-time campus notifications for Placements, Results, and Events.",
  keywords: ["campus notifications", "placements", "results", "events", "priority inbox"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AppThemeProvider>{children}</AppThemeProvider>
      </body>
    </html>
  );
}
