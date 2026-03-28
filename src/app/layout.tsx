import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "@/components/Providers";
import { Sidebar } from "@/components/Sidebar";
import { MainLayout } from "@/components/MainLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Smart Grievance Portal",
  description: "Manage student grievances with role-based dashboards.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}
      >
        <Providers>
          <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <MainLayout>{children}</MainLayout>
          </div>
        </Providers>
      </body>
    </html>
  );
}
