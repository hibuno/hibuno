import { Suspense } from "react";
import { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Hibuno - Free Online Web Tools",
  description: "Free browser-based tools for text manipulation, image processing, and more. No installation required, all processing happens in your browser.",
  keywords: [
    "free web tools", 
    "online tools", 
    "text tools", 
    "image compression", 
    "background removal", 
    "case converter", 
    "text manipulation", 
    "browser-based tools", 
    "no installation", 
    "privacy-focused", 
    "hibuno"
  ],
  authors: [{ name: "Hibuno Team" }],
  openGraph: {
    title: "Hibuno - Free Online Web Tools",
    description: "Free browser-based tools for text manipulation, image processing, and more. No installation required, all processing happens in your browser.",
    type: "website",
    url: "/",
    siteName: "Hibuno",
    images: [{
      url: "/og-image.jpg",
      width: 1200,
      height: 630,
      alt: "Hibuno Web Tools"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Hibuno - Free Online Web Tools",
    description: "Free browser-based tools for text manipulation, image processing, and more. No installation required, all processing happens in your browser.",
    images: [{
      url: "/og-image.jpg",
      alt: "Hibuno Web Tools"
    }]
  }
};

export default async function HomePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading homepage...</div>}>
      <HomeClient />
    </Suspense>
  );
}
