"use client";

import { useEffect, useState, useRef } from "react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
 ArrowLeft,
 Save,
 X,
 Upload,
 ImagePlus,
 Eye,
 Code as CodeIcon,
 Loader2,
} from "lucide-react";

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
 const [debouncedValue, setDebouncedValue] = useState<T>(value);

 useEffect(() => {
  const handler = setTimeout(() => {
   setDebouncedValue(value);
  }, delay);

  return () => {
   clearTimeout(handler);
  };
 }, [value, delay]);

 return debouncedValue;
}

// Calculate reading time and word count
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

 return { wordCount, readingTime };
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

// Image Drop Zone Component
function ImageDropZone({
 onImageSelect,
 currentImage,
 onRemove,
 label = "Cover Image",
}: {
 onImageSelect: (file: File) => void;
 currentImage: string | null;
 onRemove: () => void;
 label?: string;
}) {
 const [isDragging, setIsDragging] = useState(false);
 const fileInputRef = useRef<HTMLInputElement>(null);

 const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(true);
 };

 const handleDragLeave = () => {
  setIsDragging(false);
 };

 const handleDrop = (e: React.DragEvent) => {
  e.preventDefault();
  setIsDragging(false);

  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith("image/")) {
   onImageSelect(file);
  }
 };

 const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
   onImageSelect(file);
  }
 };

 return (
  <div className="space-y-4">
   <Label>{label}</Label>

   {currentImage ? (
    <div className="relative group">
     <img
      src={currentImage}
      alt="Preview"
      className="w-full max-h-96 object-cover rounded-lg"
     />
     <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
      <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
       <X className="w-4 h-4 mr-2" />
       Remove
      </Button>
      <Button
       type="button"
       variant="secondary"
       size="sm"
       onClick={() => fileInputRef.current?.click()}
      >
       <Upload className="w-4 h-4 mr-2" />
       Replace
      </Button>
     </div>
    </div>
   ) : (
    <div
     onDragOver={handleDragOver}
     onDragLeave={handleDragLeave}
     onDrop={handleDrop}
     onClick={() => fileInputRef.current?.click()}
     className={`
            border-2 border-dashed rounded-lg p-12 text-center cursor-pointer
            transition-colors
            ${
             isDragging
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
            }
          `}
    >
     <ImagePlus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
     <p className="text-sm text-gray-600 mb-2">
      Drag and drop an image here, or click to select
     </p>
     <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP</p>
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

// Markdown Editor with Live Preview
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
 const textareaRef = useRef<HTMLTextAreaElement>(null);

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
     const end = textarea.selectionEnd;
     const markdownImage = `\n![${file.name}](${imageUrl})\n`;
     const newContent =
      content.substring(0, start) + markdownImage + content.substring(end);

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

 const insertMarkdown = (before: string, after: string = "") => {
  const textarea = textareaRef.current;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = content.substring(start, end);
  const newText = before + selectedText + after;

  const newContent =
   content.substring(0, start) + newText + content.substring(end);

  onChange(newContent);

  setTimeout(() => {
   textarea.focus();
   textarea.setSelectionRange(
    start + before.length,
    start + before.length + selectedText.length
   );
  }, 0);
 };

 return (
  <div className="space-y-2">
   <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50">
    <div className="flex gap-1">
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("**", "**")}
      title="Bold"
     >
      <strong className="text-xs">B</strong>
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("*", "*")}
      title="Italic"
     >
      <em className="text-xs">I</em>
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("`", "`")}
      title="Code"
     >
      <CodeIcon className="w-4 h-4" />
     </Button>
    </div>

    <div className="h-6 w-px bg-gray-300" />

    <div className="flex gap-1">
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("# ", "")}
      title="Heading 1"
     >
      <span className="text-xs font-bold">H1</span>
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("## ", "")}
      title="Heading 2"
     >
      <span className="text-xs font-bold">H2</span>
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("### ", "")}
      title="Heading 3"
     >
      <span className="text-xs font-bold">H3</span>
     </Button>
    </div>

    <div className="h-6 w-px bg-gray-300" />

    <div className="flex gap-1">
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("[", "](url)")}
      title="Link"
     >
      <span className="text-xs">Link</span>
     </Button>
     <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => insertMarkdown("![alt](", ")")}
      title="Image"
     >
      <ImagePlus className="w-4 h-4" />
     </Button>
    </div>

    <div className="flex-1" />

    <Button
     type="button"
     variant={showPreview ? "default" : "ghost"}
     size="sm"
     onClick={() => setShowPreview(!showPreview)}
    >
     <Eye className="w-4 h-4 mr-2" />
     {showPreview ? "Edit" : "Preview"}
    </Button>
   </div>

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
       onChange={(e) => onChange(e.target.value)}
       className="min-h-[400px] font-mono text-sm"
       placeholder="Write your content in Markdown...

