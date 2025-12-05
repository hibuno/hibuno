"use client";

import {
  ArrowLeft,
  Calendar,
  Check,
  DollarSign,
  ExternalLink,
  FileText,
  Globe,
  History,
  ImagePlus,
  Info,
  Loader2,
  Menu,
  Percent,
  Plus,
  Save,
  Settings,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { use, useCallback, useEffect, useRef, useState } from "react";
import RichTextEditor from "@/components/editor/rich-text-editor";
import AIMetadataPanel, {
  type AIMetadataPanelRef,
} from "@/components/editor/ai-metadata-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, MessageDialog } from "@/components/ui/alert-dialog";
import { calculateStats } from "@/lib/content-utils";
import { Textarea } from "@/components/ui/textarea";
import { OCRDropZone } from "@/components/editor/ocr-dropzone";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function ImageDropZone({
  onImageSelect,
  currentImage,
  onRemove,
}: {
  onImageSelect: (file: File) => void;
  currentImage: string | null;
  onRemove: () => void;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) onImageSelect(file);
  };

  return (
    <div>
      {currentImage ? (
        <div className="relative group">
          <img
            src={currentImage}
            alt="Cover"
            className="w-full h-24 object-cover rounded-md"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 bg-white/90 rounded text-xs font-medium hover:bg-white"
            >
              <Upload className="w-3 h-3" />
            </button>
            <button
              onClick={onRemove}
              className="p-1.5 bg-white/90 rounded text-xs font-medium hover:bg-white text-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-[var(--gold)] bg-[var(--gold-light)]/30"
              : "border-border hover:border-muted-foreground"
          }`}
        >
          <ImagePlus className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">Drop or click</p>
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) =>
          e.target.files?.[0] && onImageSelect(e.target.files[0])
        }
        className="hidden"
      />
    </div>
  );
}

function SidebarSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border last:border-b-0">
      <div className="px-3 py-2 flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </span>
        {action}
      </div>
      <div className="px-3 pb-3 space-y-3">{children}</div>
    </div>
  );
}

interface RecentPost {
  id: string;
  slug: string;
  title: string;
  updated_at: string;
}

export type EditorPageProps = {
  params: Promise<{ slug?: string[] }>;
};

export default function EditorPage({ params }: EditorPageProps) {
  const { slug: slugArray } = use(params);
  const slug = slugArray?.[0];
  const isEditMode = !!slug;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    published: false,
    tags: [],
    price: null,
    discount_percentage: null,
    homepage: "",
    product_description: "",
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [newDocDialog, setNewDocDialog] = useState(false);
  const [messageDialog, setMessageDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }>({
    open: false,
    title: "",
    description: "",
  });
  const [generatingMetadata, setGeneratingMetadata] = useState(false);
  const [generatingProductDesc, setGeneratingProductDesc] = useState(false);
  const metadataPanelRef = useRef<AIMetadataPanelRef>(null);
  const editorContentRef = useRef<string>(formData.content || "");
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);

  const debouncedContent = useDebounce(formData.content || "", 1000);

  useEffect(() => {
    if (debouncedContent) {
      const stats = calculateStats(debouncedContent);
      setFormData((prev: any) => ({ ...prev, ...stats }));
    }
  }, [debouncedContent]);

  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const response = await fetch("/api/admin/posts?limit=10");
        if (response.ok) {
          const posts = await response.json();
          setRecentPosts(posts);
        }
      } catch (error) {
        console.error("Error loading recent posts:", error);
      }
    };
    fetchRecentPosts();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      setLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(
          `/api/admin/posts/${slug}?t=${Date.now()}`
        );
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
  }, [slug, isEditMode]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData((prev: any) => {
      if (prev[field] === value) return prev;
      const newData = { ...prev, [field]: value };
      if (
        field === "title" &&
        (!prev.slug || prev.slug === generateSlug(prev.title))
      ) {
        newData.slug = generateSlug(value);
      }
      if (field === "content") {
        editorContentRef.current = value;
      }
      return newData;
    });
  }, []);

  const handleOCRTextExtracted = useCallback(
    (extractedText: string) => {
      // Append the extracted text to the current editor content
      const currentContent = editorContentRef.current || "";
      const newContent = currentContent
        ? `${currentContent}\n\n${extractedText}`
        : extractedText;
      handleInputChange("content", newContent);

      // Trigger auto-save after OCR text is inserted (with a short delay)
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true);
      }, 2000);
    },
    [handleInputChange]
  );

  // Auto-save when content changes (debounced)
  useEffect(() => {
    // Only auto-save in edit mode and if we have title and slug
    if (!isEditMode || !formData.title || !formData.slug) {
      return;
    }

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer for auto-save after 5 seconds of inactivity
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave(true);
    }, 5000);

    // Cleanup
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    formData.content,
    formData.title,
    formData.excerpt,
    formData.tags,
    isEditMode,
  ]);

  const uploadImage = async (file: File): Promise<string> => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    if (post?.id) formDataUpload.append("postId", post.id);
    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formDataUpload,
    });
    if (!response.ok) throw new Error("Upload failed");
    return (await response.json()).url;
  };

  const handleCoverImageSelect = (file: File) => {
    setCoverImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async (isAutoSave = false) => {
    if (!formData.title || !formData.slug) {
      if (!isAutoSave) {
        setMessageDialog({
          open: true,
          title: "Validation Error",
          description: "Title and slug are required to save the post.",
          variant: "destructive",
        });
      }
      return;
    }

    if (isAutoSave) {
      setAutoSaving(true);
    } else {
      setSaving(true);
    }

    try {
      let cover_image_url = formData.cover_image_url;
      if (coverImageFile) cover_image_url = await uploadImage(coverImageFile);

      const saveData = { ...formData, cover_image_url };
      const url = isEditMode ? `/api/admin/posts/${slug}` : "/api/admin/posts";
      const method = isEditMode ? "PUT" : "POST";

      const response = await fetch(`${url}?t=${Date.now()}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saveData),
      });

      if (!response.ok) throw new Error("Save failed");

      const savedPost = await response.json();
      setLastSaved(new Date());

      if (!isEditMode) {
        window.location.href = `/editor/${savedPost.slug || formData.slug}`;
      } else {
        setPost(savedPost);
      }
    } catch (error) {
      if (!isAutoSave) {
        setMessageDialog({
          open: true,
          title: "Save Failed",
          description: `Failed to save the post: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          variant: "destructive",
        });
      } else {
        console.error("Auto-save failed:", error);
      }
    } finally {
      if (isAutoSave) {
        setAutoSaving(false);
      } else {
        setSaving(false);
      }
    }
  };

  const handleNewDocumentClick = () => {
    setNewDocDialog(true);
  };

  const handleNewDocumentConfirm = () => {
    window.location.href = "/editor";
  };

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-6xl mx-auto border-x bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between h-11 px-3">
          <div className="flex items-center gap-2">
            {/* Mobile left sidebar toggle */}
            <button
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="lg:hidden p-1.5 -ml-1.5 hover:bg-muted rounded transition-colors"
              aria-label="Toggle navigation"
            >
              <Menu className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium">Editor</span>
            {isEditMode && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  formData.published
                    ? "bg-foreground text-background"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {formData.published ? "Published" : "Draft"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {autoSaving && (
              <span className="hidden sm:flex text-[10px] text-muted-foreground items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Auto-saving...
              </span>
            )}
            {!autoSaving && lastSaved && (
              <span className="hidden sm:flex text-[10px] text-foreground items-center gap-1">
                <Check className="w-3 h-3" /> Saved
              </span>
            )}
            {isEditMode && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  window.open(`/${slug}?t=${Date.now()}`, "_blank")
                }
                className="hidden sm:flex text-xs h-7"
              >
                <ExternalLink className="w-3 h-3 mr-1" /> Preview
              </Button>
            )}
            <Button
              onClick={() => handleSave(false)}
              disabled={saving || autoSaving}
              size="sm"
              className="text-xs h-7 bg-foreground text-background hover:bg-foreground/90"
            >
              {saving ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Save className="w-3 h-3 sm:mr-1" />
              )}
              <span className="hidden sm:inline">
                {saving ? "Saving" : "Save"}
              </span>
            </Button>
            {/* Mobile right sidebar toggle */}
            <button
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="lg:hidden p-1.5 -mr-1.5 hover:bg-muted rounded transition-colors"
              aria-label="Toggle settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Left Sidebar Overlay */}
      {leftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setLeftSidebarOpen(false)}
        />
      )}

      {/* Mobile Right Sidebar Overlay */}
      {rightSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setRightSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <div className="flex">
        {/* Left Sidebar */}
        <aside
          className={`
          fixed lg:relative inset-y-0 left-0 z-50 lg:z-auto
          w-64 lg:w-56 border-r border-border bg-card shrink-0
          transform transition-transform duration-200 ease-in-out
          ${
            leftSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
        >
          <div className="sticky top-0 lg:top-11 max-h-screen lg:max-h-[calc(100vh-2.75rem)] overflow-y-auto">
            {/* Mobile close button */}
            <div className="lg:hidden flex items-center justify-between p-3 border-b border-border">
              <span className="text-sm font-medium">Navigation</span>
              <button
                onClick={() => setLeftSidebarOpen(false)}
                className="p-1.5 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-border">
              <Button
                onClick={handleNewDocumentClick}
                size="sm"
                className="w-full text-xs h-7 bg-foreground text-background"
              >
                <Plus className="w-3 h-3 mr-1" /> New Document
              </Button>
            </div>

            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium">
                  Insert Text from Document
                </span>
              </div>
              <OCRDropZone onTextExtracted={handleOCRTextExtracted} />
            </div>

            <div className="p-3 border-b border-border">
              <div className="flex items-center gap-2 mb-2">
                <History className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs font-medium">Recent Posts</span>
              </div>
              <div className="space-y-1">
                {recentPosts.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground py-2">
                    No recent posts
                  </p>
                ) : (
                  recentPosts.map((recentPost) => (
                    <button
                      key={recentPost.id}
                      onClick={() => {
                        setLeftSidebarOpen(false);
                        window.location.href = `/editor/${recentPost.slug}`;
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs hover:bg-muted transition-colors ${
                        recentPost.slug === slug ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-start gap-1.5">
                        <FileText className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="font-medium truncate">
                            {recentPost.title}
                          </div>
                          <div className="text-[9px] text-muted-foreground">
                            {new Date(
                              recentPost.updated_at
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => (window.location.href = "/admin")}
                className="w-full text-xs h-7 justify-start"
              >
                <ArrowLeft className="w-3 h-3 mr-1" /> Back to Dashboard
              </Button>
            </div>
          </div>
        </aside>

        {/* Editor */}
        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto">
            <div className="bg-card min-h-[calc(100vh-2.75rem)]">
              <RichTextEditor
                content={formData.content || ""}
                onChange={(content) => handleInputChange("content", content)}
              />
            </div>
          </div>
        </main>

        {/* Right Sidebar */}
        <aside
          className={`
          fixed lg:relative inset-y-0 right-0 z-50 lg:z-auto
          w-72 lg:w-64 border-l border-border bg-card shrink-0
          transform transition-transform duration-200 ease-in-out
          ${
            rightSidebarOpen
              ? "translate-x-0"
              : "translate-x-full lg:translate-x-0"
          }
        `}
        >
          <div className="sticky top-0 lg:top-11 max-h-screen lg:max-h-[calc(100vh-2.75rem)] overflow-y-auto">
            {/* Mobile close button */}
            <div className="lg:hidden flex items-center justify-between p-3 border-b border-border">
              <span className="text-sm font-medium">Settings</span>
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="p-1.5 hover:bg-muted rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <SidebarSection
              title="Metadata"
              action={
                <button
                  onClick={async () => {
                    if (metadataPanelRef.current) {
                      setGeneratingMetadata(true);
                      try {
                        await metadataPanelRef.current.generateAll();
                      } finally {
                        setGeneratingMetadata(false);
                      }
                    }
                  }}
                  disabled={generatingMetadata}
                  className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
                  title="Generate metadata with AI"
                >
                  {generatingMetadata ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                  )}
                </button>
              }
            >
              <AIMetadataPanel
                ref={metadataPanelRef}
                content={formData.content || ""}
                title={formData.title || ""}
                slug={formData.slug || ""}
                excerpt={formData.excerpt || ""}
                tags={Array.isArray(formData.tags) ? formData.tags : []}
                onApplyTitle={(title) => handleInputChange("title", title)}
                onApplySlug={(slug) => handleInputChange("slug", slug)}
                onApplyExcerpt={(excerpt) =>
                  handleInputChange("excerpt", excerpt)
                }
                onApplyTags={(tags) => handleInputChange("tags", tags)}
                hideGenerateButton={true}
                isGenerating={generatingMetadata}
              />
            </SidebarSection>

            <SidebarSection title="Publishing">
              <ImageDropZone
                currentImage={coverImagePreview}
                onImageSelect={handleCoverImageSelect}
                onRemove={() => {
                  setCoverImageFile(null);
                  setCoverImagePreview(null);
                  handleInputChange("cover_image_url", "");
                }}
              />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
                      Publish Status
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {formData.published
                        ? "Visible to public"
                        : "Draft - not visible"}
                    </div>
                  </div>
                  <Switch
                    checked={formData.published || false}
                    onCheckedChange={(checked) =>
                      handleInputChange("published", checked)
                    }
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3" /> Publish Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={
                      formData.published_at
                        ? new Date(formData.published_at)
                            .toISOString()
                            .slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "published_at",
                        e.target.value
                          ? new Date(e.target.value).toISOString()
                          : null
                      )
                    }
                    className="h-8 text-xs"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Leave empty to use current time
                  </p>
                </div>
              </div>
            </SidebarSection>

            <SidebarSection title="Product Info">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-1">
                  <DollarSign className="w-3 h-3" /> Price
                </label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={
                    formData.price ? formData.price.toLocaleString("id-ID") : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    const parsed = value ? parseInt(value) : null;
                    handleInputChange("price", parsed);
                  }}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-1">
                  <Percent className="w-3 h-3" /> Discount %
                </label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="0"
                  value={formData.discount_percentage || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "discount_percentage",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1 mb-1">
                  <Globe className="w-3 h-3" /> Homepage URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.homepage || ""}
                  onChange={(e) =>
                    handleInputChange("homepage", e.target.value)
                  }
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                    <Info className="w-3 h-3" /> Description
                  </label>
                  <button
                    onClick={async () => {
                      if (!formData.content || formData.content.length < 50) {
                        return;
                      }
                      setGeneratingProductDesc(true);
                      try {
                        // Extract first 500 chars to detect language
                        const contentSample = formData.content
                          .replace(/<[^>]*>/g, "")
                          .substring(0, 500);

                        const response = await fetch("/api/ai/generate", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            type: "excerpt",
                            content: `${contentSample}\n\n---\n\nFull context: ${formData.content.substring(
                              0,
                              2000
                            )}`,
                            context: `CRITICAL INSTRUCTION: You MUST write in the EXACT SAME LANGUAGE as the content above. If the content is in Indonesian (Bahasa Indonesia), write in Indonesian. If in English, write in English. DO NOT translate or change the language.

Task: Generate a short product description (max 150 characters) that summarizes the key benefits or features.

Title: ${formData.title || ""}

Remember: Match the language of the content EXACTLY!`,
                          }),
                        });
                        if (response.ok) {
                          const data = await response.json();
                          handleInputChange("product_description", data.result);
                        }
                      } catch (err) {
                        console.error("Failed to generate description:", err);
                      } finally {
                        setGeneratingProductDesc(false);
                      }
                    }}
                    disabled={generatingProductDesc}
                    className="p-1 hover:bg-muted rounded transition-colors disabled:opacity-50"
                    title="Generate with AI"
                  >
                    {generatingProductDesc ? (
                      <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
                <Textarea
                  placeholder="e.g., In stock, Ships in 2-3 days"
                  value={formData.product_description || ""}
                  onChange={(e) =>
                    handleInputChange("product_description", e.target.value)
                  }
                  rows={3}
                  className="text-xs resize-none"
                />
              </div>
            </SidebarSection>
          </div>
        </aside>
      </div>

      {/* New Document Confirmation Dialog */}
      <AlertDialog
        open={newDocDialog}
        onOpenChange={setNewDocDialog}
        title="Create New Document"
        description="Create a new document? Any unsaved changes will be lost."
        confirmText="Create New"
        cancelText="Cancel"
        onConfirm={handleNewDocumentConfirm}
        variant="default"
      />

      {/* Message Dialog */}
      <MessageDialog
        open={messageDialog.open}
        onOpenChange={(open) => setMessageDialog({ ...messageDialog, open })}
        title={messageDialog.title}
        description={messageDialog.description}
        variant={messageDialog.variant || "default"}
      />
    </div>
  );
}
