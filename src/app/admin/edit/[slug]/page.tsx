"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
 ArrowLeft,
 Save,
 X,
 Upload,
 ImagePlus,
 Eye,
 Code as CodeIcon,
 Loader2,
 Bold,
 Italic,
 Link,
 List,
 ListOrdered,
 Quote,
 Code,
 Heading1,
 Heading2,
 Heading3,
 Undo,
 Redo,
 FileText,
 Image,
 Tag,
 User,
 Settings,
 CheckCircle,
 AlertCircle,
 Info,
 Sparkles,
 Copy,
 ExternalLink,
 Clock,
} from "lucide-react";

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

// Simple Markdown to HTML converter
function markdownToHtml(markdown: string): string {
 let html = markdown;

 // Code blocks
 html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, "<pre><code>$2</code></pre>");

 // Headers
 html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
 html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
 html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

 // Bold
 html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

 // Italic
 html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

 // Images
 html = html.replace(
  /!\[([^\]]*)\]\(([^)]+)\)/g,
  '<img src="$2" alt="$1" class="max-w-full h-auto rounded-lg my-4" />'
 );

 // Links
 html = html.replace(
  /\[([^\]]+)\]\(([^)]+)\)/g,
  '<a href="$2" class="text-blue-600 underline hover:text-blue-800">$1</a>'
 );

 // Inline code
 html = html.replace(
  /`([^`]+)`/g,
  '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>'
 );

 // Line breaks
 html = html.replace(/\n\n/g, "</p><p>");
 html = "<p>" + html + "</p>";

 // Lists
 html = html.replace(/<p>- (.+?)<\/p>/g, "<ul><li>$1</li></ul>");
 html = html.replace(/<\/ul>\s*<ul>/g, "");

 return html;
}

// Enhanced stats calculation with more metrics
function calculateStats(content: string) {
 const plainText = content
  .replace(/#{1,6}\s/g, "")
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/\*([^*]+)\*/g, "$1")
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .replace(/```[\s\S]*?```/g, "")
  .replace(/`([^`]+)`/g, "$1")
  .replace(/<[^>]*>/g, "")
  .replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

 const words = plainText.trim().split(/\s+/).filter(Boolean);
 const wordCount = words.length;
 const readingTime = Math.ceil(wordCount / 200);
 const characters = plainText.length;
 const charactersNoSpaces = plainText.replace(/\s/g, "").length;

 // Count headers, images, links
 const headers = (content.match(/^#{1,6}\s/gm) || []).length;
 const images = (content.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length;
 const links = (content.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
 const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;

 return {
  wordCount,
  readingTime,
  characters,
  charactersNoSpaces,
  headers,
  images,
  links,
  codeBlocks,
 };
}

// Auto-generate excerpt from content
function generateExcerpt(content: string, maxLength = 160): string {
 const plainText = content
  .replace(/#{1,6}\s/g, "")
  .replace(/\*\*([^*]+)\*\*/g, "$1")
  .replace(/\*([^*]+)\*/g, "$1")
  .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
  .replace(/```[\s\S]*?```/g, "")
  .replace(/`([^`]+)`/g, "$1")
  .replace(/<[^>]*>/g, "")
  .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
  .trim();

 if (plainText.length <= maxLength) return plainText;

 const truncated = plainText.substring(0, maxLength);
 const lastSpace = truncated.lastIndexOf(" ");
 return lastSpace > 0
  ? truncated.substring(0, lastSpace) + "..."
  : truncated + "...";
}

// Auto-generate tags from content
function generateTags(content: string, title: string): string[] {
 const text = (content + " " + title).toLowerCase();
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
  if (file && file.type.startsWith("image/")) {
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

// Enhanced Markdown Editor with rich toolbar and live preview
function MarkdownEditor({
 content,
 onChange,
 onImageUpload,
}: {
 content: string;
 onChange: (content: string) => void;
 onImageUpload: (file: File) => Promise<string>;
}) {
 const [showPreview, setShowPreview] = useState(false);
 const [isDragging, setIsDragging] = useState(false);
 const [uploading, setUploading] = useState(false);
 const [history, setHistory] = useState<string[]>([content]);
 const [historyIndex, setHistoryIndex] = useState(0);
 const textareaRef = useRef<HTMLTextAreaElement>(null);

 // Enhanced toolbar actions
 const insertMarkdown = useCallback(
  (before: string, after: string = "", placeholder = "") => {
   const textarea = textareaRef.current;
   if (!textarea) return;

   const start = textarea.selectionStart;
   const end = textarea.selectionEnd;
   const selectedText = content.substring(start, end);
   const insertText = selectedText || placeholder;
   const newText = before + insertText + after;

   const newContent =
    content.substring(0, start) + newText + content.substring(end);

   // Add to history
   const newHistory = history.slice(0, historyIndex + 1);
   newHistory.push(newContent);
   setHistory(newHistory);
   setHistoryIndex(newHistory.length - 1);

   onChange(newContent);

   setTimeout(() => {
    textarea.focus();
    const newStart = start + before.length;
    const newEnd = newStart + insertText.length;
    textarea.setSelectionRange(newStart, newEnd);
   }, 0);
  },
  [content, history, historyIndex, onChange]
 );

 const undo = useCallback(() => {
  if (historyIndex > 0) {
   const newIndex = historyIndex - 1;
   setHistoryIndex(newIndex);
   const historyItem = history[newIndex];
   if (historyItem !== undefined) {
    onChange(historyItem);
   }
  }
 }, [history, historyIndex, onChange]);

 const redo = useCallback(() => {
  if (historyIndex < history.length - 1) {
   const newIndex = historyIndex + 1;
   setHistoryIndex(newIndex);
   const historyItem = history[newIndex];
   if (historyItem !== undefined) {
    onChange(historyItem);
   }
  }
 }, [history, historyIndex, onChange]);

 // Keyboard shortcuts
 useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
   if (e.metaKey || e.ctrlKey) {
    switch (e.key) {
     case "b":
      e.preventDefault();
      insertMarkdown("**", "**", "bold text");
      break;
     case "i":
      e.preventDefault();
      insertMarkdown("*", "*", "italic text");
      break;
     case "k":
      e.preventDefault();
      insertMarkdown("[", "](url)", "link text");
      break;
     case "z":
      e.preventDefault();
      if (e.shiftKey) {
       redo();
      } else {
       undo();
      }
      break;
    }
   }
  };

  document.addEventListener("keydown", handleKeyDown);
  return () => document.removeEventListener("keydown", handleKeyDown);
 }, [insertMarkdown, undo, redo]);

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
  if (file && file.type.startsWith("image/")) {
   setUploading(true);
   try {
    const imageUrl = await onImageUpload(file);
    const textarea = textareaRef.current;
    if (textarea) {
     const start = textarea.selectionStart;
     const markdownImage = `\n![${file.name.replace(
      /\.[^/.]+$/,
      ""
     )}](${imageUrl})\n`;
     const newContent =
      content.substring(0, start) + markdownImage + content.substring(start);
     onChange(newContent);

     setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
       start + markdownImage.length,
       start + markdownImage.length
      );
     }, 0);
    }
   } catch (error) {
    console.error("Upload failed:", error);
   } finally {
    setUploading(false);
   }
  }
 };

 return (
  <div className="space-y-4">
   {/* Enhanced Toolbar */}
   <div className="flex items-center gap-2 p-3 border rounded-lg bg-gray-50 flex-wrap">
    {/* History Controls */}
    <div className="flex gap-1">
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={undo}
      disabled={historyIndex <= 0}
      title="Undo (Ctrl+Z)"
     >
      <Undo className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={redo}
      disabled={historyIndex >= history.length - 1}
      title="Redo (Ctrl+Shift+Z)"
     >
      <Redo className="w-4 h-4" />
     </Button>
    </div>

    <Separator orientation="vertical" className="h-6" />

    {/* Text Formatting */}
    <div className="flex gap-1">
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("**", "**", "bold text")}
      title="Bold (Ctrl+B)"
     >
      <Bold className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("*", "*", "italic text")}
      title="Italic (Ctrl+I)"
     >
      <Italic className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("`", "`", "code")}
      title="Inline Code"
     >
      <Code className="w-4 h-4" />
     </Button>
    </div>

    <Separator orientation="vertical" className="h-6" />

    {/* Headers */}
    <div className="flex gap-1">
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("# ", "", "Heading 1")}
      title="Heading 1"
     >
      <Heading1 className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("## ", "", "Heading 2")}
      title="Heading 2"
     >
      <Heading2 className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("### ", "", "Heading 3")}
      title="Heading 3"
     >
      <Heading3 className="w-4 h-4" />
     </Button>
    </div>

    <Separator orientation="vertical" className="h-6" />

    {/* Lists and Quotes */}
    <div className="flex gap-1">
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("- ", "", "List item")}
      title="Bullet List"
     >
      <List className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("1. ", "", "Numbered item")}
      title="Numbered List"
     >
      <ListOrdered className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("> ", "", "Quote")}
      title="Quote"
     >
      <Quote className="w-4 h-4" />
     </Button>
    </div>

    <Separator orientation="vertical" className="h-6" />

    {/* Links and Media */}
    <div className="flex gap-1">
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("[", "](url)", "link text")}
      title="Link (Ctrl+K)"
     >
      <Link className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("![", "](url)", "alt text")}
      title="Image"
     >
      <ImagePlus className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("```\n", "\n```", "code block")}
      title="Code Block"
     >
      <CodeIcon className="w-4 h-4" />
     </Button>
    </div>

    <div className="flex-1" />

    {/* Preview Toggle */}
    <Button
     type="button"
     variant={showPreview ? "default" : "outline"}
     size="sm"
     onClick={() => setShowPreview(!showPreview)}
     title="Toggle Preview"
    >
     {showPreview ? (
      <CodeIcon className="w-4 h-4 mr-2" />
     ) : (
      <Eye className="w-4 h-4 mr-2" />
     )}
     {showPreview ? "Edit" : "Preview"}
    </Button>
   </div>

   {/* Editor/Preview Area */}
   <div className="relative">
    {showPreview ? (
     <div
      className="min-h-[400px] p-6 border rounded-lg prose prose-sm max-w-none bg-white"
      dangerouslySetInnerHTML={{ __html: markdownToHtml(content) }}
     />
    ) : (
     <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative ${isDragging ? "ring-2 ring-blue-500" : ""}`}
     >
      <Textarea
       ref={textareaRef}
       value={content}
       onChange={(e) => {
        const newContent = e.target.value;
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newContent);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        onChange(newContent);
       }}
       className="min-h-[500px] font-mono text-sm resize-none"
       placeholder="Write your content in Markdown...

# Your Amazing Title

Start writing your content here. You can use:
- **Bold text** and *italic text*
- [Links](https://example.com)
- ![Images](image-url)
- `inline code` and code blocks
- Lists and quotes

Drag and drop images directly into this editor!"
      />
      {isDragging && (
       <div className="absolute inset-0 bg-blue-50 bg-opacity-90 flex items-center justify-center pointer-events-none rounded-lg">
        <div className="text-center">
         <Upload className="w-12 h-12 mx-auto mb-2 text-blue-500" />
         <p className="text-blue-700 font-medium">
          Drop image to upload and insert
         </p>
        </div>
       </div>
      )}
      {uploading && (
       <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center rounded-lg">
        <div className="text-center">
         <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-500 animate-spin" />
         <p className="text-gray-700">Uploading image...</p>
        </div>
       </div>
      )}
     </div>
    )}
   </div>

   <div className="flex items-center justify-between text-xs text-gray-500">
    <span>
     💡 Tip: Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for links
    </span>
    <span>
     Lines: {content.split("\n").length} | Characters: {content.length}
    </span>
   </div>
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

  if (!formData.authorName?.trim()) {
   newErrors.authorName = "Author name is required";
  }

  // SEO validation
  if (formData.excerpt && formData.excerpt.length > 160) {
   newWarnings.excerpt = "Excerpt is too long for SEO meta description";
  }

  if (!formData.excerpt && formData.content) {
   newWarnings.excerpt = "Consider adding an excerpt for better SEO";
  }

  if (!formData.coverImageUrl) {
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
 const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
 const [lastSaved, setLastSaved] = useState<Date | null>(null);

 const debouncedContent = useDebounce(formData.content || "", 1000);
 const { errors, warnings, isValid } = useFormValidation(formData);

 // Auto-calculate stats and metadata
 useEffect(() => {
  if (debouncedContent) {
   const stats = calculateStats(debouncedContent);
   const autoExcerpt = !formData.excerpt
    ? generateExcerpt(debouncedContent || "")
    : formData.excerpt;
   const autoTags =
    formData.tags?.length === 0
     ? generateTags(debouncedContent || "", formData.title || "")
     : formData.tags;

   setFormData((prev: any) => ({
    ...prev,
    ...stats,
    ...(autoExcerpt !== prev.excerpt && !prev.manualExcerpt
     ? { excerpt: autoExcerpt }
     : {}),
    ...(autoTags.length > 0 && (!prev.tags || prev.tags.length === 0)
     ? { tags: autoTags }
     : {}),
   }));
  }
 }, [debouncedContent, formData.title]);

 // Auto-save functionality
 useEffect(() => {
  if (autoSaveEnabled && post && isValid && debouncedContent) {
   const autoSave = async () => {
    try {
     const updateData = {
      ...formData,
      updated_at: new Date().toISOString(),
     };

     await fetch(`/api/admin/posts/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updateData),
     });

     setLastSaved(new Date());
    } catch (error) {
     console.error("Auto-save failed:", error);
    }
   };

   const timeoutId = setTimeout(autoSave, 2000);
   return () => clearTimeout(timeoutId);
  }
 }, [autoSaveEnabled, post, isValid, debouncedContent, formData, slug]);

 useEffect(() => {
  const fetchPost = async () => {
   try {
    const response = await fetch(`/api/admin/posts/${slug}`);
    if (!response.ok) throw new Error("Post not found");
    const postData = await response.json();
    setPost(postData);
    setFormData(postData);
    setCoverImagePreview(postData.coverImageUrl || null);
   } catch (error) {
    console.error("Error:", error);
   } finally {
    setLoading(false);
   }
  };

  fetchPost();
 }, [slug]);

 const handleInputChange = (field: string, value: any) => {
  setFormData((prev: any) => ({
   ...prev,
   [field]: value,
   ...(field === "excerpt" ? { manualExcerpt: true } : {}),
  }));
 };

 const uploadImageToSupabase = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("postId", post.id);

  const response = await fetch("/api/admin/upload", {
   method: "POST",
   body: formData,
  });

  if (!response.ok) throw new Error("Upload failed");
  const data = await response.json();
  return data.url;
 };

 const handleCoverImageSelect = (file: File, metadata?: any) => {
  setCoverImageFile(file);
  const reader = new FileReader();
  reader.onload = (e) => {
   setCoverImagePreview(e.target?.result as string);
  };
  reader.readAsDataURL(file);

  // Auto-fill alt text if not provided
  if (metadata && !formData.coverImageAlt) {
   const autoAlt = `${formData.title || "Blog post"} cover image`;
   handleInputChange("coverImageAlt", autoAlt);
  }
 };

 const removeCoverImage = () => {
  setCoverImageFile(null);
  setCoverImagePreview(null);
  handleInputChange("coverImageUrl", "");
  handleInputChange("coverImageAlt", "");
 };

 const handleSave = async () => {
  if (!post || !isValid) return;

  setSaving(true);
  try {
   let coverImageUrl = formData.coverImageUrl;
   if (coverImageFile) {
    coverImageUrl = await uploadImageToSupabase(coverImageFile);
   }

   const updateData = {
    ...formData,
    coverImageUrl,
    updated_at: new Date().toISOString(),
   };

   const response = await fetch(`/api/admin/posts/${slug}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
   });

   if (!response.ok) throw new Error("Save failed");

   setLastSaved(new Date());
   window.location.href = `/${slug}`;
  } catch (error) {
   console.error("Error:", error);
  } finally {
   setSaving(false);
  }
 };

 const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
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
  <div className="container mx-auto px-4 py-8 max-w-6xl">
   {/* Header */}
   <div className="flex items-center gap-4 mb-8">
    <Button
     variant="outline"
     size="sm"
     onClick={() => (window.location.href = `/${slug}`)}
    >
     <ArrowLeft className="w-4 h-4 mr-2" />
     Back to Post
    </Button>
    <div className="flex-1">
     <h1 className="text-3xl font-bold">Edit Post</h1>
     <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
      <span className="flex items-center gap-1">
       <FileText className="w-4 h-4" />
       {formData.wordCount || 0} words
      </span>
      <span className="flex items-center gap-1">
       <Clock className="w-4 h-4" />
       {formData.readingTime || 0} min read
      </span>
      {lastSaved && (
       <span className="flex items-center gap-1 text-green-600">
        <CheckCircle className="w-4 h-4" />
        Saved {lastSaved.toLocaleTimeString()}
       </span>
      )}
     </div>
    </div>
    <div className="flex items-center gap-2">
     <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(`${window.location.origin}/${slug}`)}
     >
      <Copy className="w-4 h-4 mr-2" />
      Copy URL
     </Button>
     <Button
      variant="outline"
      size="sm"
      onClick={() => window.open(`/${slug}`, "_blank")}
     >
      <ExternalLink className="w-4 h-4 mr-2" />
      Preview
     </Button>
    </div>
   </div>

   {/* Validation Alerts */}
   {Object.keys(errors).length > 0 && (
    <Alert className="mb-6 border-red-200 bg-red-50">
     <AlertCircle className="h-4 w-4 text-red-600" />
     <AlertDescription className="text-red-800">
      Please fix the following errors: {Object.values(errors).join(", ")}
     </AlertDescription>
    </Alert>
   )}

   {Object.keys(warnings).length > 0 && (
    <Alert className="mb-6 border-yellow-200 bg-yellow-50">
     <Info className="h-4 w-4 text-yellow-600" />
     <AlertDescription className="text-yellow-800">
      Suggestions: {Object.values(warnings).join(", ")}
     </AlertDescription>
    </Alert>
   )}

   <Tabs defaultValue="content" className="space-y-6">
    <TabsList className="grid w-full grid-cols-4">
     <TabsTrigger value="content" className="flex items-center gap-2">
      <FileText className="w-4 h-4" />
      Content
     </TabsTrigger>
     <TabsTrigger value="metadata" className="flex items-center gap-2">
      <Tag className="w-4 h-4" />
      Metadata
     </TabsTrigger>
     <TabsTrigger value="media" className="flex items-center gap-2">
      <Image className="w-4 h-4" />
      Media
     </TabsTrigger>
     <TabsTrigger value="settings" className="flex items-center gap-2">
      <Settings className="w-4 h-4" />
      Settings
     </TabsTrigger>
    </TabsList>

    <TabsContent value="content" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        Basic Information
       </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div>
        <Label htmlFor="title" className="flex items-center gap-2">
         Title *
         {errors.title && (
          <Badge variant="destructive" className="text-xs">
           Error
          </Badge>
         )}
         {warnings.title && (
          <Badge variant="secondary" className="text-xs">
           Warning
          </Badge>
         )}
        </Label>
        <Input
         id="title"
         value={formData.title || ""}
         onChange={(e) => handleInputChange("title", e.target.value)}
         placeholder="Enter an engaging title..."
         className={`mt-1 ${
          errors.title
           ? "border-red-500"
           : warnings.title
           ? "border-yellow-500"
           : ""
         }`}
        />
        {(errors.title || warnings.title) && (
         <p
          className={`text-xs mt-1 ${
           errors.title ? "text-red-600" : "text-yellow-600"
          }`}
         >
          {errors.title || warnings.title}
         </p>
        )}
       </div>

       <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
         id="subtitle"
         value={formData.subtitle || ""}
         onChange={(e) => handleInputChange("subtitle", e.target.value)}
         placeholder="Optional subtitle for more context..."
         className="mt-1"
        />
       </div>

       <div>
        <Label htmlFor="excerpt" className="flex items-center gap-2">
         Excerpt
         {warnings.excerpt && (
          <Badge variant="secondary" className="text-xs">
           SEO
          </Badge>
         )}
         <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
           const autoExcerpt = generateExcerpt(formData.content || "");
           handleInputChange("excerpt", autoExcerpt);
          }}
          className="ml-auto text-xs"
         >
          <Sparkles className="w-3 h-3 mr-1" />
          Auto-generate
         </Button>
        </Label>
        <Textarea
         id="excerpt"
         value={formData.excerpt || ""}
         onChange={(e) => handleInputChange("excerpt", e.target.value)}
         placeholder="Brief description for SEO and social sharing..."
         rows={3}
         className={`mt-1 ${warnings.excerpt ? "border-yellow-500" : ""}`}
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
         <span>{warnings.excerpt || "Recommended: 120-160 characters"}</span>
         <span>{(formData.excerpt || "").length}/160</span>
        </div>
       </div>
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle>Content Editor</CardTitle>
      </CardHeader>
      <CardContent>
       <MarkdownEditor
        content={formData.content || ""}
        onChange={(content) => handleInputChange("content", content)}
        onImageUpload={uploadImageToSupabase}
       />
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="metadata" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <User className="w-5 h-5" />
        Author Information
       </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div>
        <Label className="flex items-center gap-2">
         Author Name *
         {errors.authorName && (
          <Badge variant="destructive" className="text-xs">
           Required
          </Badge>
         )}
        </Label>
        <Input
         value={formData.authorName || ""}
         onChange={(e) => handleInputChange("authorName", e.target.value)}
         placeholder="Author's full name"
         className={`mt-1 ${errors.authorName ? "border-red-500" : ""}`}
        />
       </div>

       <div>
        <Label>Author Avatar URL</Label>
        <Input
         value={formData.authorAvatarUrl || ""}
         onChange={(e) => handleInputChange("authorAvatarUrl", e.target.value)}
         placeholder="https://example.com/avatar.jpg"
         className="mt-1"
        />
       </div>

       <div>
        <Label>Author Bio</Label>
        <Textarea
         value={formData.authorBio || ""}
         onChange={(e) => handleInputChange("authorBio", e.target.value)}
         placeholder="Brief author biography..."
         rows={3}
         className="mt-1"
        />
       </div>
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Tag className="w-5 h-5" />
        Tags & Category
       </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div>
        <Label className="flex items-center gap-2">
         Tags (comma-separated)
         <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
           const autoTags = generateTags(
            formData.content || "",
            formData.title || ""
           );
           handleInputChange("tags", autoTags);
          }}
          className="ml-auto text-xs"
         >
          <Sparkles className="w-3 h-3 mr-1" />
          Suggest Tags
         </Button>
        </Label>
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
         placeholder="javascript, react, web-development, tutorial"
         className="mt-1"
        />
        <div className="flex flex-wrap gap-1 mt-2">
         {(Array.isArray(formData.tags) ? formData.tags : []).map(
          (tag: string, index: number) => (
           <Badge key={index} variant="secondary" className="text-xs">
            {tag}
           </Badge>
          )
         )}
        </div>
       </div>

       <div>
        <Label>Category</Label>
        <Input
         value={formData.category || ""}
         onChange={(e) => handleInputChange("category", e.target.value)}
         placeholder="Technology, Tutorial, Guide, etc."
         className="mt-1"
        />
       </div>
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="media" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Image className="w-5 h-5" />
        Cover Image
        {warnings.coverImage && (
         <Badge variant="secondary" className="text-xs">
          Recommended
         </Badge>
        )}
       </CardTitle>
      </CardHeader>
      <CardContent>
       <ImageDropZone
        currentImage={coverImagePreview}
        onImageSelect={handleCoverImageSelect}
        onRemove={removeCoverImage}
        showMetadata={true}
       />

       <div className="mt-4">
        <Label htmlFor="coverImageAlt">Alt Text</Label>
        <Input
         id="coverImageAlt"
         value={formData.coverImageAlt || ""}
         onChange={(e) => handleInputChange("coverImageAlt", e.target.value)}
         placeholder="Describe the image for accessibility..."
         className="mt-1"
        />
        <p className="text-xs text-gray-500 mt-1">
         Important for accessibility and SEO
        </p>
       </div>
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="settings" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Publishing Settings
       </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div className="flex items-center space-x-2">
        <Switch
         checked={formData.published || false}
         onCheckedChange={(checked) => handleInputChange("published", checked)}
        />
        <Label>Published</Label>
       </div>

       <div className="flex items-center space-x-2">
        <Switch
         checked={formData.featured || false}
         onCheckedChange={(checked) => handleInputChange("featured", checked)}
        />
        <Label>Featured Post</Label>
       </div>

       <div className="flex items-center space-x-2">
        <Switch
         checked={autoSaveEnabled}
         onCheckedChange={setAutoSaveEnabled}
        />
        <Label>Auto-save (saves every 2 seconds)</Label>
       </div>
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle className="flex items-center gap-2">
        📊 Content Statistics
       </CardTitle>
      </CardHeader>
      <CardContent>
       <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="p-3 bg-blue-50 rounded-lg">
         <div className="font-medium text-blue-800">Words</div>
         <div className="text-2xl font-bold text-blue-600">
          {formData.wordCount || 0}
         </div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg">
         <div className="font-medium text-green-800">Reading Time</div>
         <div className="text-2xl font-bold text-green-600">
          {formData.readingTime || 0}m
         </div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg">
         <div className="font-medium text-purple-800">Headers</div>
         <div className="text-2xl font-bold text-purple-600">
          {formData.headers || 0}
         </div>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
         <div className="font-medium text-orange-800">Images</div>
         <div className="text-2xl font-bold text-orange-600">
          {formData.images || 0}
         </div>
        </div>
       </div>
       <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
        <p>📈 Statistics update automatically as you type</p>
        <p>🎯 Recommended: 300+ words, 2-3 minute reading time</p>
       </div>
      </CardContent>
     </Card>
    </TabsContent>
   </Tabs>

   {/* Action Buttons */}
   <div className="flex justify-between items-center mt-8 p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center gap-4 text-sm text-gray-600">
     <span className="flex items-center gap-1">
      {isValid ? (
       <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
       <AlertCircle className="w-4 h-4 text-red-600" />
      )}
      {isValid ? "Ready to publish" : "Has validation errors"}
     </span>
     {autoSaveEnabled && (
      <span className="flex items-center gap-1 text-blue-600">
       <Info className="w-4 h-4" />
       Auto-save enabled
      </span>
     )}
    </div>

    <div className="flex gap-4">
     <Button
      variant="outline"
      onClick={() => (window.location.href = `/${slug}`)}
     >
      Cancel
     </Button>
     <Button
      onClick={handleSave}
      disabled={saving || !isValid}
      className="min-w-[120px]"
     >
      {saving ? (
       <>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Saving...
       </>
      ) : (
       <>
        <Save className="w-4 h-4 mr-2" />
        Save Changes
       </>
      )}
     </Button>
    </div>
   </div>
  </div>
 );
}
