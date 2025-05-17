"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import Link from "next/link";
import {
 ArrowLeft,
 Download,
 ImageIcon,
 Info,
 Loader2,
 Trash2,
 Layers,
} from "lucide-react";
import CompressionLoadingSkeleton from "./components/loading-skeleton";
import { Sidebar } from "@/components/sidebar";
import { CompressionOptions } from "@/components/compression-options";
import { FileDropzone } from "@/components/file-dropzone";
import { ImageList } from "@/components/image-list";
import { useImageQueue } from "@/hooks/use-image-queue";
import { DEFAULT_QUALITY_SETTINGS } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
 ImageFile,
 OutputType,
 CompressionOptions as CompressionOptionsType,
} from "@/lib/types";

// Loading indicator component
function LoadingIndicator() {
 return (
  <div className="flex items-center justify-center p-8">
   <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
   <span className="ml-2 text-zinc-300">
    Loading image compression tools...
   </span>
  </div>
 );
}

export default function ImageCompression() {
 const [images, setImages] = useState<ImageFile[]>([]);
 const [outputType, setOutputType] = useState<OutputType>("webp");
 const [options, setOptions] = useState<CompressionOptionsType>({
  quality: DEFAULT_QUALITY_SETTINGS.webp,
 });
 const [isLoading, setIsLoading] = useState(true);

 // Preload WASM modules when component mounts
 useEffect(() => {
  const preloadModules = async () => {
   try {
    setIsLoading(true);
    // Dynamically import the modules for the selected output type
    // This will trigger the WASM loading only when the user visits this page
    if (outputType === "webp") {
     await import("@jsquash/webp");
    } else if (outputType === "avif") {
     await import("@jsquash/avif");
    } else if (outputType === "jpeg") {
     await import("@jsquash/jpeg");
    } else if (outputType === "jxl") {
     await import("@jsquash/jxl");
    } else if (outputType === "png") {
     await import("@jsquash/png");
    }
    setIsLoading(false);
   } catch (error) {
    console.error("Failed to preload modules:", error);
    setIsLoading(false);
   }
  };

  preloadModules();
 }, [outputType]);

 const { addToQueue } = useImageQueue(options, outputType, setImages);

 const handleOutputTypeChange = useCallback((type: OutputType) => {
  setOutputType(type);
  if (type !== "png") {
   setOptions({ quality: DEFAULT_QUALITY_SETTINGS[type] });
  }
 }, []);

 const handleFilesDropMultiple = useCallback(
  (acceptedFiles: File[]) => {
   // Create ImageFile objects from the accepted files
   const newImages: ImageFile[] = acceptedFiles.map((file) => ({
    id: crypto.randomUUID(),
    file: file,
    status: "pending",
    originalSize: file.size,
   }));

   // Add to state
   setImages((prev) => [...prev, ...newImages]);

   // Use requestAnimationFrame to wait for render to complete
   requestAnimationFrame(() => {
    // Then add to queue after UI has updated
    newImages.forEach((image) => {
     addToQueue(image.id);
    });
   });
  },
  [addToQueue]
 );

 const handleFilesDrop = useCallback(
  (acceptedFile: File) => {
   // Create an ImageFile object from the accepted file
   const newImage: ImageFile = {
    id: crypto.randomUUID(),
    file: acceptedFile,
    status: "pending",
    originalSize: acceptedFile.size,
   };

   // Add to state
   setImages((prev) => [...prev, newImage]);

   // Use requestAnimationFrame to wait for render to complete
   requestAnimationFrame(() => {
    // Then add to queue after UI has updated
    addToQueue(newImage.id);
   });
  },
  [addToQueue]
 );

 const handleRemoveImage = useCallback((id: string) => {
  setImages((prev) => {
   const image = prev.find((img) => img.id === id);
   if (image?.preview) {
    URL.revokeObjectURL(image.preview);
   }
   return prev.filter((img) => img.id !== id);
  });
 }, []);

 const handleClearAll = useCallback(() => {
  images.forEach((image) => {
   if (image.preview) {
    URL.revokeObjectURL(image.preview);
   }
  });
  setImages([]);
 }, [images]);

 const handleDownloadAll = useCallback(async () => {
  const completedImages = images.filter((img) => img.status === "complete");

  for (const image of completedImages) {
   if (image.blob && image.outputType) {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(image.blob);
    link.download = `${image.file.name.split(".")[0]}.${image.outputType}`;
    link.click();
    URL.revokeObjectURL(link.href);
   }

   await new Promise((resolve) => setTimeout(resolve, 100));
  }
 }, [images]);

 const completedImages = images.filter(
  (img) => img.status === "complete"
 ).length;

 const AboutContent = () => {
  return (
   <>
    <div className="space-y-4 text-sm text-zinc-400">
     <p>
      This tool uses browser-based compression to reduce the file size of your
      images. The process runs entirely in your browser using WebAssembly, so
      your images are never uploaded to any server.
     </p>
     <p>
      You can choose from multiple output formats including WebP, AVIF, JPEG,
      JPEG XL, and PNG. Each format has different compression characteristics
      and browser compatibility.
     </p>
     <p>
      For best results, adjust the quality slider to find the right balance
      between file size and image quality. Lower quality values result in
      smaller files but may introduce visual artifacts.
     </p>

     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      <div className="p-4 bg-zinc-900/50 rounded-md border border-zinc-700">
       <div className="text-zinc-200 font-medium mb-2">WebP Format</div>
       <p className="text-xs">
        Best overall compression with good quality. Supported by all modern
        browsers, but may not work with older software.
       </p>
      </div>

      <div className="p-4 bg-zinc-900/50 rounded-md border border-zinc-700">
       <div className="text-zinc-200 font-medium mb-2">JPEG Format</div>
       <p className="text-xs">
        Good compression for photographs. Widely compatible with all devices and
        software, but doesn&apos;t support transparency.
       </p>
      </div>

      <div className="p-4 bg-zinc-900/50 rounded-md border border-zinc-700">
       <div className="text-zinc-200 font-medium mb-2">PNG Format</div>
       <p className="text-xs">
        Lossless compression that preserves quality and supports transparency.
        Results in larger file sizes than WebP or JPEG.
       </p>
      </div>
     </div>

     <div className="mt-4 p-3 bg-violet-900/30 border border-violet-800 rounded-md text-violet-200">
      <div className="flex items-start">
       <Info className="h-4 w-4 mr-2 mt-0.5 text-violet-400" />
       <p className="text-xs">
        For web images, WebP is recommended for the best balance of quality and
        file size. For maximum compatibility, use JPEG for photos and PNG for
        graphics with transparency.
       </p>
      </div>
     </div>
    </div>
   </>
  );
 };

 return (
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
       <Layers className="h-5 w-5 mr-2 text-zinc-400" />
       Image Compression
      </h1>
     </div>
    </div>

    {isLoading ? (
     <Suspense fallback={<CompressionLoadingSkeleton />}>
      <LoadingIndicator />
     </Suspense>
    ) : (
     <div className="grid md:grid-cols-2 md:gap-6">
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
         <FileDropzone
          onFileAccepted={handleFilesDrop}
          onFilesAccepted={handleFilesDropMultiple}
          acceptedFileTypes={[
           "image/jpeg",
           "image/png",
           "image/webp",
           "image/avif",
          ]}
          label="Drop your images here"
          description="Supports JPG, PNG, WebP, and AVIF"
          maxSize={10 * 1024 * 1024}
          multiple={true}
         />
        </CardContent>
       </Card>

       <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
         <CardTitle className="text-lg font-medium flex items-center">
          <Layers className="h-5 w-5 mr-2 text-zinc-400" />
          Compression Options
         </CardTitle>
        </CardHeader>
        <CardContent>
         <CompressionOptions
          options={options}
          outputType={outputType}
          onOptionsChange={setOptions}
          onOutputTypeChange={handleOutputTypeChange}
         />
        </CardContent>
       </Card>

       <Card className="hidden md:block bg-zinc-800 border-zinc-700">
        <CardHeader>
         <CardTitle className="text-zinc-200">
          About Image Compression
         </CardTitle>
        </CardHeader>
        <CardContent>{AboutContent()}</CardContent>
       </Card>
      </div>

      {/* Right Column - Preview and Results */}
      <div className="space-y-6">
       <Card className="bg-zinc-800 border-zinc-700">
        <CardHeader>
         <CardTitle className="text-lg font-medium">Images</CardTitle>
        </CardHeader>
        <CardContent>
         {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-700 rounded-lg bg-zinc-800/50">
           <ImageIcon className="h-12 w-12 text-zinc-600 mb-2" />
           <p className="text-zinc-500 text-center">
            Upload images to compress them
           </p>
          </div>
         ) : (
          <div className="space-y-4">
           <ImageList images={images} onRemove={handleRemoveImage} />

           <div className="flex gap-2 mt-4">
            {completedImages > 0 && (
             <Button
              className="flex-1 bg-violet-600 hover:bg-violet-700"
              onClick={handleDownloadAll}
             >
              <Download className="h-4 w-4 mr-2" />
              Download All ({completedImages})
             </Button>
            )}

            {images.length > 0 && (
             <Button
              variant="outline"
              className="flex-1 border-zinc-700 hover:bg-zinc-700 text-zinc-300"
              onClick={handleClearAll}
             >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
             </Button>
            )}
           </div>
          </div>
         )}
        </CardContent>
       </Card>

       <Card className="block md:hidden bg-zinc-800 border-zinc-700">
        <CardHeader>
         <CardTitle className="text-zinc-200">
          About Image Compression
         </CardTitle>
        </CardHeader>
        <CardContent>{AboutContent()}</CardContent>
       </Card>
      </div>
     </div>
    )}
   </div>
  </div>
 );
}
