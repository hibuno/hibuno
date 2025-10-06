import { GeistMono } from "geist/font/mono";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import type React from "react";
import "./globals.css";
import { Databuddy } from "@databuddy/sdk/react";
import { Suspense } from "react";
import { generateSiteMetadata } from "@/lib/seo";

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
   <body
    className={`font-sans ${InterFont.variable} ${GeistMono.variable} ${SourceSerif.variable} antialiased`}
   >
    <Suspense
     fallback={
      <div className="flex items-center justify-center min-h-screen">
       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
     }
    >
     {children}
     {process.env.NODE_ENV === "production" && (
      <Databuddy
       clientId="Khkm4yYxBGAcgXEXiYT3b"
       trackOutgoingLinks={true}
       trackInteractions={true}
       trackEngagement={true}
       trackScrollDepth={true}
       trackExitIntent={true}
       trackBounceRate={true}
       trackWebVitals={true}
       trackErrors={true}
       enableBatching={true}
      />
     )}
    </Suspense>
   </body>
  </html>
 );
}
