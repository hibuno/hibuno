import { Suspense } from "react";
import { Metadata } from "next";
import BackgroundRemovalClient from "./background-removal-client";

export const metadata: Metadata = {
  title: "Background Removal Tool - Hibuno",
  description: "Remove backgrounds from your images with our free AI-powered background removal tool. Process images directly in your browser with no upload required.",
  keywords: ["background removal", "remove background", "image editing", "transparent background", "AI image tool", "free background remover", "hibuno"],
  authors: [{ name: "Hibuno Team" }],
  openGraph: {
    title: "Background Removal Tool - Hibuno",
    description: "Remove backgrounds from your images with our free AI-powered background removal tool. Process images directly in your browser with no upload required.",
    type: "website",
    url: "/tools/background-removal",
    siteName: "Hibuno",
    images: [{
      url: "/og-tools-background.jpg",
      width: 1200,
      height: 630,
      alt: "Hibuno Background Removal Tool"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Background Removal Tool - Hibuno",
    description: "Remove backgrounds from your images with our free AI-powered background removal tool. Process images directly in your browser with no upload required.",
    images: [{
      url: "/og-tools-background.jpg",
      alt: "Hibuno Background Removal Tool"
    }]
  }
};

export default function BackgroundRemovalPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading background removal tool...</div>}>
      <BackgroundRemovalClient />
    </Suspense>
  );
}
