import { GeistMono } from "geist/font/mono";
import type { Metadata, Viewport } from "next";
import { Gloria_Hallelujah, Inter } from "next/font/google";
import localFont from "next/font/local";
import type React from "react";
import "./globals.css";
import "./prism-theme.css";
import { Suspense } from "react";
import { generateSiteMetadata } from "@/lib/seo-metadata";
import { Analytics } from "@vercel/analytics/next";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { LocaleDetector } from "@/components/locale-detector";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production";
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      {isProduction && <Analytics />}
      <body
        className={`font-sans ${InterFont.variable} ${GeistMono.variable} ${SourceSerif.variable} ${GloriaHallelujah.variable} antialiased`}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LocaleDetector />
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
              </div>
            }
          >
            {children}
          </Suspense>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
