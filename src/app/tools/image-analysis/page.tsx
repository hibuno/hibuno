import { Suspense } from "react";
import { Metadata } from "next";
import { Upload } from "@/components/upload";
import { RecentUploads } from "@/components/recent-uploads";
import Link from "next/link";
import { ArrowLeft, ImageIcon, Camera, Palette, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
 title: "Metadata & AI Checker Tool - Hibuno",
 description:
  "Analyze images with our free AI-powered Metadata & AI Checker tool. Extract EXIF data, detect AI-generated content, and get detailed color information.",
 keywords: [
  "Metadata & AI Checker",
  "EXIF data",
  "AI detection",
  "color analysis",
  "image metadata",
  "image properties",
  "hibuno",
 ],
 authors: [{ name: "Hibuno Team" }],
 openGraph: {
  title: "Metadata & AI Checker Tool - Hibuno",
  description:
   "Analyze images with our free AI-powered Metadata & AI Checker tool. Extract EXIF data, detect AI-generated content, and get detailed color information.",
  type: "website",
  url: "/tools/image-analysis",
  siteName: "Hibuno",
  images: [
   {
    url: "/og-tools-image-analysis.jpg",
    width: 1200,
    height: 630,
    alt: "Hibuno Metadata & AI Checker Tool",
   },
  ],
 },
 twitter: {
  card: "summary_large_image",
  title: "Metadata & AI Checker Tool - Hibuno",
  description:
   "Analyze images with our free AI-powered Metadata & AI Checker tool. Extract EXIF data, detect AI-generated content, and get detailed color information.",
  images: [
   {
    url: "/og-tools-image-analysis.jpg",
    alt: "Hibuno Metadata & AI Checker Tool",
   },
  ],
 },
};

export default function ImageAnalysisPage() {
 return (
  <Suspense
   fallback={
    <div className="p-12 text-center">
     Loading Metadata & AI Checker tool...
    </div>
   }
  >
   <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
    {/* Sidebar */}
    <Sidebar />

    {/* Main Content */}
    <div className="flex-1 flex flex-col min-h-screen md:ml-64 p-6">
     {/* Header */}
     <div className="flex items-center justify-between mb-6">
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
        <ImageIcon className="h-5 w-5 mr-2 text-zinc-400" />
        Metadata & AI Checker
       </h1>
      </div>
     </div>

     <div className="grid md:grid-cols-2 gap-8">
      {/* Left Column - Upload and Settings */}
      <div className="space-y-6">
       <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
         <CardTitle className="text-lg font-medium flex items-center">
          <ImageIcon className="h-5 w-5 mr-2 text-zinc-400" />
          Upload Image
         </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
         <Upload />
        </CardContent>
       </Card>

       <Card className="bg-zinc-900 border-zinc-700">
        <CardContent>
         <p className="text-zinc-400 text-sm mt-1">
          Comprehensive Metadata & AI Checker
         </p>
         <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
           <Camera className="h-4 w-4 text-green-500" />
           <span className="text-xs text-zinc-400">EXIF metadata</span>
          </div>
          <div className="flex items-center space-x-2">
           <Sparkles className="h-4 w-4 text-green-500" />
           <span className="text-xs text-zinc-400">AI detection</span>
          </div>
          <div className="flex items-center space-x-2">
           <Palette className="h-4 w-4 text-green-500" />
           <span className="text-xs text-zinc-400">Color analysis</span>
          </div>
         </div>
        </CardContent>
       </Card>
      </div>

      {/* Right Column - Recent Uploads */}
      <div className="space-y-6">
       <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
         <CardTitle className="text-lg font-medium">Recent Analyses</CardTitle>
        </CardHeader>
        <CardContent>
         <RecentUploads />
        </CardContent>
       </Card>
      </div>
     </div>

     <Card className="bg-zinc-800 border-zinc-700 mt-6">
      <CardHeader>
       <CardTitle className="text-lg font-medium">
        About Metadata & AI Checker
       </CardTitle>
      </CardHeader>
      <CardContent>
       <div className="space-y-4 text-sm text-zinc-400">
        <p>
         This tool uses advanced algorithms to analyze your images and extract
         valuable information. The analysis runs entirely in the cloud,
         providing comprehensive insights while ensuring your privacy.
        </p>
        <p>
         For best results, upload clear, high-resolution images. The tool works
         with JPEG, PNG, and WebP formats and can extract EXIF data, detect
         AI-generated content, analyze color composition, and more.
        </p>
        <p>
         The resulting analysis includes camera information, shooting
         parameters, location data (if available), AI detection confidence, and
         color palette extraction. All uploads are automatically deleted after 3
         hours to protect your privacy.
        </p>
       </div>
      </CardContent>
     </Card>
    </div>
   </div>
  </Suspense>
 );
}
