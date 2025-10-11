"use client";

import {
 Crop,
 Link as LinkIcon,
 Loader2,
 // Move,
 RotateCw,
 Trash2,
 Upload,
 ZoomIn,
 ZoomOut,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "../ui/button";
import {
 Dialog,
 DialogContent,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { uploadImage } from "./utils";

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
 onDelete?: () => void | undefined;
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
 onDelete,
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
 const [showAdvancedEditor, setShowAdvancedEditor] = useState(false);
 const [rotation, setRotation] = useState(0);
 const [scale, setScale] = useState(1);
 const [cropArea, setCropArea] = useState({
  x: 0,
  y: 0,
  width: 100,
  height: 100,
 });
 const [isDragging, setIsDragging] = useState(false);
 const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const imageRef = useRef<HTMLImageElement>(null);

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

 const handleInsert = async () => {
  if (!url) {
   setError("Please provide an image URL or upload a file");
   return;
  }

  let finalUrl = url;

  // Apply image edits if advanced editor was used
  if (
   showAdvancedEditor &&
   (rotation !== 0 || scale !== 1 || cropArea.x !== 0 || cropArea.y !== 0)
  ) {
   setUploading(true);
   try {
    finalUrl = await applyImageEdits();
    if (finalUrl === url) {
     console.warn("Image edits could not be applied, using original image");
    }
   } catch (err) {
    console.error("Error applying image edits:", err);
    // Don't set error here, just use original image
   }
   setUploading(false);
  }

  onInsert({
   src: finalUrl,
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
  setShowAdvancedEditor(false);
  setRotation(0);
  setScale(1);
  setCropArea({ x: 0, y: 0, width: 100, height: 100 });
  onClose();
 };

 const handleRotate = () => {
  setRotation((prev) => (prev + 90) % 360);
 };

 const handleScaleChange = (newScale: number) => {
  setScale(Math.max(0.1, Math.min(3, newScale)));
 };

 const handleImageLoad = () => {
  if (imageRef.current) {
   const img = imageRef.current;
   setCropArea({
    x: 0,
    y: 0,
    width: img.naturalWidth,
    height: img.naturalHeight,
   });
  }
 };

 const handleMouseDown = (e: React.MouseEvent) => {
  setIsDragging(true);
  setDragStart({ x: e.clientX, y: e.clientY });
 };

 const handleMouseMove = (e: React.MouseEvent) => {
  if (!isDragging) return;

  const deltaX = e.clientX - dragStart.x;
  const deltaY = e.clientY - dragStart.y;

  setCropArea((prev) => ({
   ...prev,
   x: Math.max(0, prev.x + deltaX),
   y: Math.max(0, prev.y + deltaY),
  }));

  setDragStart({ x: e.clientX, y: e.clientY });
 };

 const handleMouseUp = () => {
  setIsDragging(false);
 };

 const applyImageEdits = async () => {
  if (!canvasRef.current || !imageRef.current) {
   console.warn("Canvas or image reference not available");
   return url;
  }

  const canvas = canvasRef.current;
  const ctx = canvas.getContext("2d");
  const img = imageRef.current;

  if (!ctx) {
   console.warn("Canvas context not available");
   return url;
  }

  if (!img.complete || img.naturalWidth === 0) {
   console.warn("Image not loaded or invalid");
   return url;
  }

  try {
   // Set canvas size based on actual image dimensions
   const actualWidth = img.naturalWidth * scale;
   const actualHeight = img.naturalHeight * scale;

   canvas.width = actualWidth;
   canvas.height = actualHeight;

   // Apply transformations
   ctx.save();
   ctx.translate(canvas.width / 2, canvas.height / 2);
   ctx.rotate((rotation * Math.PI) / 180);
   ctx.scale(scale, scale);

   // Draw the image with proper cropping
   ctx.drawImage(
    img,
    -actualWidth / 2,
    -actualHeight / 2,
    actualWidth,
    actualHeight
   );

   ctx.restore();

   // Convert canvas to blob and upload
   return new Promise<string>((resolve) => {
    canvas.toBlob(async (blob) => {
     if (blob && blob.size > 0) {
      try {
       const file = new File([blob], "edited-image.png", {
        type: "image/png",
       });
       const uploadedUrl = await uploadImage(file);
       resolve(uploadedUrl);
      } catch (err) {
       console.error("Failed to upload edited image:", err);
       resolve(url); // Fallback to original URL
      }
     } else {
      console.warn("Failed to create blob from canvas");
      resolve(url); // Fallback to original URL
     }
    }, "image/png");
   });
  } catch (err) {
   console.error("Error applying image edits:", err);
   return url; // Fallback to original URL
  }
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

     {url && (
      <div className="space-y-4">
       <div className="flex items-center justify-between">
        <Label>Image Preview</Label>
        <Button
         variant="outline"
         size="sm"
         onClick={() => setShowAdvancedEditor(!showAdvancedEditor)}
        >
         <Crop size={16} className="mr-2" />
         {showAdvancedEditor ? "Basic Editor" : "Advanced Editor"}
        </Button>
       </div>

       {showAdvancedEditor ? (
        <div className="space-y-4 border rounded-lg p-4 bg-gray-50">
         <div className="relative">
          <img
           ref={imageRef}
           src={url}
           alt="Preview"
           onLoad={handleImageLoad}
           className="max-w-full max-h-48 mx-auto rounded"
           style={{
            transform: `rotate(${rotation}deg) scale(${scale})`,
            cursor: isDragging ? "grabbing" : "grab",
           }}
           onMouseDown={handleMouseDown}
           onMouseMove={handleMouseMove}
           onMouseUp={handleMouseUp}
           draggable={false}
          />
          <canvas ref={canvasRef} className="hidden" />
         </div>

         <div className="flex gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={handleRotate}>
           <RotateCw size={16} className="mr-1" />
           Rotate
          </Button>
          <Button
           variant="outline"
           size="sm"
           onClick={() => handleScaleChange(scale - 0.1)}
          >
           <ZoomOut size={16} className="mr-1" />
           Zoom Out
          </Button>
          <Button
           variant="outline"
           size="sm"
           onClick={() => handleScaleChange(scale + 0.1)}
          >
           <ZoomIn size={16} className="mr-1" />
           Zoom In
          </Button>
         </div>

         <div className="space-y-2">
          <Label>Scale: {scale.toFixed(1)}x</Label>
          <input
           type="range"
           min="0.1"
           max="3"
           step="0.1"
           value={scale}
           onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
           className="w-full"
          />
         </div>
        </div>
       ) : (
        <img
         src={url}
         alt="Preview"
         className="max-w-full max-h-48 mx-auto rounded border"
        />
       )}
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

    <DialogFooter className="flex gap-2">
     {initialData && onDelete && (
      <Button variant="destructive" onClick={onDelete}>
       <Trash2 size={16} className="mr-2" />
       Delete Image
      </Button>
     )}
     <div className="flex gap-2 ml-auto">
      <Button variant="outline" onClick={handleClose}>
       Cancel
      </Button>
      <Button onClick={handleInsert} disabled={!url || uploading}>
       {initialData ? "Update Image" : "Insert Image"}
      </Button>
     </div>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 );
}
