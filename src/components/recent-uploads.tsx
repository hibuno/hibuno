"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Trash2, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface RecentUpload {
 id: string;
 url: string;
 filename: string;
 uploadedAt: string;
}

export function RecentUploads() {
 const [recentUploads, setRecentUploads] = useState<RecentUpload[]>([]);
 const [isLoading, setIsLoading] = useState(true);
 const { toast } = useToast();

 useEffect(() => {
  // Get recent uploads from localStorage
  const storedUploads = localStorage.getItem("exifee-recent-uploads");
  if (storedUploads) {
   try {
    const parsedUploads = JSON.parse(storedUploads);
    setRecentUploads(parsedUploads);
   } catch (error) {
    console.error("Error parsing recent uploads:", error);
    toast({
     title: "Error loading history",
     description: "Could not load your recent uploads.",
     variant: "destructive",
    });
   }
  }
  setIsLoading(false);
 }, [toast]);

 const clearHistory = () => {
  localStorage.removeItem("exifee-recent-uploads");
  setRecentUploads([]);
  toast({
   title: "History cleared",
   description: "Your recent uploads history has been cleared.",
  });
 };

 const removeItem = (id: string) => {
  const updatedUploads = recentUploads.filter((upload) => upload.id !== id);
  setRecentUploads(updatedUploads);
  localStorage.setItem("exifee-recent-uploads", JSON.stringify(updatedUploads));
  toast({
   title: "Item removed",
   description: "The image has been removed from your history.",
  });
 };

 if (isLoading) {
  return (
   <div className="flex items-center justify-center p-8">
    <div className="animate-spin h-6 w-6 border-2 border-zinc-500 rounded-full border-t-transparent"></div>
   </div>
  );
 }

 if (recentUploads.length === 0) {
  return (
   <Card className="bg-zinc-800 border-zinc-700">
    <CardContent className="flex flex-col items-center justify-center p-8 text-center">
     <ImageIcon className="h-12 w-12 text-zinc-600 mb-4" />
     <h3 className="text-lg font-medium mb-2">No Recent Analyses</h3>
     <p className="text-zinc-400 text-sm max-w-md">
      Upload an image to analyze its EXIF data, detect if it&apos;s
      AI-generated, and extract color information.
     </p>
    </CardContent>
   </Card>
  );
 }

 return (
  <>
   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {recentUploads.map((upload) => (
     <div key={upload.id} className="group relative">
      <Link
       href={`/tools/image-analysis/${upload.id}`}
       className="block bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700 hover:border-zinc-500 transition-colors duration-200"
      >
       <div className="aspect-square relative overflow-hidden">
        <Image
         src={upload.url || "/placeholder.svg"}
         alt={upload.filename}
         fill
         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
         className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
         <span className="text-white text-xs font-medium">View Analysis</span>
        </div>
       </div>
       <div className="p-3">
        <p className="font-medium text-sm truncate text-zinc-200">
         {upload.filename}
        </p>
        <div className="flex items-center justify-between mt-1">
         <div className="flex items-center text-xs text-zinc-400">
          <Clock className="h-3 w-3 mr-1" />
          <time dateTime={upload.uploadedAt}>
           {new Date(upload.uploadedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
           })}
          </time>
         </div>
        </div>
       </div>
      </Link>
      <button
       onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        removeItem(upload.id);
       }}
       className="absolute top-2 right-2 bg-black/70 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-900/80"
       aria-label="Remove from history"
      >
       <Trash2 className="h-3.5 w-3.5 text-white" />
      </button>
     </div>
    ))}
   </div>
   {recentUploads.length > 0 && (
    <Button
     variant="ghost"
     size="sm"
     onClick={clearHistory}
     className="mt-4 text-zinc-400 hover:text-zinc-100 flex items-center"
    >
     <Trash2 className="h-4 w-4 mr-1" />
     Clear History
    </Button>
   )}
  </>
 );
}
