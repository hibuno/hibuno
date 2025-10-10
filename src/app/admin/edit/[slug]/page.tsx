"use client";

import {
 AlertCircle,
 ArrowLeft,
 CheckCircle,
 Clock,
 Copy,
 ExternalLink,
 ImagePlus,
 Info,
 Loader2,
 Save,
 Sparkles,
 Upload,
 X,
} from "lucide-react";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { calculateStats } from "@/lib/utils";
import RichTextEditor from "@/components/editor/rich-text-editor";

// Enhanced debounce hook with immediate option
function useDebounce<T>(value: T, delay: number, immediate = false): T {
 const [debouncedValue, setDebouncedValue] = useState<T>(value);

 useEffect(() => {
  if (immediate) {
   setDebouncedValue(value);
   return;
  }

  const handler = setTimeout(() => {
   setDebouncedValue(value);
  }, delay);

  return () => {
   clearTimeout(handler);
  };
 }, [value, delay, immediate]);

 return debouncedValue;
}

// Auto-generate tags from content
function generateTags(content: string, title: string): string[] {
 const text = `${content} ${title}`.toLowerCase();
 const commonTags = [
  "javascript",
  "react",
  "nextjs",
  "typescript",
  "css",
  "html",
  "web-development",
  "programming",
  "tutorial",
  "guide",
  "tips",
  "best-practices",
  "performance",
  "security",
  "database",
  "api",
  "frontend",
  "backend",
  "fullstack",
  "design",
  "ui",
  "ux",
  "mobile",
  "responsive",
  "accessibility",
  "seo",
  "testing",
 ];

 return commonTags.filter((tag) => text.includes(tag)).slice(0, 5);
}

