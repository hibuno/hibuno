"use client";

import {
 AlertCircle,
 ArrowLeft,
 CheckCircle,
 Clock,
 Code as CodeIcon,
 Copy,
 ExternalLink,
 ImagePlus,
 Info,
 Link,
 List,
 ListOrdered,
 Loader2,
 Quote,
 Redo,
 Save,
 Sparkles,
 Undo,
 Upload,
 X,
 Bold,
 Italic,
 Heading1,
 Heading2,
 Heading3,
} from "lucide-react";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { MediaProvider } from "@/components/media-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { calculateStats } from "@/lib/utils";

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
  ? `${truncated.substring(0, lastSpace)}...`
  : `${truncated}...`;
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
 const initializedRef = useRef(false);

 // Memoize the onChange callback to prevent unnecessary re-renders
 const memoizedOnChange = useCallback(
  (newContent: string) => {
   onChange(newContent);
  },
  [onChange]
 );

 // Initialize Monaco Editor - only once
 useEffect(() => {
  if (editorRef.current && !monacoRef.current && !initializedRef.current) {
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
      initializedRef.current = true;

      // Listen for content changes
      editor.onDidChangeModelContent(() => {
       const newContent = editor.getValue();
       memoizedOnChange(newContent);
      });
     }
    } catch (error) {
     console.error("Failed to initialize Monaco Editor:", error);
    }
   };

   initializeEditor();
  }

  return () => {
   if (monacoRef.current) {
    monacoRef.current.dispose();
    monacoRef.current = null;
    initializedRef.current = false;
   }
  };
 }, []); // Remove dependencies to prevent re-initialization

 // Update editor content when prop changes (only if significantly different)
 useEffect(() => {
  if (
   monacoRef.current &&
   (window as any).monaco &&
   content !== undefined &&
   initializedRef.current
  ) {
   const currentValue = monacoRef.current.getValue();
   // Only update if content is significantly different (not just cursor position changes)
   if (currentValue.trim() !== content.trim() && content.length > 0) {
    const selection = monacoRef.current.getSelection();
    monacoRef.current.pushUndoStop();
    monacoRef.current.setValue(content);
    monacoRef.current.pushUndoStop();
    // Try to restore cursor position if possible
    try {
     monacoRef.current.setSelection(selection);
    } catch (e) {
     // Ignore cursor position errors
    }
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
  if (file?.type.startsWith("image/")) {
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
   <div className="flex items-center gap-2 p-3 border rounded-lg bg-gradient-to-r from-gray-50 to-white flex-wrap">
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
      <CodeIcon className="w-4 h-4" />
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
   </div>

   {/* Editor Area */}
   <div className="relative">
    <div
     ref={editorRef}
     className="h-[500px] border rounded-lg overflow-hidden"
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

  // SEO validation
  if (formData.excerpt && formData.excerpt.length > 160) {
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
 const [autoSaveEnabled, setAutoSaveEnabled] = useState(false);
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

    // Auto-generate excerpt only if not manually set
    if (!prev.manualExcerpt && prev.excerpt !== debouncedContent) {
     const autoExcerpt = generateExcerpt(debouncedContent);
     if (autoExcerpt && autoExcerpt !== prev.excerpt) {
      newData.excerpt = autoExcerpt;
     }
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
  formData.manualExcerpt,
 ]);

 // Auto-save functionality - optimized to prevent unnecessary saves
 useEffect(() => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  if (
   autoSaveEnabled &&
   post &&
   isValid &&
   debouncedContent &&
   formData.content
  ) {
   const autoSave = async () => {
    try {
     // Only save if content has actually changed from the original
     if (formData.content !== post.content) {
      const updateData = {
       ...formData,
      };

      const response = await fetch(`/api/admin/posts/${slug}`, {
       method: "PUT",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify(updateData),
      });

      if (response.ok) {
       setLastSaved(new Date());
      }
     }
    } catch (error) {
     console.error("Auto-save failed:", error);
    }
   };

   timeoutId = setTimeout(autoSave, 2000);
  }

  return () => {
   if (timeoutId) clearTimeout(timeoutId);
  };
 }, [autoSaveEnabled, post, isValid, debouncedContent, formData.content, slug]);

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
    ...(field === "excerpt" ? { manualExcerpt: true } : {}),
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
   window.location.href = `/${slug}`;
  } catch (error) {
   console.error("Save error:", error);
   alert(
    `Save failed: ${error instanceof Error ? error.message : "Unknown error"}`
   );
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
   <div className="container mx-auto px-4 py-4 max-w-7xl">
    {/* Compact Header */}
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3 p-2.5 bg-white rounded-lg border">
     <div className="flex items-center gap-3">
      <Button
       variant="outline"
       size="sm"
       onClick={() => (window.location.href = `/${slug}`)}
      >
       <ArrowLeft className="w-4 h-4 mr-2" />
       Back
      </Button>

      <div>
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
        {formData.featured && (
         <Badge className="bg-purple-100 text-purple-800">
          <Sparkles className="w-3 h-3 mr-1" />
          Featured
         </Badge>
        )}
       </div>
      </div>
     </div>

     <div className="flex items-center gap-2">
      <Button
       variant="outline"
       size="sm"
       onClick={async () => {
        try {
         const timestamp = new Date().getTime();
         const response = await fetch(
          `/api/admin/posts/${slug}?t=${timestamp}`,
          {
           headers: { "Cache-Control": "no-cache" },
          }
         );
         if (response.ok) {
          const freshData = await response.json();
          setPost(freshData);
          setFormData(freshData);
          setCoverImagePreview(freshData.cover_image_url || null);
          alert("Data refreshed from database");
         }
        } catch (error) {
         console.error("Refresh failed:", error);
        }
       }}
      >
       🔄 Refresh
      </Button>
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
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
     {/* Left Column - Main Content */}
     <div className="xl:col-span-2 space-y-3">
      {/* Basic Information - Compact */}
      <div className="p-2.5 bg-white border rounded-lg">
       <h3 className="text-sm font-semibold mb-2 text-gray-800">
        Basic Information
       </h3>
       <div className="space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
         <div>
          <Label htmlFor="slug" className="text-sm font-medium">
           URL Slug *
          </Label>
          <Input
           id="slug"
           value={formData.slug || ""}
           onChange={(e) => handleInputChange("slug", e.target.value)}
           placeholder="post-url-slug"
           className="h-8 text-sm"
          />
         </div>

         <div>
          <Label htmlFor="title" className="text-sm font-medium">
           Title *
          </Label>
          <Input
           id="title"
           value={formData.title || ""}
           onChange={(e) => handleInputChange("title", e.target.value)}
           placeholder="Enter an engaging title..."
           className={`h-8 text-sm mt-0.5 ${
            errors.title ? "border-red-500" : ""
           }`}
          />
         </div>
        </div>

        <div>
         <Label htmlFor="excerpt" className="text-sm font-medium">
          Excerpt
         </Label>
         <Textarea
          id="excerpt"
          value={formData.excerpt || ""}
          onChange={(e) => handleInputChange("excerpt", e.target.value)}
          placeholder="Brief description for SEO and social sharing..."
          rows={2}
          className="h-16 text-sm resize-none"
         />
         <div className="flex justify-between text-xs text-gray-500 mt-0.5">
          <span>{warnings.excerpt || "Recommended: 120-160 characters"}</span>
          <span>{(formData.excerpt || "").length}/160</span>
         </div>
        </div>

        <div>
         <Label className="text-sm font-medium mb-1 block">
          Tags (comma-separated)
         </Label>
         <div className="flex gap-1.5">
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
           className="flex-1 h-8 text-sm"
          />
          <Button
           type="button"
           variant="outline"
           size="sm"
           className="h-8 px-2"
           onClick={() => {
            const autoTags = generateTags(
             formData.content || "",
             formData.title || ""
            );
            handleInputChange("tags", autoTags);
           }}
          >
           <Sparkles className="w-3 h-3 mr-1" />
           Auto
          </Button>
         </div>
        </div>
       </div>
      </div>

      {/* Content Editor */}
      <div className="bg-white border rounded-lg overflow-hidden">
       <div className="p-2.5 border-b">
        <h3 className="text-sm font-semibold text-gray-800">Content Editor</h3>
       </div>
       <div className="p-0">
        <MonacoEditor
         content={formData.content || ""}
         onChange={(content: string) => handleInputChange("content", content)}
         onImageUpload={uploadImageToSupabase}
        />
       </div>
      </div>
     </div>

     {/* Right Column - Sidebar */}
     <div className="space-y-2">
      {/* Publishing Settings - Compact */}
      <div className="p-2.5 bg-white border rounded-lg">
       <h3 className="text-sm font-semibold mb-2 text-gray-800">Publishing</h3>
       <div className="space-y-2">
        <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
          <div
           className={`p-1 rounded-full ${
            formData.published ? "bg-green-100" : "bg-gray-100"
           }`}
          >
           {formData.published ? (
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
           ) : (
            <Clock className="w-3.5 h-3.5 text-gray-600" />
           )}
          </div>
          <div>
           <Label className="text-sm font-medium">Published</Label>
           {formData.published && formData.published_at && (
            <p className="text-xs text-gray-500">
             {new Date(formData.published_at).toLocaleDateString()}
            </p>
           )}
          </div>
         </div>
         <Switch
          checked={formData.published || false}
          onCheckedChange={(checked) => handleInputChange("published", checked)}
         />
        </div>

        <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
          <div
           className={`p-1 rounded-full ${
            formData.featured ? "bg-purple-100" : "bg-gray-100"
           }`}
          >
           <Sparkles
            className={`w-3.5 h-3.5 ${
             formData.featured ? "text-purple-600" : "text-gray-600"
            }`}
           />
          </div>
          <div>
           <Label className="text-sm font-medium">Featured</Label>
           <p className="text-xs text-gray-500">Highlight on homepage</p>
          </div>
         </div>
         <Switch
          checked={formData.featured || false}
          onCheckedChange={(checked) => handleInputChange("featured", checked)}
         />
        </div>

        <div className="flex items-center justify-between">
         <div className="flex items-center gap-2">
          <div
           className={`p-1 rounded-full ${
            autoSaveEnabled ? "bg-green-100" : "bg-gray-100"
           }`}
          >
           <Save
            className={`w-3.5 h-3.5 ${
             autoSaveEnabled ? "text-green-600" : "text-gray-600"
            }`}
           />
          </div>
          <div>
           <Label className="text-sm font-medium">Auto-save</Label>
           <p className="text-xs text-gray-500">Saves every 2s</p>
          </div>
         </div>
         <Switch
          checked={autoSaveEnabled}
          onCheckedChange={setAutoSaveEnabled}
         />
        </div>

        {/* Date/Time Fields */}
        <div className="pt-3 border-t space-y-3">
         <div>
          <Label htmlFor="published_at" className="text-sm font-medium">
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
           className="h-8 text-sm"
          />
          <p className="text-xs text-gray-500 mt-0.5">
           When this post was/will be published
          </p>
         </div>

         <div>
          <Label htmlFor="created_at" className="text-sm font-medium">
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
           className="h-8 text-sm"
          />
          <p className="text-xs text-gray-500 mt-0.5">Original creation date</p>
         </div>
        </div>
       </div>
      </div>

      {/* Cover Image */}
      <div className="p-2.5 bg-white border rounded-lg">
       <ImageDropZone
        currentImage={coverImagePreview}
        onImageSelect={handleCoverImageSelect}
        onRemove={removeCoverImage}
        showMetadata={false}
       />
      </div>

      {/* GitHub Information - Compact */}
      <div className="p-2.5 bg-white border rounded-lg">
       <h3 className="text-sm font-semibold mb-2 text-gray-800">GitHub</h3>
       <div className="space-y-2">
        <div>
         <Label htmlFor="github_repo_url" className="text-sm font-medium">
          Repository URL
         </Label>
         <Input
          id="github_repo_url"
          value={formData.github_repo_url || ""}
          onChange={(e) => handleInputChange("github_repo_url", e.target.value)}
          placeholder="https://github.com/username/repo"
          className="h-8 text-sm"
         />
        </div>

        <div>
         <Label htmlFor="homepage_url" className="text-sm font-medium">
          Homepage URL
         </Label>
         <Input
          id="homepage_url"
          value={formData.homepage_url || ""}
          onChange={(e) => handleInputChange("homepage_url", e.target.value)}
          placeholder="https://project-website.com"
          className="h-8 text-sm"
         />
        </div>
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
      {autoSaveEnabled && (
       <div className="flex items-center gap-1.5">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        <span className="text-blue-700 font-medium">Auto-saving</span>
       </div>
      )}
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
  </MediaProvider>
 );
}
