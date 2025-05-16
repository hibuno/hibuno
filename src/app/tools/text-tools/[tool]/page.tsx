import { Suspense } from "react";
import { Metadata } from "next";
import TextToolsClient from "./text-tools-client";
import Link from "next/link";
import { ArrowLeft, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";
import { textTools } from "@/lib/text-tools";

export const metadata: Metadata = {
 title: "Text Tools - Hibuno | Free Online Text Manipulation",
 description:
  "Free online text manipulation tools. Transform case, clean text, sort lines, extract data, and more with our powerful, browser-based text utilities. No installation required.",
 keywords: [
  "text tools",
  "case converter",
  "lowercase converter",
  "uppercase converter",
  "title case converter",
  "random case generator",
  "invert case",
  "capitalize text",
  "reverse text",
  "trim text",
  "sort lines",
  "reverse lines",
  "shuffle lines",
  "number lines",
  "remove empty lines",
  "remove duplicate lines",
  "remove whitespace",
  "remove duplicate spaces",
  "remove punctuation",
  "strip HTML",
  "extract emails",
  "extract URLs",
  "extract numbers",
  "text manipulation",
  "text formatting",
  "text processing",
  "online text tools",
  "hibuno",
 ],
 authors: [{ name: "Hibuno Team" }],
 openGraph: {
  title: "Text Tools - Hibuno | Free Online Text Manipulation",
  description:
   "Free online text manipulation tools. Transform case, clean text, sort lines, extract data, and more with our powerful, browser-based text utilities. No installation required.",
  type: "website",
  siteName: "Hibuno",
  images: [
   {
    url: "/og-tools-text.jpg",
    width: 1200,
    height: 630,
    alt: "Hibuno Text Tools",
   },
  ],
 },
 twitter: {
  card: "summary_large_image",
  title: "Text Tools - Hibuno | Free Online Text Manipulation",
  description:
   "Free online text manipulation tools. Transform case, clean text, sort lines, extract data, and more with our powerful, browser-based text utilities. No installation required.",
  images: [
   {
    url: "/og-tools-text.jpg",
    alt: "Hibuno Text Tools",
   },
  ],
 },
};

export default async function TextToolsPage({
 params,
}: {
 params: Promise<{ tool: string }>;
}) {
 const tool = (await params).tool;
 return (
  <Suspense
   fallback={<div className="p-12 text-center">Loading text tools...</div>}
  >
   <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
    {/* Sidebar */}
    <Sidebar />

    {/* Main Content */}
    <div className="flex-1 flex flex-col min-h-screen md:ml-64 p-4">
     {/* Header */}
     <div className="flex items-center justify-between mb-4">
      <div className="flex items-center">
       <Link href="/">
        <Button
         variant="ghost"
         size="icon"
         className="mr-2 text-zinc-400 hover:text-white"
        >
         <ArrowLeft className="h-5 w-5" />
        </Button>
       </Link>
       <h1 className="text-xl font-bold flex items-center">
        <Type className="h-5 w-5 mr-2 text-zinc-400" />
        {(textTools[tool].title || "").replace(/\|.+/, "")}
       </h1>
      </div>
     </div>

     <div className="space-y-4">
      <TextToolsClient tool={tool} />
      <Card className="bg-zinc-800 border-zinc-700 mt-4 gap-2 py-4">
       <CardHeader className="px-4">
        <CardTitle className="text-lg font-medium">
         About {textTools[tool].title}
        </CardTitle>
       </CardHeader>
       <CardContent className="px-4">
        <div className="space-y-4 text-sm text-zinc-400">
         <p>{textTools[tool].description}</p>
        </div>
       </CardContent>
      </Card>
     </div>
    </div>
   </div>
  </Suspense>
 );
}