// Enhanced Image Drop Zone with metadata extraction
function ImageDropZone({
 onImageSelect,
 currentImage,
 onRemove,
 label = "Cover Image",
 showMetadata = false,
}: {
 onImageSelect: (file: File, metadata?: any) => void;
 currentImage: string | null;
 onRemove: () => void;
 label?: string;
 showMetadata?: boolean;
}) {
 const [isDragging, setIsDragging] = useState(false);
 const [imageMetadata, setImageMetadata] = useState<any>(null);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const extractImageMetadata = useCallback((file: File) => {
  return new Promise((resolve) => {
   const img = new window.Image();
   const reader = new FileReader();

   reader.onload = (e) => {
    img.onload = () => {
     const metadata = {
      name: file.name,
      size: file.size,
      type: file.type,
      width: img.width,
      height: img.height,
      aspectRatio: (img.width / img.height).toFixed(2),
      lastModified: new Date(file.lastModified).toISOString(),
     };
     setImageMetadata(metadata);
     resolve(metadata);
    };
    img.src = e.target?.result as string;
   };

   reader.readAsDataURL(file);
  });
 }, []);

 const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(true);
 };

 const handleDragLeave = () => {
  setIsDragging(false);
 };

 const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);

  const file = e.dataTransfer.files[0];
  if (file?.type.startsWith("image/")) {
   const metadata = await extractImageMetadata(file);
   onImageSelect(file, metadata);
  }
 };

 const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
   const metadata = await extractImageMetadata(file);
   onImageSelect(file, metadata);
  }
 };

 return (
  <div className="space-y-4">
   <Label className="text-sm font-medium">{label}</Label>

   {currentImage ? (
    <div className="relative group">
     <img
      src={currentImage}
      alt="Cover preview"
      className="w-full h-48 object-cover rounded-lg border"
     />
     <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
      <div className="flex gap-2">
       <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
       >
        <Upload className="w-4 h-4 mr-2" />
        Replace
       </Button>
       <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
        <X className="w-4 h-4 mr-2" />
        Remove
       </Button>
      </div>
     </div>
    </div>
   ) : (
    <div
     onDragOver={handleDragOver}
     onDragLeave={handleDragLeave}
     onDrop={handleDrop}
     className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors
            ${
             isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
            }
          `}
     onClick={() => fileInputRef.current?.click()}
    >
     <ImagePlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
     <p className="text-sm text-gray-600 mb-2">
      Drag and drop an image here, or click to select
     </p>
     <p className="text-xs text-gray-500">
      Supports: JPEG, PNG, WebP, GIF (max 5MB)
     </p>
    </div>
   )}

   {showMetadata && imageMetadata && (
    <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
     <div className="font-medium text-gray-700">Image Information:</div>
     <div className="grid grid-cols-2 gap-2 text-gray-600">
      <span>
       Dimensions: {imageMetadata.width}×{imageMetadata.height}
      </span>
      <span>Size: {(imageMetadata.size / 1024).toFixed(1)} KB</span>
      <span>Type: {imageMetadata.type}</span>
      <span>Ratio: {imageMetadata.aspectRatio}:1</span>
     </div>
    </div>
   )}

   <input
    ref={fileInputRef}
    type="file"
    accept="image/*"
    onChange={handleFileSelect}
    className="hidden"
   />
  </div>
 );
}

// Smart form validation
function useFormValidation(formData: any) {
 const [errors, setErrors] = useState<Record<string, string>>({});
 const [warnings, setWarnings] = useState<Record<string, string>>({});

 useEffect(() => {
  const newErrors: Record<string, string> = {};
  const newWarnings: Record<string, string> = {};

  // Required field validation
  if (!formData.title?.trim()) {
   newErrors.title = "Title is required";
  } else if (formData.title.length < 10) {
   newWarnings.title = "Title might be too short for SEO";
  } else if (formData.title.length > 60) {
   newWarnings.title = "Title might be too long for SEO";
  }

  if (!formData.content?.trim()) {
   newErrors.content = "Content is required";
  } else if (formData.content.length < 300) {
   newWarnings.content =
    "Content might be too short for a good reading experience";
  }

  // SEO validation
  if (formData.excerpt && formData.excerpt.length > 200) {
   newWarnings.excerpt = "Excerpt is too long for SEO meta description";
  }

  if (!formData.excerpt && formData.content) {
   newWarnings.excerpt = "Consider adding an excerpt for better SEO";
  }

  if (!formData.cover_image_url) {
   newWarnings.coverImage = "Cover image recommended for social sharing";
  }

  setErrors(newErrors);
  setWarnings(newWarnings);
 }, [formData]);

 return { errors, warnings, isValid: Object.keys(errors).length === 0 };
}

export type EditPostPageProps = {
 params: Promise<{ slug: string }>;
};

export default function EditPostPage({ params }: EditPostPageProps) {
 const { slug } = use(params);
 const [post, setPost] = useState<any>(null);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [formData, setFormData] = useState<any>({});
 const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
 const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
  null
 );
 const [lastSaved, setLastSaved] = useState<Date | null>(null);

 const debouncedContent = useDebounce(formData.content || "", 1000);
 const { errors, warnings, isValid } = useFormValidation(formData);

 // Auto-calculate stats and metadata - optimized to prevent unnecessary updates
 useEffect(() => {
  if (debouncedContent && debouncedContent !== formData.content) {
   const stats = calculateStats(debouncedContent);
   const currentTitle = formData.title || "";

   setFormData((prev: any) => {
    const newData: any = { ...prev };

    // Only update stats if they've actually changed
    if (JSON.stringify(prev) !== JSON.stringify({ ...prev, ...stats })) {
     Object.assign(newData, stats);
    }

    // Auto-generate tags only if no tags exist
    if (
     (!prev.tags || prev.tags.length === 0) &&
     (debouncedContent || currentTitle)
    ) {
     const autoTags = generateTags(debouncedContent, currentTitle);
     if (autoTags.length > 0) {
      newData.tags = autoTags;
     }
    }

    // Only update if something actually changed
    return Object.keys(newData).some((key) => newData[key] !== prev[key])
     ? newData
     : prev;
   });
  }
 }, [
  debouncedContent,
  formData.content,
  formData.title,
  formData.excerpt,
  formData.tags,
 ]);

 useEffect(() => {
  const fetchPost = async () => {
   try {
    // Add cache-busting timestamp to ensure fresh data
    const timestamp = new Date().getTime();
    const response = await fetch(`/api/admin/posts/${slug}?t=${timestamp}`, {
     headers: {
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
     },
    });

    if (!response.ok) throw new Error("Post not found");
    const postData = await response.json();

    setPost(postData);
    setFormData(postData);
    setCoverImagePreview(postData.cover_image_url || null);
   } catch (error) {
    console.error("Error loading post:", error);
   } finally {
    setLoading(false);
   }
  };

  fetchPost();
 }, [slug]);

 const handleInputChange = useCallback((field: string, value: any) => {
  setFormData((prev: any) => {
   // Only update if value actually changed
   if (prev[field] === value) return prev;

   return {
    ...prev,
    [field]: value,
   };
  });
 }, []);

 const uploadImageToSupabase = async (file: File): Promise<string> => {
  const formDataUpload = new FormData();
  formDataUpload.append("file", file);
  formDataUpload.append("postId", post.id);

  const response = await fetch("/api/admin/upload", {
   method: "POST",
   body: formDataUpload,
  });

  if (!response.ok) throw new Error("Upload failed");
  const data = await response.json();
  return data.url;
 };

 const handleCoverImageSelect = (file: File) => {
  setCoverImageFile(file);
  const reader = new FileReader();
  reader.onload = (e) => {
   setCoverImagePreview(e.target?.result as string);
  };
  reader.readAsDataURL(file);
 };

 const removeCoverImage = () => {
  setCoverImageFile(null);
  setCoverImagePreview(null);
  handleInputChange("cover_image_url", "");
 };

 const handleSave = async () => {
  if (!post || !isValid) return;

  setSaving(true);
  try {
   let cover_image_url = formData.cover_image_url;
   if (coverImageFile) {
    cover_image_url = await uploadImageToSupabase(coverImageFile);
   }

   const updateData = {
    ...formData,
    cover_image_url,
   };

   // Use cache-busting for the save request
   const timestamp = new Date().getTime();
   const response = await fetch(`/api/admin/posts/${slug}?t=${timestamp}`, {
    method: "PUT",
    headers: {
     "Content-Type": "application/json",
     "Cache-Control": "no-cache",
    },
    body: JSON.stringify(updateData),
   });

   if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Save failed: ${response.status} ${errorText}`);
   }

   setLastSaved(new Date());

   // Force refresh the current page to show updated data
   //  window.location.href = `/${slug}`;
  } catch (error) {
   console.error("Save error:", error);
   alert(
    `Save failed: ${error instanceof Error ? error.message : "Unknown error"}`
   );
  } finally {
   setSaving(false);
  }
 };

 if (loading) {
  return (
   <div className="container mx-auto px-4 py-8">
    <div className="animate-pulse space-y-6">
     <div className="h-8 bg-gray-200 rounded w-1/3"></div>
     <div className="h-96 bg-gray-200 rounded"></div>
    </div>
   </div>
  );
 }

 if (!post) {
  return (
   <div className="container mx-auto px-4 py-8 text-center">
    <h1 className="text-2xl font-bold mb-4">Post not found</h1>
   </div>
  );
 }

 return (
  <div className="container mx-auto px-4 py-4 w-full">
   {/* Compact Header */}
   <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 py-3 px-4 bg-white rounded-lg border">
    <div className="flex items-center gap-3">
     <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
     <div className="flex items-center gap-2 mt-1">
      {formData.published ? (
       <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        Published
       </Badge>
      ) : (
       <Badge variant="secondary">
        <Clock className="w-3 h-3 mr-1" />
        Draft
       </Badge>
      )}
     </div>
    </div>

    <div className="flex items-center gap-2">
     <Button
      variant="outline"
      size="sm"
      onClick={() =>
       window.open(`/${slug}?t=${new Date().getTime()}`, "_blank")
      }
     >
      <ExternalLink className="w-4 h-4 mr-2" />
      Preview
     </Button>
    </div>
   </div>

   {/* Validation Alerts */}
   {Object.keys(errors).length > 0 && (
    <Alert className="mb-4 border-red-200 bg-red-50">
     <AlertCircle className="h-4 w-4 text-red-600" />
     <AlertDescription className="text-red-800">
      Please fix: {Object.values(errors).join(", ")}
     </AlertDescription>
    </Alert>
   )}

   {Object.keys(warnings).length > 0 && (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
     <Info className="h-4 w-4 text-yellow-600" />
     <AlertDescription className="text-yellow-800">
      Suggestions: {Object.values(warnings).join(", ")}
     </AlertDescription>
    </Alert>
   )}

   {/* Main Content Grid */}
   {/* Main Content Grid */}
   <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
    {/* Left Column - Main Content */}
    <div className="space-y-4">
     {/* Basic Information */}
     <div className="bg-white border rounded-lg">
      <div className="px-4 py-3 border-b bg-gray-50">
       <h3 className="text-sm font-semibold text-gray-900">
        Basic Information
       </h3>
      </div>
      <div className="p-4 space-y-4">
       <div>
        <Label htmlFor="title" className="text-sm font-medium text-gray-700">
         Title *
        </Label>
        <Input
         id="title"
         value={formData.title || ""}
         onChange={(e) => handleInputChange("title", e.target.value)}
         placeholder="Enter an engaging title..."
         className={`mt-1.5 ${errors.title ? "border-red-500" : ""}`}
        />
       </div>

       <div>
        <Label htmlFor="slug" className="text-sm font-medium text-gray-700">
         URL Slug *
        </Label>
        <Input
         id="slug"
         value={formData.slug || ""}
         onChange={(e) => handleInputChange("slug", e.target.value)}
         placeholder="post-url-slug"
         className="mt-1.5"
        />
       </div>

       <div>
        <Label htmlFor="excerpt" className="text-sm font-medium text-gray-700">
         Excerpt
        </Label>
        <Textarea
         id="excerpt"
         value={formData.excerpt || ""}
         onChange={(e) => handleInputChange("excerpt", e.target.value)}
         placeholder="Brief description for SEO and social sharing..."
         rows={3}
         className="mt-1.5 resize-none"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1.5">
         <span>{warnings.excerpt || "Recommended: 120-200 characters"}</span>
         <span>{(formData.excerpt || "").length}/200</span>
        </div>
       </div>

       <div>
        <Label className="text-sm font-medium text-gray-700 mb-1.5 block">
         Tags
        </Label>
        <div className="flex gap-2">
         <Input
          value={
           Array.isArray(formData.tags)
            ? formData.tags.join(", ")
            : formData.tags || ""
          }
          onChange={(e) =>
           handleInputChange(
            "tags",
            e.target.value
             .split(",")
             .map((tag) => tag.trim())
             .filter(Boolean)
           )
          }
          placeholder="javascript, react, web-development"
          className="flex-1"
         />
         <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
           const autoTags = generateTags(
            formData.content || "",
            formData.title || ""
           );
           handleInputChange("tags", autoTags);
          }}
         >
          <Sparkles className="w-4 h-4 mr-1.5" />
          Generate
         </Button>
        </div>
       </div>
      </div>
     </div>

     {/* Content Editor */}
     <div className="bg-white border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50">
       <h3 className="text-sm font-semibold text-gray-900">Content Editor</h3>
      </div>
      <div className="p-0">
       <RichTextEditor
        content={formData.content || ""}
        onChange={(content) => handleInputChange("content", content)}
       />
      </div>
     </div>
    </div>

    {/* Right Column - Sidebar */}
    <div className="space-y-4">
     {/* Publishing Settings */}
     <div className="bg-white border rounded-lg">
      <div className="px-4 py-3 border-b bg-gray-50">
       <h3 className="text-sm font-semibold text-gray-900">Publishing</h3>
      </div>
      <div className="p-4 space-y-4">
       <div className="flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
         <div
          className={`p-1.5 rounded-full ${
           formData.published ? "bg-green-100" : "bg-gray-100"
          }`}
         >
          {formData.published ? (
           <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
           <Clock className="w-4 h-4 text-gray-600" />
          )}
         </div>
         <div>
          <div className="text-sm font-medium text-gray-900">Published</div>
          {formData.published && formData.published_at && (
           <div className="text-xs text-gray-500 mt-0.5">
            {new Date(formData.published_at).toLocaleDateString()}
           </div>
          )}
         </div>
        </div>
        <Switch
         checked={formData.published || false}
         onCheckedChange={(checked) => handleInputChange("published", checked)}
        />
       </div>

       <div>
        <Label
         htmlFor="published_at"
         className="text-sm font-medium text-gray-700"
        >
         Published Date
        </Label>
        <Input
         id="published_at"
         type="datetime-local"
         value={
          formData.published_at
           ? new Date(formData.published_at).toISOString().slice(0, 16)
           : ""
         }
         onChange={(e) =>
          handleInputChange(
           "published_at",
           e.target.value ? new Date(e.target.value).toISOString() : null
          )
         }
         className="mt-1.5"
        />
       </div>

       <div>
        <Label
         htmlFor="created_at"
         className="text-sm font-medium text-gray-700"
        >
         Created Date
        </Label>
        <Input
         id="created_at"
         type="datetime-local"
         value={
          formData.created_at
           ? new Date(formData.created_at).toISOString().slice(0, 16)
           : ""
         }
         onChange={(e) =>
          handleInputChange(
           "created_at",
           e.target.value
            ? new Date(e.target.value).toISOString()
            : new Date().toISOString()
          )
         }
         className="mt-1.5"
        />
       </div>
      </div>
     </div>

     {/* Cover Image */}
     <div className="bg-white border rounded-lg">
      <div className="px-4 py-3 border-b bg-gray-50">
       <h3 className="text-sm font-semibold text-gray-900">Cover Image</h3>
      </div>
      <div className="p-4">
       <ImageDropZone
        currentImage={coverImagePreview}
        onImageSelect={handleCoverImageSelect}
        onRemove={removeCoverImage}
        showMetadata={false}
        label=""
       />
      </div>
     </div>
    </div>
   </div>

   {/* Action Buttons - Compact */}
   <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-3 p-2.5 bg-white rounded-lg border gap-3">
    <div className="flex items-center gap-3 text-sm flex-wrap">
     <div className="flex items-center gap-1.5">
      {isValid ? (
       <>
        <CheckCircle className="w-4 h-4 text-green-600" />
        <span className="text-green-700 font-medium">Ready</span>
       </>
      ) : (
       <>
        <AlertCircle className="w-4 h-4 text-red-600" />
        <span className="text-red-700 font-medium">Has errors</span>
       </>
      )}
     </div>
     {lastSaved && (
      <span className="text-green-600 text-sm">
       Saved {lastSaved.toLocaleTimeString()}
      </span>
     )}
    </div>

    <div className="flex gap-2">
     <Button
      variant="outline"
      size="sm"
      onClick={() => (window.location.href = `/${slug}`)}
     >
      Cancel
     </Button>
     <Button
      onClick={handleSave}
      disabled={saving || !isValid}
      size="sm"
      className={`min-w-[100px] ${
       formData.published
        ? "bg-green-600 hover:bg-green-700"
        : "bg-blue-600 hover:bg-blue-700"
      }`}
     >
      {saving ? (
       <>
        <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
        Saving...
       </>
      ) : (
       <>
        <Save className="w-3 h-3 mr-1.5" />
        {formData.published ? "Update" : "Save"}
       </>
      )}
     </Button>
    </div>
   </div>
  </div>
 );
}
