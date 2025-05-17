import { Suspense } from "react";
import { DocumentExtractorClient } from "./client";
import { Metadata } from "next";
import DocumentExtractorLoading from "./loading";

export const metadata: Metadata = {
 title: "Document Extractor Tool - Hibuno | Free Online Document Analyzer",
 description:
  "Analyze documents online with our free AI-powered Document Extractor tool. Extract EXIF data, detect AI-generated content, and get detailed color information.",
 keywords: [
  "Document Extractor",
  "EXIF data",
  "AI detection",
  "color analysis",
  "document metadata",
  "image metadata",
  "free online document analysis",
  "hibuno",
 ],
 authors: [{ name: "Hibuno Team" }],
 openGraph: {
  title: "Document Extractor Tool - Hibuno | Free Online Document Analyzer",
  description:
   "Analyze documents online with our free AI-powered Document Extractor tool. Extract EXIF data, detect AI-generated content, and get detailed color information.",
  type: "website",
  url: "/tools/document-extractor",
  siteName: "Hibuno",
  images: [
   {
    url: "/og-tools-document-extractor.jpg",
    width: 1200,
    height: 630,
    alt: "Hibuno Document Extractor Tool",
   },
  ],
 },
 twitter: {
  card: "summary_large_image",
  title: "Document Extractor Tool - Hibuno | Free Online Document Analyzer",
  description:
   "Analyze documents online with our free AI-powered Document Extractor tool. Extract EXIF data, detect AI-generated content, and get detailed color information.",
  images: [
   {
    url: "/og-tools-document-extractor.jpg",
    alt: "Hibuno Document Extractor Tool",
   },
  ],
 },
};

export default function Home() {
 return (
  <Suspense fallback={<DocumentExtractorLoading />}>
   <DocumentExtractorClient />
  </Suspense>
 );
}
