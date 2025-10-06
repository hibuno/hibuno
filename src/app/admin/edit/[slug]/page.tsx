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
import { MediaProvider } from "@/components/media-provider";
import {
 ArrowLeft,
 Save,
 X,
 Upload,
 ImagePlus,
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

// Enhanced Monaco Editor with modern features
function MonacoEditor({
 content,
 onChange,
 onImageUpload,
}: {
 content: string;
 onChange: (content: string) => void;
 onImageUpload: (file: File) => Promise<string>;
}) {
 const [isDragging, setIsDragging] = useState(false);
 const [uploading, setUploading] = useState(false);
 const editorRef = useRef<HTMLDivElement>(null);
 const monacoRef = useRef<any>(null);

 // Initialize Monaco Editor
 useEffect(() => {
  let isMounted = false;
  if (editorRef.current && !monacoRef.current) {
   const initializeEditor = async () => {
    try {
     // Load Monaco Editor if not already loaded
     if (!(window as any).monaco) {
      await new Promise<void>((resolve) => {
       const script = document.createElement("script");
       script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js";
       script.onload = () => {
        (window as any).require.config({
         paths: {
          vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs",
         },
        });

        (window as any).require(["vs/editor/editor.main"], () => {
         resolve();
        });
       };
       document.head.appendChild(script);
      });
     }

     // Wait a bit for Monaco to be fully loaded
     await new Promise((resolve) => setTimeout(resolve, 100));

     if (editorRef.current && !monacoRef.current) {
      const editor = (window as any).monaco.editor.create(editorRef.current, {
       value: content || "# Start writing your content here...",
       language: "markdown",
       theme: "vs-light",
       minimap: { enabled: false },
       fontSize: 14,
       lineNumbers: "on",
       wordWrap: "on",
       automaticLayout: true,
       scrollBeyondLastLine: false,
       renderWhitespace: "selection",
       bracketPairColorization: { enabled: true },
       guides: {
        bracketPairs: true,
        indentation: true,
       },
      });

      monacoRef.current = editor;
      isMounted = true;

      // Listen for content changes
      editor.onDidChangeModelContent(() => {
       const newContent = editor.getValue();
       onChange(newContent);
      });
     }
    } catch (error) {
     console.error("Failed to initialize Monaco Editor:", error);
    }
   };

   initializeEditor();

   if (!isMounted) {
    return;
   }
  }

  return () => {
   if (monacoRef.current) {
    monacoRef.current.dispose();
    monacoRef.current = null;
   }
  };
 }, []);

 // Update editor content when prop changes
 useEffect(() => {
  if (monacoRef.current && (window as any).monaco && content !== undefined) {
   const currentValue = monacoRef.current.getValue();
   if (currentValue !== content) {
    // Use pushUndoStop to prevent undo history pollution
    monacoRef.current.pushUndoStop();
    monacoRef.current.setValue(content);
    monacoRef.current.pushUndoStop();
   }
  }
 }, [content]);

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

    // Insert markdown image at cursor position
    if (monacoRef.current && (window as any).monaco) {
     const selection = monacoRef.current.getSelection();
     const text = `\n![${file.name.replace(/\.[^/.]+$/, "")}](${imageUrl})\n`;

     const range = new (window as any).monaco.Range(
      selection.startLineNumber,
      selection.startColumn,
      selection.endLineNumber,
      selection.endColumn
     );

     const op = {
      range: range,
      text: text,
      forceMoveMarkers: true,
     };

     monacoRef.current.executeEdits("insert-image", [op]);
     monacoRef.current.focus();
    }
   } catch (error) {
    console.error("Upload failed:", error);
   } finally {
    setUploading(false);
   }
  }
 };

 // Insert markdown syntax at cursor position
 const insertMarkdown = (
  before: string,
  after: string = "",
  placeholder = ""
 ) => {
  if (monacoRef.current && (window as any).monaco) {
   try {
    const selection = monacoRef.current.getSelection();
    const selectedText = monacoRef.current
     .getModel()
     .getValueInRange(selection);
    const insertText = selectedText || placeholder;
    const text = before + insertText + after;

    // Use Monaco's edit operations
    const range = new (window as any).monaco.Range(
     selection.startLineNumber,
     selection.startColumn,
     selection.endLineNumber,
     selection.endColumn
    );

    const op = {
     range: range,
     text: text,
     forceMoveMarkers: true,
    };

    monacoRef.current.executeEdits("insert-markdown", [op]);

    // Set cursor position after inserted text if placeholder was used
    if (insertText === placeholder) {
     const newPosition = new (window as any).monaco.Position(
      selection.startLineNumber,
      selection.startColumn + before.length + insertText.length
     );
     monacoRef.current.setPosition(newPosition);
    }

    // Focus the editor
    monacoRef.current.focus();
   } catch (error) {
    console.error("Error inserting markdown:", error);
   }
  }
 };

 return (
  <div className="space-y-4">
   {/* Enhanced Toolbar */}
   <div className="flex items-center gap-2 p-4 border rounded-lg bg-gradient-to-r from-gray-50 to-white flex-wrap">
    {/* History Controls */}
    <div className="flex gap-1">
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
       if (monacoRef.current) {
        monacoRef.current.getModel()?.undo();
       }
      }}
      title="Undo (Ctrl+Z)"
      className="hover:bg-white"
     >
      <Undo className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => {
       if (monacoRef.current) {
        monacoRef.current.getModel()?.redo();
       }
      }}
      title="Redo (Ctrl+Y)"
      className="hover:bg-white"
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
      className="hover:bg-white"
     >
      <Bold className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("*", "*", "italic text")}
      title="Italic (Ctrl+I)"
      className="hover:bg-white"
     >
      <Italic className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("`", "`", "code")}
      title="Inline Code"
      className="hover:bg-white"
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
      className="hover:bg-white"
     >
      <Heading1 className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("## ", "", "Heading 2")}
      title="Heading 2"
      className="hover:bg-white"
     >
      <Heading2 className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("### ", "", "Heading 3")}
      title="Heading 3"
      className="hover:bg-white"
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
      className="hover:bg-white"
     >
      <List className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("1. ", "", "Numbered item")}
      title="Numbered List"
      className="hover:bg-white"
     >
      <ListOrdered className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("> ", "", "Quote")}
      title="Quote"
      className="hover:bg-white"
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
      className="hover:bg-white"
     >
      <Link className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("![", "](url)", "alt text")}
      title="Image"
      className="hover:bg-white"
     >
      <ImagePlus className="w-4 h-4" />
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("```\n", "\n```", "code block")}
      title="Code Block"
      className="hover:bg-white"
     >
      <CodeIcon className="w-4 h-4" />
     </Button>
    </div>

    <div className="flex-1" />

    <div className="flex items-center gap-2 text-xs text-gray-500">
     <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <span>Monaco Editor - VS Code Experience</span>
     </div>
    </div>
   </div>

   {/* Editor Area */}
   <div className="relative">
    <div
     ref={editorRef}
     className="h-[600px] border rounded-lg overflow-hidden"
     onDragOver={handleDragOver}
     onDragLeave={handleDragLeave}
     onDrop={handleDrop}
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

   <div className="flex items-center justify-between text-xs text-gray-500">
    <span>🚀 Powered by Monaco Editor - Same editor used in VS Code</span>
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
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

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

   timeoutId = setTimeout(autoSave, 2000);
  }

  return () => {
   if (timeoutId) {
    clearTimeout(timeoutId);
   }
  };
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
   ...(field === "published" && value === true
    ? { published_at: new Date().toISOString() }
    : field === "published" && value === false
    ? { published_at: null }
    : {}),
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
  <MediaProvider>
   <div className="container mx-auto px-4 py-8 max-w-6xl">
    {/* Header */}
    <div className="flex items-center gap-4 mb-8 p-6 bg-gradient-to-r from-white to-gray-50 rounded-lg border">
     <Button
      variant="outline"
      size="sm"
      onClick={() => (window.location.href = `/${slug}`)}
      className="shrink-0"
     >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Post
     </Button>

     <div className="flex-1 min-w-0">
      <div className="flex items-center gap-3 mb-2">
       <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
       <div className="flex items-center gap-2">
        {formData.published ? (
         <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Published
         </Badge>
        ) : (
         <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Draft
         </Badge>
        )}
        {formData.featured && (
         <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
          <Sparkles className="w-3 h-3 mr-1" />
          Featured
         </Badge>
        )}
       </div>
      </div>
      <div className="flex items-center gap-6 text-sm text-gray-600">
       <span className="flex items-center gap-1">
        <FileText className="w-4 h-4" />
        {formData.wordCount || 0} words
       </span>
       <span className="flex items-center gap-1">
        <Clock className="w-4 h-4" />
        {formData.readingTime || 0} min read
       </span>
       {formData.headers > 0 && (
        <span className="flex items-center gap-1">
         <Heading1 className="w-4 h-4" />
         {formData.headers} sections
        </span>
       )}
       {formData.images > 0 && (
        <span className="flex items-center gap-1">
         <Image className="w-4 h-4" />
         {formData.images} images
        </span>
       )}
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
       className="shrink-0"
      >
       <Copy className="w-4 h-4 mr-2" />
       Copy URL
      </Button>
      <Button
       variant="outline"
       size="sm"
       onClick={() => window.open(`/${slug}`, "_blank")}
       className="shrink-0"
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
     <TabsList className="grid w-full grid-cols-5">
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
      <TabsTrigger value="github" className="flex items-center gap-2">
       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
       </svg>
       GitHub
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
        <MonacoEditor
         content={formData.content || ""}
         onChange={(content: string) => handleInputChange("content", content)}
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

     <TabsContent value="github" className="space-y-6">
      <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
         </svg>
         GitHub Repository Information
        </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        <div>
         <Label htmlFor="githubRepoUrl">GitHub Repository URL</Label>
         <Input
          id="githubRepoUrl"
          value={formData.githubRepoUrl || ""}
          onChange={(e) => handleInputChange("githubRepoUrl", e.target.value)}
          placeholder="https://github.com/username/repository"
          className="mt-1"
         />
         <p className="text-xs text-gray-500 mt-1">
          Full URL to the GitHub repository (e.g.,
          https://github.com/facebook/react)
         </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
         <div>
          <Label htmlFor="githubStars">Stars Count</Label>
          <Input
           id="githubStars"
           type="number"
           value={formData.githubStars || ""}
           onChange={(e) =>
            handleInputChange(
             "githubStars",
             e.target.value ? parseInt(e.target.value) : null
            )
           }
           placeholder="0"
           className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Number of GitHub stars</p>
         </div>

         <div>
          <Label htmlFor="githubForks">Forks Count</Label>
          <Input
           id="githubForks"
           type="number"
           value={formData.githubForks || ""}
           onChange={(e) =>
            handleInputChange(
             "githubForks",
             e.target.value ? parseInt(e.target.value) : null
            )
           }
           placeholder="0"
           className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">Number of GitHub forks</p>
         </div>
        </div>

        <div>
         <Label htmlFor="githubHomepageUrl">Homepage URL</Label>
         <Input
          id="githubHomepageUrl"
          value={formData.githubHomepageUrl || ""}
          onChange={(e) =>
           handleInputChange("githubHomepageUrl", e.target.value)
          }
          placeholder="https://project-website.com"
          className="mt-1"
         />
         <p className="text-xs text-gray-500 mt-1">
          Project homepage or documentation URL (if different from repo)
         </p>
        </div>

        <div>
         <Label htmlFor="githubPricingUrl">Pricing URL</Label>
         <Input
          id="githubPricingUrl"
          value={formData.githubPricingUrl || ""}
          onChange={(e) =>
           handleInputChange("githubPricingUrl", e.target.value)
          }
          placeholder="https://project-website.com/pricing"
          className="mt-1"
         />
         <p className="text-xs text-gray-500 mt-1">
          Link to pricing information for commercial projects
         </p>
        </div>

        <div>
         <Label htmlFor="githubLicense">License</Label>
         <Input
          id="githubLicense"
          value={formData.githubLicense || ""}
          onChange={(e) => handleInputChange("githubLicense", e.target.value)}
          placeholder="MIT, Apache 2.0, GPL, etc."
          className="mt-1"
         />
         <p className="text-xs text-gray-500 mt-1">
          Software license (e.g., MIT, Apache 2.0, GPL-3.0)
         </p>
        </div>
       </CardContent>
      </Card>

      <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <Info className="w-5 h-5" />
         GitHub Information Preview
        </CardTitle>
       </CardHeader>
       <CardContent>
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
         <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          This is how the GitHub information will appear on your post:
         </p>
         <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
          {formData.githubRepoUrl && (
           <a
            href={formData.githubRepoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
           >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
             <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span className="text-sm font-medium">View Repository</span>
           </a>
          )}

          <div className="flex items-center gap-3">
           {formData.githubStars && formData.githubStars > 0 && (
            <div className="flex items-center gap-1 text-sm">
             <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
             </svg>
             <span className="font-medium">
              {formData.githubStars.toLocaleString()}
             </span>
            </div>
           )}

           {formData.githubForks && formData.githubForks > 0 && (
            <div className="flex items-center gap-1 text-sm">
             <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
             >
              <path
               strokeLinecap="round"
               strokeLinejoin="round"
               strokeWidth={2}
               d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
             </svg>
             <span className="font-medium">
              {formData.githubForks.toLocaleString()}
             </span>
            </div>
           )}
          </div>

          {formData.githubHomepageUrl && (
           <a
            href={formData.githubHomepageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-800"
           >
            <svg
             className="w-4 h-4"
             fill="none"
             stroke="currentColor"
             viewBox="0 0 24 24"
            >
             <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
             />
            </svg>
            <span className="text-sm font-medium">Homepage</span>
           </a>
          )}

          {formData.githubPricingUrl && (
           <a
            href={formData.githubPricingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md border border-green-200 dark:border-green-800"
           >
            <svg
             className="w-4 h-4"
             fill="none"
             stroke="currentColor"
             viewBox="0 0 24 24"
            >
             <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
             />
            </svg>
            <span className="text-sm font-medium">Pricing</span>
           </a>
          )}
         </div>
         {!formData.githubRepoUrl &&
          !formData.githubStars &&
          !formData.githubForks &&
          !formData.githubHomepageUrl &&
          !formData.githubPricingUrl && (
           <p className="text-sm text-gray-500 italic">
            No GitHub information added yet. Fill in the fields above to see the
            preview.
           </p>
          )}
        </div>
       </CardContent>
      </Card>

      <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <svg
          className="w-5 h-5 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
         >
          <path
           strokeLinecap="round"
           strokeLinejoin="round"
           strokeWidth={2}
           d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
          />
         </svg>
         Pricing Information
        </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
         <div>
          <Label htmlFor="minPrice">Minimum Price ($)</Label>
          <Input
           id="minPrice"
           type="number"
           value={formData.minPrice || ""}
           onChange={(e) =>
            handleInputChange(
             "minPrice",
             e.target.value ? parseInt(e.target.value) : null
            )
           }
           placeholder="0"
           className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
           Starting price (e.g., 29)
          </p>
         </div>

         <div>
          <Label htmlFor="maxPrice">Maximum Price ($)</Label>
          <Input
           id="maxPrice"
           type="number"
           value={formData.maxPrice || ""}
           onChange={(e) =>
            handleInputChange(
             "maxPrice",
             e.target.value ? parseInt(e.target.value) : null
            )
           }
           placeholder="0"
           className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
           Highest price tier (e.g., 299)
          </p>
         </div>
        </div>

        <div className="flex items-center space-x-2">
         <Switch
          id="offerFree"
          checked={formData.offerFree || false}
          onCheckedChange={(checked) => handleInputChange("offerFree", checked)}
         />
         <Label htmlFor="offerFree" className="flex items-center gap-2">
          <svg
           className="w-4 h-4"
           fill="none"
           stroke="currentColor"
           viewBox="0 0 24 24"
          >
           <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
           />
          </svg>
          Offer Free Version
         </Label>
        </div>

        <div className="grid grid-cols-2 gap-4">
         <div>
          <Label htmlFor="prevMinPrice">Previous Min Price ($)</Label>
          <Input
           id="prevMinPrice"
           type="number"
           value={formData.prevMinPrice || ""}
           onChange={(e) =>
            handleInputChange(
             "prevMinPrice",
             e.target.value ? parseInt(e.target.value) : null
            )
           }
           placeholder="0"
           className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
           Before discount (optional)
          </p>
         </div>

         <div>
          <Label htmlFor="prevMaxPrice">Previous Max Price ($)</Label>
          <Input
           id="prevMaxPrice"
           type="number"
           value={formData.prevMaxPrice || ""}
           onChange={(e) =>
            handleInputChange(
             "prevMaxPrice",
             e.target.value ? parseInt(e.target.value) : null
            )
           }
           placeholder="0"
           className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">
           Before discount (optional)
          </p>
         </div>
        </div>

        <div className="flex items-center space-x-2">
         <Switch
          id="inPromotion"
          checked={formData.inPromotion || false}
          onCheckedChange={(checked) =>
           handleInputChange("inPromotion", checked)
          }
         />
         <Label htmlFor="inPromotion" className="flex items-center gap-2">
          <svg
           className="w-4 h-4"
           fill="none"
           stroke="currentColor"
           viewBox="0 0 24 24"
          >
           <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
           />
          </svg>
          Currently in Promotion
         </Label>
        </div>
       </CardContent>
      </Card>

      <Card>
       <CardHeader>
        <CardTitle className="flex items-center gap-2">
         <svg
          className="w-5 h-5 text-blue-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
         >
          <path
           strokeLinecap="round"
           strokeLinejoin="round"
           strokeWidth={2}
           d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
         </svg>
         Social Media & Community
        </CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
        <div>
         <Label htmlFor="socialMedias">Social Media Links</Label>
         <Textarea
          id="socialMedias"
          value={
           Array.isArray(formData.socialMedias)
            ? formData.socialMedias.join("\n")
            : formData.socialMedias || ""
          }
          onChange={(e) =>
           handleInputChange(
            "socialMedias",
            e.target.value.split("\n").filter(Boolean)
           )
          }
          placeholder="https://twitter.com/username&#10;https://discord.gg/invite&#10;https://linkedin.com/company&#10;https://youtube.com/channel"
          rows={4}
          className="mt-1"
         />
         <p className="text-xs text-gray-500 mt-1">
          One social media link per line (Twitter, Discord, LinkedIn, YouTube,
          etc.)
         </p>
        </div>

        <div>
         <Label htmlFor="voucherCodes">Voucher Codes</Label>
         <Textarea
          id="voucherCodes"
          value={
           Array.isArray(formData.voucherCodes)
            ? formData.voucherCodes.join("\n")
            : formData.voucherCodes || ""
          }
          onChange={(e) =>
           handleInputChange(
            "voucherCodes",
            e.target.value.split("\n").filter(Boolean)
           )
          }
          placeholder="SAVE20&#10;WELCOME10&#10;DISCOUNT50"
          rows={3}
          className="mt-1"
         />
         <p className="text-xs text-gray-500 mt-1">
          One voucher code per line (users can click to copy)
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
       <CardContent className="space-y-6">
        <div className="space-y-4">
         <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
           <div
            className={`p-2 rounded-full ${
             formData.published ? "bg-green-100" : "bg-gray-100"
            }`}
           >
            {formData.published ? (
             <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
             <Clock className="w-5 h-5 text-gray-600" />
            )}
           </div>
           <div>
            <div className="flex items-center gap-2">
             <Label className="text-base font-medium">Published</Label>
             {formData.published && formData.published_at && (
              <Badge variant="secondary" className="text-xs">
               Published {new Date(formData.published_at).toLocaleDateString()}
              </Badge>
             )}
            </div>
            <p className="text-sm text-gray-600">
             {formData.published
              ? "This post is live and visible to readers"
              : "This post is in draft mode and not visible to readers"}
            </p>
           </div>
          </div>
          <Switch
           checked={formData.published || false}
           onCheckedChange={(checked) =>
            handleInputChange("published", checked)
           }
           className="data-[state=checked]:bg-green-600"
          />
         </div>

         <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center space-x-3">
           <div
            className={`p-2 rounded-full ${
             formData.featured ? "bg-purple-100" : "bg-gray-100"
            }`}
           >
            <Sparkles
             className={`w-5 h-5 ${
              formData.featured ? "text-purple-600" : "text-gray-600"
             }`}
            />
           </div>
           <div>
            <Label className="text-base font-medium">Featured Post</Label>
            <p className="text-sm text-gray-600">
             {formData.featured
              ? "This post will be highlighted on the homepage"
              : "Feature this post to give it more visibility"}
            </p>
           </div>
          </div>
          <Switch
           checked={formData.featured || false}
           onCheckedChange={(checked) => handleInputChange("featured", checked)}
           className="data-[state=checked]:bg-purple-600"
          />
         </div>

         <div className="flex items-center justify-between p-4 border rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
           <div
            className={`p-2 rounded-full ${
             autoSaveEnabled ? "bg-green-100" : "bg-gray-100"
            }`}
           >
            <Save
             className={`w-5 h-5 ${
              autoSaveEnabled ? "text-green-600" : "text-gray-600"
             }`}
            />
           </div>
           <div>
            <Label className="text-base font-medium">Auto-save</Label>
            <p className="text-sm text-gray-600">
             {autoSaveEnabled
              ? "Changes are automatically saved every 2 seconds"
              : "Enable auto-save to prevent data loss"}
            </p>
           </div>
          </div>
          <Switch
           checked={autoSaveEnabled}
           onCheckedChange={setAutoSaveEnabled}
           className="data-[state=checked]:bg-green-600"
          />
         </div>
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
    <div className="flex justify-between items-center mt-8 p-6 bg-gradient-to-r from-gray-50 to-white rounded-lg border shadow-sm">
     <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border">
       {isValid ? (
        <>
         <CheckCircle className="w-4 h-4 text-green-600" />
         <span className="text-green-700 font-medium">Ready to publish</span>
        </>
       ) : (
        <>
         <AlertCircle className="w-4 h-4 text-red-600" />
         <span className="text-red-700 font-medium">Has validation errors</span>
        </>
       )}
      </div>
      {autoSaveEnabled && (
       <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-blue-50 border border-blue-200">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-blue-700 font-medium">Auto-save enabled</span>
       </div>
      )}
     </div>

     <div className="flex gap-3">
      <Button
       variant="outline"
       onClick={() => (window.location.href = `/${slug}`)}
       className="px-6"
      >
       Cancel
      </Button>
      <Button
       onClick={handleSave}
       disabled={saving || !isValid}
       className={`min-w-[140px] transition-all duration-200 ${
        formData.published
         ? "bg-green-600 hover:bg-green-700"
         : "bg-blue-600 hover:bg-blue-700"
       }`}
      >
       {saving ? (
        <>
         <Loader2 className="w-4 h-4 mr-2 animate-spin" />
         Saving...
        </>
       ) : (
        <>
         <Save className="w-4 h-4 mr-2" />
         {formData.published ? "Update Post" : "Save Changes"}
        </>
       )}
      </Button>
     </div>
    </div>
   </div>
  </MediaProvider>
 );
}
