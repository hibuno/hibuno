import { Suspense } from "react";
import { Metadata } from "next";
import ImageCompressionClient from "./image-compression-client";

export const metadata: Metadata = {
  title: "Image Compression Tool - Hibuno",
  description: "Compress your images online for free. Reduce file size while maintaining quality with our browser-based image compression tool.",
  keywords: ["image compression", "compress image", "reduce file size", "optimize images", "webp converter", "image optimizer", "hibuno"],
  authors: [{ name: "Hibuno Team" }],
  openGraph: {
    title: "Image Compression Tool - Hibuno",
    description: "Compress your images online for free. Reduce file size while maintaining quality with our browser-based image compression tool.",
    type: "website",
    url: "/tools/image-compression",
    siteName: "Hibuno",
    images: [{
      url: "/og-tools-compression.jpg",
      width: 1200,
      height: 630,
      alt: "Hibuno Image Compression Tool"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Image Compression Tool - Hibuno",
    description: "Compress your images online for free. Reduce file size while maintaining quality with our browser-based image compression tool.",
    images: [{
      url: "/og-tools-compression.jpg",
      alt: "Hibuno Image Compression Tool"
    }]
  }
};

export default function ImageCompressionPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading image compression tool...</div>}>
      <ImageCompressionClient />
    </Suspense>
  );
}
