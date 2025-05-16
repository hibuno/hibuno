import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getImageAnalysis } from "@/lib/actions";
import { ResultsDisplay } from "@/components/results-display";
import { ArrowLeft, Camera, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/sidebar";

interface PageProps {
 params: Promise<{
  id: string;
 }>;
}

export async function generateMetadata({
 params,
}: PageProps): Promise<Metadata> {
 const analysis = await getImageAnalysis((await params).id);

 if (!analysis) {
  return {
   title: "Image Not Found - Hibuno",
   description: "The requested Metadata & AI Checker could not be found.",
  };
 }

 return {
  title: `${analysis.filename} Analysis - Hibuno Metadata & AI Checker Tool`,
  description: `View detailed analysis of ${analysis.filename} including EXIF data, AI detection, and color information.`,
  openGraph: {
   title: `Metadata & AI Checker Results - ${analysis.filename}`,
   description: `View detailed analysis of ${analysis.filename} including EXIF data, AI detection, and color information.`,
   type: "website",
   url: `/tools/image-analysis/${(await params).id}`,
   siteName: "Hibuno",
  },
 };
}

export default async function ResultsPage({ params }: PageProps) {
 try {
  const analysis = await getImageAnalysis((await params).id);

  if (!analysis) {
   console.log("Analysis not found for ID:", (await params).id);
   notFound();
  }

  return (
   <div className="min-h-screen bg-zinc-900 text-zinc-200 flex">
    {/* Sidebar */}
    <Sidebar />

    {/* Main Content */}
    <div className="flex-1 flex flex-col min-h-screen md:ml-64 p-6">
     {/* Header */}
     <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
       <Link href="/tools/image-analysis">
        <Button
         variant="ghost"
         size="icon"
         className="mr-2 text-zinc-400 hover:text-white"
        >
         <ArrowLeft className="h-5 w-5" />
        </Button>
       </Link>
       <h1 className="text-xl font-bold flex items-center">
        <Camera className="h-5 w-5 mr-2 text-zinc-400" />
        Metadata & AI Checker Results
       </h1>
      </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Image Preview and Basic Info */}
      <div className="lg:col-span-1 space-y-6">
       <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
        <CardHeader className="border-b border-zinc-700 pb-3">
         <CardTitle className="text-lg font-medium truncate">
          {analysis.filename || "Unnamed Image"}
         </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
         <div className="relative aspect-square w-full overflow-hidden">
          <Image
           src={analysis.url || "/placeholder.svg"}
           alt={analysis.filename || "Analyzed image"}
           fill
           className="object-contain"
           sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
           priority
          />
         </div>
        </CardContent>
       </Card>

       <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader className="pb-3">
         <CardTitle className="text-lg font-medium">File Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
         <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
           <p className="text-xs text-zinc-500">File Type</p>
           <p className="font-medium">{analysis.fileType || "Unknown"}</p>
          </div>
          <div className="space-y-1">
           <p className="text-xs text-zinc-500">File Size</p>
           <p className="font-medium">
            {analysis.fileSize
             ? `${(analysis.fileSize / 1024).toFixed(2)} KB`
             : "Unknown"}
           </p>
          </div>
          <div className="space-y-1">
           <p className="text-xs text-zinc-500">Dimensions</p>
           <p className="font-medium">
            {analysis.exifData?.image?.width && analysis.exifData?.image?.height
             ? `${analysis.exifData.image.width} × ${analysis.exifData.image.height}`
             : "Unknown"}
           </p>
          </div>
          <div className="space-y-1">
           <p className="text-xs text-zinc-500">Date Analyzed</p>
           <p className="font-medium">{new Date().toLocaleDateString()}</p>
          </div>
         </div>
        </CardContent>
       </Card>

       <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader className="pb-3">
         <CardTitle className="text-lg font-medium flex items-center">
          <Sparkles className="h-4 w-4 mr-2 text-zinc-400" />
          AI Detection
         </CardTitle>
        </CardHeader>
        <CardContent>
         <div className="flex items-center justify-between mb-3">
          <div>
           {analysis.aiDetection?.isAiGenerated ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200">
             AI Generated
            </span>
           ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200">
             Human Created
            </span>
           )}
          </div>
          <div className="text-sm font-medium">
           {analysis.aiDetection?.confidence !== undefined
            ? `${analysis.aiDetection.confidence.toFixed(0)}% confidence`
            : "Unknown"}
          </div>
         </div>

         <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
          <div
           className={`h-full ${
            analysis.aiDetection?.isAiGenerated ? "bg-red-500" : "bg-green-500"
           }`}
           style={{ width: `${analysis.aiDetection?.confidence || 0}%` }}
          ></div>
         </div>

         <div className="mt-4 text-xs text-zinc-400">
          <p>
           This analysis uses AI detection algorithms to determine if an image
           was created by AI or a human photographer.
          </p>
         </div>
        </CardContent>
       </Card>
      </div>

      {/* Right Column - Analysis Results */}
      <div className="lg:col-span-2 space-y-6">
       <div className="bg-zinc-800 border-zinc-700 rounded-md overflow-hidden">
        <ResultsDisplay analysis={analysis} />
       </div>
      </div>
     </div>
    </div>
   </div>
  );
 } catch (error) {
  console.error("Error in results page:", error);
  notFound();
 }
}
