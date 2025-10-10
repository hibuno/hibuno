"use client";

import { useState } from "react";
import { Link as LinkIcon, Upload, Loader2 } from "lucide-react";
import { uploadImage } from "./utils";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ImageDialogProps {
 open: boolean;
 onClose: () => void;
 onInsert: (data: {
  src: string;
  alt?: string;
  caption?: string;
  width?: string;
  alignment?: "left" | "center" | "right";
 }) => void;
 initialData?: {
  src?: string;
  alt?: string;
  caption?: string;
  width?: string;
  alignment?: "left" | "center" | "right";
 };
}

export default function ImageDialog({
 open,
 onClose,
 onInsert,
 initialData,
}: ImageDialogProps) {
 const [mode, setMode] = useState<"url" | "upload">("url");
 const [url, setUrl] = useState(initialData?.src || "");
 const [alt, setAlt] = useState(initialData?.alt || "");
 const [caption, setCaption] = useState(initialData?.caption || "");
 const [width, setWidth] = useState(initialData?.width || "100%");
 const [alignment, setAlignment] = useState<"left" | "center" | "right">(
  initialData?.alignment || "center"
 );
 const [uploading, setUploading] = useState(false);
 const [error, setError] = useState("");

 const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith("image/")) {
   setError("Please select an image file");
   return;
  }

  if (file.size > 5 * 1024 * 1024) {
   setError("File size must be less than 5MB");
   return;
  }

  setUploading(true);
  setError("");

  try {
   const uploadedUrl = await uploadImage(file);
   setUrl(uploadedUrl);
   setMode("url");
  } catch (err) {
   setError("Failed to upload image. Please try again.");
  } finally {
   setUploading(false);
  }
 };

 const handleInsert = () => {
  if (!url) {
   setError("Please provide an image URL or upload a file");
   return;
  }

  onInsert({
   src: url,
   ...(alt && { alt }),
   ...(caption && { caption }),
   width: width || "100%",
   alignment,
  });
  onClose();
 };

 const handleClose = () => {
  setError("");
  setUrl(initialData?.src || "");
  setAlt(initialData?.alt || "");
  setCaption(initialData?.caption || "");
  setWidth(initialData?.width || "100%");
  setAlignment(initialData?.alignment || "center");
  onClose();
 };

 return (
  <Dialog open={open} onOpenChange={handleClose}>
   <DialogContent className="sm:max-w-[500px]">
    <DialogHeader>
     <DialogTitle>{initialData ? "Edit Image" : "Insert Image"}</DialogTitle>
     <DialogDescription>
      {initialData
       ? "Edit the image properties below."
       : "Add an image by URL or upload from your device."}
     </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
     <div className="flex gap-2">
      <Button
       variant={mode === "url" ? "default" : "outline"}
       onClick={() => setMode("url")}
       className="flex-1"
      >
       <LinkIcon size={16} className="mr-2" />
       URL
      </Button>
      <Button
       variant={mode === "upload" ? "default" : "outline"}
       onClick={() => setMode("upload")}
       className="flex-1"
      >
       <Upload size={16} className="mr-2" />
       Upload
      </Button>
     </div>

     {error && (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
       {error}
      </div>
     )}

     {mode === "url" ? (
      <div className="space-y-2">
       <Label htmlFor="image-url">Image URL</Label>
       <Input
        id="image-url"
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/image.jpg"
       />
      </div>
     ) : (
      <div className="space-y-2">
       <Label htmlFor="file-upload">Upload Image</Label>
       <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
        <input
         id="file-upload"
         type="file"
         accept="image/*"
         onChange={handleFileSelect}
         disabled={uploading}
         className="hidden"
        />
        <label
         htmlFor="file-upload"
         className="cursor-pointer flex flex-col items-center"
        >
         {uploading ? (
          <>
           <Loader2 size={32} className="text-blue-600 animate-spin mb-2" />
           <span className="text-sm text-gray-600">Uploading...</span>
          </>
         ) : (
          <>
           <Upload size={32} className="text-gray-400 mb-2" />
           <span className="text-sm text-gray-600">
            Click to upload or drag and drop
           </span>
           <span className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF up to 5MB
           </span>
          </>
         )}
        </label>
       </div>
      </div>
     )}

     <div className="space-y-2">
      <Label htmlFor="alt-text">Alt Text (optional)</Label>
      <Input
       id="alt-text"
       type="text"
       value={alt}
       onChange={(e) => setAlt(e.target.value)}
       placeholder="Describe the image"
      />
     </div>

     <div className="space-y-2">
      <Label htmlFor="caption">Caption (optional)</Label>
      <Input
       id="caption"
       type="text"
       value={caption}
       onChange={(e) => setCaption(e.target.value)}
       placeholder="Add a caption"
      />
     </div>

     <div className="space-y-2">
      <Label htmlFor="width">Width</Label>
      <select
       id="width"
       value={width}
       onChange={(e) => setWidth(e.target.value)}
       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
       <option value="100%">Full Width</option>
       <option value="75%">75%</option>
       <option value="50%">50%</option>
       <option value="25%">25%</option>
      </select>
     </div>

     <div className="space-y-2">
      <Label>Alignment</Label>
      <div className="flex gap-2">
       <Button
        variant={alignment === "left" ? "default" : "outline"}
        onClick={() => setAlignment("left")}
        className="flex-1"
       >
        Left
       </Button>
       <Button
        variant={alignment === "center" ? "default" : "outline"}
        onClick={() => setAlignment("center")}
        className="flex-1"
       >
        Center
       </Button>
       <Button
        variant={alignment === "right" ? "default" : "outline"}
        onClick={() => setAlignment("right")}
        className="flex-1"
       >
        Right
       </Button>
      </div>
     </div>
    </div>

    <DialogFooter>
     <Button variant="outline" onClick={handleClose}>
      Cancel
     </Button>
     <Button onClick={handleInsert} disabled={!url || uploading}>
      {initialData ? "Update Image" : "Insert Image"}
     </Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 );
}
