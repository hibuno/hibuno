"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadImage } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileDropzone } from "@/components/file-dropzone";

export function Upload() {
 const [isUploading, setIsUploading] = useState(false);
 const [file, setFile] = useState<File | null>(null);
 const [preview, setPreview] = useState<string | null>(null);
 const [uploadProgress, setUploadProgress] = useState(0);
 const { toast } = useToast();
 const router = useRouter();

 const handleFileAccepted = (acceptedFile: File) => {
  setFile(acceptedFile);
  const reader = new FileReader();
  reader.onload = (e) => {
   setPreview(e.target?.result as string);
  };
  reader.readAsDataURL(acceptedFile);
 };

 const saveToRecentUploads = (id: string, url: string, filename: string) => {
  try {
   // Get existing uploads
   const storedUploads = localStorage.getItem("exifee-recent-uploads");
   let uploads = [];

   if (storedUploads) {
    uploads = JSON.parse(storedUploads);
   }

   // Add new upload to the beginning
   uploads.unshift({
    id,
    url,
    filename,
    uploadedAt: new Date().toISOString(),
   });

   // Keep only the 8 most recent uploads
   if (uploads.length > 8) {
    uploads = uploads.slice(0, 8);
   }

   // Save back to localStorage
   localStorage.setItem("exifee-recent-uploads", JSON.stringify(uploads));
  } catch (error) {
   console.error("Error saving to recent uploads:", error);
  }
 };

 const handleSubmit = async () => {
  if (!file) {
   toast({
    title: "No file selected",
    description: "Please select an image to upload.",
    variant: "destructive",
   });
   return;
  }

  setIsUploading(true);
  setUploadProgress(0);

  // Simulate upload progress
  const progressInterval = setInterval(() => {
   setUploadProgress((prev) => {
    const newProgress = prev + Math.random() * 15;
    return newProgress > 90 ? 90 : newProgress;
   });
  }, 300);

  try {
   const formData = new FormData();
   formData.append("image", file);

   const response = await uploadImage(formData);

   clearInterval(progressInterval);
   setUploadProgress(100);

   if (response.success) {
    toast({
     title: "Upload successful",
     description: "Your image has been uploaded and is being analyzed.",
     variant: "default",
    });

    // Save to recent uploads
    if (response.id && response.url) {
     saveToRecentUploads(response.id, response.url, file.name);
    }

    // Small delay to show 100% progress
    setTimeout(() => {
     router.push(`/tools/image-analysis/${response.id}`);
    }, 500);
   } else {
    throw new Error(response.error || "Failed to upload image");
   }
  } catch (error) {
   clearInterval(progressInterval);
   setUploadProgress(0);
   setIsUploading(false);

   toast({
    title: "Upload failed",
    description:
     error instanceof Error ? error.message : "An error occurred during upload",
    variant: "destructive",
   });
  }
 };

 return (
  <div className="w-full">
   {!preview ? (
    <FileDropzone
     onFileAccepted={handleFileAccepted}
     acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
     label="Drop your image here"
     description="Supports JPG, PNG, and WebP (max 5MB)"
     maxSize={5 * 1024 * 1024}
    />
   ) : (
    <div className="space-y-4">
     <div className="relative h-64 w-full overflow-hidden rounded-lg border border-zinc-700">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
       src={preview}
       alt="Preview"
       className="h-full w-full object-contain"
      />
      <button
       onClick={() => {
        setFile(null);
        setPreview(null);
        setUploadProgress(0);
       }}
       className="absolute top-2 right-2 rounded-full bg-zinc-800 p-1 text-zinc-400 hover:bg-zinc-700 hover:text-white"
      >
       <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
       >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
       </svg>
      </button>
     </div>

     {file && (
      <div className="text-sm">
       <div className="flex items-center justify-between">
        <span className="text-zinc-400">{file.name}</span>
        <span className="text-zinc-400">
         {(file.size / 1024 / 1024).toFixed(2)} MB
        </span>
       </div>
      </div>
     )}

     {isUploading ? (
      <div className="space-y-2">
       <Progress value={uploadProgress} className="h-2" />
       <div className="flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-zinc-400">
         {uploadProgress < 100 ? "Uploading..." : "Processing..."}
        </span>
       </div>
      </div>
     ) : (
      <Button
       onClick={handleSubmit}
       className="w-full bg-violet-600 hover:bg-violet-700"
      >
       <UploadIcon className="h-4 w-4 mr-2" />
       Analyze Image
      </Button>
     )}
    </div>
   )}
  </div>
 );
}
