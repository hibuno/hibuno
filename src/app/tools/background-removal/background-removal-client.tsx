"use client";

import { useState } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { FileDropzone } from "@/components/file-dropzone";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
 ArrowLeft,
 Download,
 ImageIcon,
 Layers,
 Info,
 Check,
 Loader2,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import * as ort from "onnxruntime-web";

export default function BackgroundRemovalClient() {
 const [file, setFile] = useState<File | null>(null);
 const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
 const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
  null
 );
 const [originalSize, setOriginalSize] = useState<number | null>(null);
 const [processedSize, setProcessedSize] = useState<number | null>(null);
 const [isProcessing, setIsProcessing] = useState(false);
 const [isLoadingModel, setIsLoadingModel] = useState(false);
 const [error, setError] = useState<string | null>(null);

 // Constants for image processing
 const IMAGE_WIDTH = 320;
 const IMAGE_HEIGHT = 320;
 const IMAGE_CHANNELS = 3;
 const mean = [0.485, 0.456, 0.406];
 const std = [0.229, 0.224, 0.225];

 const handleFileAccepted = async (acceptedFile: File) => {
  setFile(acceptedFile);
  setOriginalImageUrl(URL.createObjectURL(acceptedFile));
  setOriginalSize(acceptedFile.size);
  setProcessedImageUrl(null);
  setProcessedSize(null);
  setError(null);
 };
 const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
   const img = new window.Image();
   img.onload = () => resolve(img);
   img.onerror = (err) => reject(err);
   img.src = url;
  });
 };

 const preprocessImage = (
  image: HTMLImageElement,
  width: number,
  height: number,
  mean: number[],
  std: number[]
 ) => {
  const offscreenCanvas = document.createElement("canvas");
  const offscreenCtx = offscreenCanvas.getContext("2d");
  if (!offscreenCtx) throw new Error("Failed to get canvas context");

  offscreenCanvas.width = width;
  offscreenCanvas.height = height;
  offscreenCtx.drawImage(image, 0, 0, width, height);

  const imageData = offscreenCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const pixels = new Float32Array(1 * IMAGE_CHANNELS * width * height);

  for (let y = 0; y < height; y++) {
   for (let x = 0; x < width; x++) {
    const index = (y * width + x) * 4;
    const r = (data[index] / 255 - mean[0]) / std[0];
    const g = (data[index + 1] / 255 - mean[1]) / std[1];
    const b = (data[index + 2] / 255 - mean[2]) / std[2];

    const newIndex = y * width + x;
    pixels[newIndex] = r;
    pixels[newIndex + width * height] = g;
    pixels[newIndex + 2 * width * height] = b;
   }
  }
  return new ort.Tensor("float32", pixels, [1, IMAGE_CHANNELS, width, height]);
 };

 const handleRemoveBackground = async () => {
  if (!file || !originalImageUrl) return;

  try {
   setIsProcessing(true);
   setError(null);

   // Initialize ONNX runtime session with the selected model
   // Using only WASM execution provider for better compatibility
   setIsLoadingModel(true);
   const sessionModel = await ort.InferenceSession.create(
    `/models/remove-background-silueta.onnx`,
    {
     executionProviders: ["wasm"],
    }
   );
   setIsLoadingModel(false);

   // Load and process the image
   const originalImage = await loadImage(originalImageUrl);

   // Create canvas for processing
   const canvas = document.createElement("canvas");
   canvas.width = originalImage.width;
   canvas.height = originalImage.height;
   const ctx = canvas.getContext("2d");
   if (!ctx) throw new Error("Failed to get canvas context");

   // Draw original image to canvas
   ctx.drawImage(originalImage, 0, 0);

   // Get image data for processing
   const imageDataSource = ctx.getImageData(
    0,
    0,
    originalImage.width,
    originalImage.height
   );

   // Preprocess image for model input
   const pixelsTensor = preprocessImage(
    originalImage,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    mean,
    std
   );
   const inputDictModel = { ["input.1"]: pixelsTensor };

   // Run model inference
   const outputModel = await sessionModel.run(inputDictModel);
   const mask = outputModel["1959"].data;

   // Since we don't have the output processor model, we'll resize the mask manually
   // Create a temporary canvas to resize the mask
   const tempCanvas = document.createElement("canvas");
   tempCanvas.width = originalImage.width;
   tempCanvas.height = originalImage.height;
   const tempCtx = tempCanvas.getContext("2d");
   if (!tempCtx) throw new Error("Failed to get temp canvas context");

   // Create an ImageData from the mask
   const maskImageData = new ImageData(IMAGE_WIDTH, IMAGE_HEIGHT);
   for (let i = 0; i < IMAGE_WIDTH * IMAGE_HEIGHT; i++) {
    const value = Math.round(Number(mask[i]) * 255);
    maskImageData.data[i * 4] = value; // R
    maskImageData.data[i * 4 + 1] = value; // G
    maskImageData.data[i * 4 + 2] = value; // B
    maskImageData.data[i * 4 + 3] = 255; // A
   }

   // Create a temporary canvas to hold the small mask
   const smallMaskCanvas = document.createElement("canvas");
   smallMaskCanvas.width = IMAGE_WIDTH;
   smallMaskCanvas.height = IMAGE_HEIGHT;
   const smallMaskCtx = smallMaskCanvas.getContext("2d");
   if (!smallMaskCtx)
    throw new Error("Failed to get small mask canvas context");

   // Put the mask data on the small canvas
   smallMaskCtx.putImageData(maskImageData, 0, 0);

   // Draw the small mask canvas onto the temp canvas, scaling it up
   tempCtx.drawImage(
    smallMaskCanvas,
    0,
    0,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    0,
    0,
    originalImage.width,
    originalImage.height
   );

   // Get the scaled mask data
   const scaledMaskData = tempCtx.getImageData(
    0,
    0,
    originalImage.width,
    originalImage.height
   ).data;

   // Create a normalized mask array
   const resizedMask = new Float32Array(
    originalImage.width * originalImage.height
   );
   for (let i = 0; i < originalImage.width * originalImage.height; i++) {
    resizedMask[i] = scaledMaskData[i * 4] / 255; // Use the red channel value and normalize it
   }

   // Apply mask to original image (set alpha channel)
   for (let y = 0; y < originalImage.height; y++) {
    for (let x = 0; x < originalImage.width; x++) {
     const index = (y * originalImage.width + x) * 4;
     // Apply threshold to make the mask more binary (clearer edges)
     const maskValue = Number(resizedMask[y * originalImage.width + x]);
     imageDataSource.data[index + 3] = maskValue > 0.5 ? 255 : 0;
    }
   }

   // Put processed image data back to canvas
   ctx.putImageData(imageDataSource, 0, 0);

   // Convert canvas to data URL and set as processed image
   const processedDataUrl = canvas.toDataURL();
   setProcessedImageUrl(processedDataUrl);

   // Calculate approximate size of processed image
   const base64Data = processedDataUrl.split(",")[1];
   const processedSizeApprox = Math.ceil((base64Data.length * 3) / 4);
   setProcessedSize(processedSizeApprox);
  } catch (err) {
   console.error(err);
   setError(err instanceof Error ? err.message : "An unknown error occurred");
  } finally {
   setIsProcessing(false);
   setIsLoadingModel(false);
  }
 };

 const handleDownload = () => {
  if (!processedImageUrl) return;

  const downloadLink = document.createElement("a");
  downloadLink.href = processedImageUrl;
  downloadLink.download = file
   ? `${file.name.split(".")[0]}_no_bg.png`
   : "image_no_bg.png";
  downloadLink.click();
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
       Background Removal
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
        <FileDropzone
         onFileAccepted={handleFileAccepted}
         acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
         label="Drop your image here"
         description="Supports JPG, PNG, and WebP (max 10MB)"
         maxSize={10 * 1024 * 1024}
        />

        {originalImageUrl && (
         <div className="mt-4">
          <Button
           onClick={handleRemoveBackground}
           className="w-full bg-violet-600 hover:bg-violet-700"
           disabled={isProcessing}
          >
           {isProcessing ? (
            <>
             <Loader2 className="h-4 w-4 mr-2 animate-spin" />
             {isLoadingModel ? 'Loading model...' : 'Processing...'}
            </>
           ) : (
            <>
             <Layers className="h-4 w-4 mr-2" />
             Remove Background
            </>
           )}
          </Button>
         </div>
        )}

        {error && (
         <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-md text-red-200 text-sm">
          <div className="flex items-start">
           <Info className="h-4 w-4 mr-2 mt-0.5 text-red-400" />
           <p>{error}</p>
          </div>
         </div>
        )}
       </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-700">
       <CardContent className="p-4">
        <div>
         <div className="flex">
          <Info className="h-5 w-5 text-violet-400 mr-2 mt-0.5" />
          <p className="text-zinc-300 font-medium">Processing Results</p>
         </div>
         <p className="text-zinc-400 text-sm mt-1">
          Background successfully removed
         </p>
         <div className="mt-3 flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
           <Check className="h-4 w-4 text-green-500" />
           <span className="text-xs text-zinc-400">Transparent background</span>
          </div>
          <div className="flex items-center space-x-2">
           <Check className="h-4 w-4 text-green-500" />
           <span className="text-xs text-zinc-400">AI-powered detection</span>
          </div>
          <div className="flex items-center space-x-2">
           <Check className="h-4 w-4 text-green-500" />
           <span className="text-xs text-zinc-400">
            PNG format with alpha channel
           </span>
          </div>
         </div>
         {originalSize && processedSize && (
          <div className="mt-3 grid grid-cols-1 gap-2">
           <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Original Size:</span>
            <span className="text-xs font-medium text-zinc-300">
             {(originalSize / 1024).toFixed(2)} KB
            </span>
           </div>
           <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Processed Size:</span>
            <span className="text-xs font-medium text-zinc-300">
             {(processedSize / 1024).toFixed(2)} KB
            </span>
           </div>
           <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400">Size Reduction:</span>
            <span className="text-xs font-medium text-zinc-300">
             {(((originalSize - processedSize) / originalSize) * 100).toFixed(
              1
             )}
             %
            </span>
           </div>
          </div>
         )}
        </div>
       </CardContent>
      </Card>
     </div>

     {/* Right Column - Preview */}
     <div className="space-y-6">
      <Card className="bg-zinc-800 border-zinc-700">
       <CardHeader>
        <CardTitle className="text-lg font-medium">Preview</CardTitle>
       </CardHeader>
       <CardContent>
        {!originalImageUrl && (
         <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-zinc-700 rounded-lg bg-zinc-800/50">
          <ImageIcon className="h-12 w-12 text-zinc-600 mb-2" />
          <p className="text-zinc-500 text-center">
           Upload an image to remove its background
          </p>
         </div>
        )}

        {originalImageUrl && !processedImageUrl && (
         <div className="space-y-4">
          <div className="relative h-64 w-full overflow-hidden rounded-lg border border-zinc-700">
           <NextImage
            src={originalImageUrl}
            alt="Original image"
            fill
            className="object-contain"
           />
          </div>
          <div className="flex justify-between text-sm">
           <span className="text-zinc-400">Original Image</span>
           {originalSize && (
            <span className="text-zinc-400">
             {(originalSize / 1024).toFixed(1)} KB
            </span>
           )}
          </div>
         </div>
        )}

        {processedImageUrl && (
         <div className="space-y-6">
          <div className="relative h-auto w-full overflow-hidden rounded-lg border border-zinc-700">
           {/* eslint-disable-next-line @next/next/no-img-element */}
           <img
            src={processedImageUrl}
            alt="Processed image"
            className="w-full h-auto object-contain"
           />
          </div>

          <Button
           className="w-full bg-violet-600 hover:bg-violet-700"
           onClick={handleDownload}
          >
           <Download className="h-4 w-4 mr-2" />
           Download Result
          </Button>
         </div>
        )}
       </CardContent>
      </Card>
     </div>
    </div>
    <Card className="bg-zinc-800 border-zinc-700 mt-6">
     <CardHeader>
      <CardTitle className="text-lg font-medium">
       About Background Removal
      </CardTitle>
     </CardHeader>
     <CardContent>
      <div className="space-y-4 text-sm text-zinc-400">
       <p>
        This tool uses AI to automatically detect and remove backgrounds from
        images. The process runs entirely in your browser using ONNX Runtime
        Web, so your images are never uploaded to any server.
       </p>
       <p>
        For best results, use images with clear subjects and contrasting
        backgrounds. The tool works well with portraits, product photos, and
        other images where the subject is clearly defined.
       </p>
       <p>
        The resulting image will have a transparent background, suitable for use
        in designs, presentations, e-commerce listings, and more.
       </p>
      </div>
     </CardContent>
    </Card>
   </div>
  </div>
 );
}