You can also drag and drop images directly into this editor!"
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

   <p className="text-xs text-gray-500">
    💡 Tip: Drag and drop images directly into the editor to upload and insert
    them
   </p>
  </div>
 );
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

 const debouncedContent = useDebounce(formData.content || "", 1000);

 useEffect(() => {
  if (debouncedContent) {
   const { wordCount, readingTime } = calculateStats(debouncedContent);
   setFormData((prev: any) => ({
    ...prev,
    wordCount,
    readingTime,
   }));
  }
 }, [debouncedContent]);

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
  setFormData((prev: any) => ({ ...prev, [field]: value }));
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
  handleInputChange("coverImageUrl", "");
  handleInputChange("coverImageAlt", "");
 };

 const handleSave = async () => {
  if (!post) return;

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

   window.location.href = `/${slug}`;
  } catch (error) {
   console.error("Error:", error);
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
  <div className="container mx-auto px-4 py-8 max-w-5xl">
   <div className="flex items-center gap-4 mb-8">
    <Button
     variant="outline"
     size="sm"
     onClick={() => (window.location.href = `/${slug}`)}
    >
     <ArrowLeft className="w-4 h-4 mr-2" />
     Back
    </Button>
    <h1 className="text-3xl font-bold">Edit Post</h1>
    <div className="ml-auto flex items-center gap-4 text-sm text-gray-600">
     <span>{formData.wordCount || 0} words</span>
     <span>·</span>
     <span>{formData.readingTime || 0} min read</span>
    </div>
   </div>

   <Tabs defaultValue="content" className="space-y-6">
    <TabsList className="grid w-full grid-cols-3">
     <TabsTrigger value="content">Content</TabsTrigger>
     <TabsTrigger value="metadata">Metadata</TabsTrigger>
     <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>

    <TabsContent value="content" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle>Basic Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div>
        <Label htmlFor="title">Title *</Label>
        <Input
         id="title"
         value={formData.title || ""}
         onChange={(e) => handleInputChange("title", e.target.value)}
         placeholder="Post title"
         className="mt-1"
        />
       </div>

       <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
         id="subtitle"
         value={formData.subtitle || ""}
         onChange={(e) => handleInputChange("subtitle", e.target.value)}
         placeholder="Post subtitle"
         className="mt-1"
        />
       </div>

       <div>
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea
         id="excerpt"
         value={formData.excerpt || ""}
         onChange={(e) => handleInputChange("excerpt", e.target.value)}
         placeholder="Brief description"
         rows={3}
         className="mt-1"
        />
       </div>
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle>Content (Markdown)</CardTitle>
      </CardHeader>
      <CardContent>
       <MarkdownEditor
        content={formData.content || ""}
        onChange={(content) => handleInputChange("content", content)}
        onImageUpload={uploadImageToSupabase}
       />
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle>Cover Image</CardTitle>
      </CardHeader>
      <CardContent>
       <ImageDropZone
        currentImage={coverImagePreview}
        onImageSelect={handleCoverImageSelect}
        onRemove={removeCoverImage}
       />

       <div className="mt-4">
        <Label htmlFor="coverImageAlt">Alt Text</Label>
        <Input
         id="coverImageAlt"
         value={formData.coverImageAlt || ""}
         onChange={(e) => handleInputChange("coverImageAlt", e.target.value)}
         placeholder="Describe the image"
         className="mt-1"
        />
       </div>
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="metadata" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle>Author Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div>
        <Label>Author Name *</Label>
        <Input
         value={formData.authorName || ""}
         onChange={(e) => handleInputChange("authorName", e.target.value)}
         className="mt-1"
        />
       </div>

       <div>
        <Label>Author Avatar URL</Label>
        <Input
         value={formData.authorAvatarUrl || ""}
         onChange={(e) => handleInputChange("authorAvatarUrl", e.target.value)}
         className="mt-1"
        />
       </div>

       <div>
        <Label>Author Bio</Label>
        <Textarea
         value={formData.authorBio || ""}
         onChange={(e) => handleInputChange("authorBio", e.target.value)}
         rows={3}
         className="mt-1"
        />
       </div>
      </CardContent>
     </Card>

     <Card>
      <CardHeader>
       <CardTitle>Tags & Category</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
       <div>
        <Label>Tags (comma-separated)</Label>
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
         className="mt-1"
        />
       </div>

       <div>
        <Label>Category</Label>
        <Input
         value={formData.category || ""}
         onChange={(e) => handleInputChange("category", e.target.value)}
         placeholder="Technology, Tutorial, etc."
         className="mt-1"
        />
       </div>
      </CardContent>
     </Card>
    </TabsContent>

    <TabsContent value="settings" className="space-y-6">
     <Card>
      <CardHeader>
       <CardTitle>Publishing Settings</CardTitle>
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

       <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 font-medium mb-2">
         📊 Automatic Calculations
        </p>
        <div className="space-y-1 text-sm text-blue-700">
         <p>
          • Word Count: <strong>{formData.wordCount || 0}</strong> words
         </p>
         <p>
          • Reading Time: <strong>{formData.readingTime || 0}</strong> minutes
         </p>
         <p className="text-xs mt-2 text-blue-600">
          Updates automatically as you type (1 second delay)
         </p>
        </div>
       </div>
      </CardContent>
     </Card>
    </TabsContent>
   </Tabs>

   <div className="flex justify-end gap-4 mt-8">
    <Button
     variant="outline"
     onClick={() => (window.location.href = `/${slug}`)}
    >
     Cancel
    </Button>
    <Button
     onClick={handleSave}
     disabled={saving || !formData.title || !formData.content}
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
 );
}
