import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "./providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sejiwa — Project Management untuk Agency",
  description:
    "Platform manajemen proyek untuk Sejiwa Agency. Kelola ticket, track progress tim, dan dapatkan AI insights.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased` }
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
