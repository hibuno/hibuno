import { GeistMono } from "geist/font/mono";
import type { Metadata, Viewport } from "next";
import { Gloria_Hallelujah, Inter } from "next/font/google";
import localFont from "next/font/local";
import type React from "react";
import "./globals.css";
import { Suspense } from "react";
import { generateSiteMetadata } from "@/lib/seo-metadata";
import Script from "next/script";
import Head from "next/head";

// Load custom local serif font and expose CSS variable
const SourceSerif = localFont({
  src: "./fonts/Alliance-No-2-Regular.otf",
  variable: "--font-source-serif",
  weight: "400",
  style: "normal",
  display: "swap",
});

// Load Inter for sans text
const InterFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const GloriaHallelujah = Gloria_Hallelujah({
  subsets: ["latin"],
  variable: "--font-gloria-allelujah",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  ...generateSiteMetadata({
    url: "/",
  }),
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  // Additional alternates for common pages can be added here later
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {process.env.NEXT_PUBLIC_NODE_ENV === "production" && (
        <Head>
          <Script
            src="https://cloud.umami.is/script.js"
            data-website-id="e34a2aaa-fa37-4041-a1cb-416fa98a01f5"
            strategy="afterInteractive"
          />
        </Head>
      )}
      <body
        className={`font-sans ${InterFont.variable} ${GeistMono.variable} ${SourceSerif.variable} ${GloriaHallelujah.variable} antialiased`}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
            </div>
          }
        >
          {children}
        </Suspense>
      </body>
    </html>
  );
}
