"use client";

import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Link as LinkIcon,
  Loader2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { deleteImage } from "./editor-utils";

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
  onDelete?: () => void;
  initialData?: {
    src?: string;
    alt?: string;
    caption?: string;
    width?: string;
    alignment?: "left" | "center" | "right";
  };
}

interface StorageFile {
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export default function ImageDialog({
  open,
  onClose,
  onInsert,
  onDelete,
  initialData,
}: ImageDialogProps) {
  const [mode, setMode] = useState<"url" | "upload" | "storage">("upload");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [width, setWidth] = useState("100%");
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(
    "center"
  );
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [storageFiles, setStorageFiles] = useState<StorageFile[]>([]);
  const [loadingStorage, setLoadingStorage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setUrl(res[0].ufsUrl || res[0].url);
        setMode("url");
      }
    },
    onUploadError: (err) => {
      console.error("Upload error:", err);
      setError(err.message || "Upload failed");
    },
  });

  useEffect(() => {
    if (open) {
      setUrl(initialData?.src || "");
      setAlt(initialData?.alt || "");
      setWidth(initialData?.width || "100%");
      setAlignment(initialData?.alignment || "center");
      setMode(initialData?.src ? "url" : "upload");
      setError("");
      setStorageFiles([]);
    }
  }, [open, initialData]);

  const loadStorageFiles = async () => {
    setLoadingStorage(true);
    setError("");
    try {
      const response = await fetch("/api/uploadthing/list?type=image&limit=20");
      if (!response.ok) throw new Error("Failed to load files");
      const data = await response.json();
      setStorageFiles(data.files || []);
    } catch (err) {
      console.error("Error loading storage:", err);
      setError("Failed to load storage files");
    } finally {
      setLoadingStorage(false);
    }
  };

  useEffect(() => {
    if (mode === "storage" && storageFiles.length === 0 && !loadingStorage) {
      loadStorageFiles();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Max 4MB");
      return;
    }
    setError("");
    await startUpload([file]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleInsert = () => {
    if (!url) {
      setError("Please provide an image");
      return;
    }
    onInsert({ src: url, alt: alt.trim(), width, alignment });
    handleClose();
  };

  const handleClose = () => {
    onClose();
  };

  if (!open) return null;

  const dialogTitleId = "image-dialog-title";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={dialogTitleId}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />
      <div className="relative bg-card rounded-lg shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 id={dialogTitleId} className="text-sm font-medium">
            {initialData ? "Edit Image" : "Add Image"}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close dialog"
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div
            className="flex gap-1 p-0.5 bg-muted rounded-md"
            role="tablist"
            aria-label="Image source options"
          >
            <button
              onClick={() => setMode("upload")}
              role="tab"
              aria-selected={mode === "upload"}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${
                mode === "upload"
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              <Upload size={12} className="inline mr-1" /> Upload
            </button>
            <button
              onClick={() => setMode("url")}
              role="tab"
              aria-selected={mode === "url"}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${
                mode === "url" ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              <LinkIcon size={12} className="inline mr-1" /> URL
            </button>
            <button
              onClick={() => setMode("storage")}
              role="tab"
              aria-selected={mode === "storage"}
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${
                mode === "storage"
                  ? "bg-card shadow-sm"
                  : "text-muted-foreground"
              }`}
            >
              Storage
            </button>
          </div>
          {error && (
            <div
              role="alert"
              className="px-2 py-1.5 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive"
            >
              {error}
            </div>
          )}
          {mode === "upload" && !url && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`border border-dashed rounded-md p-6 text-center cursor-pointer ${
                dragActive
                  ? "border-(--gold) bg-(--gold-light)/30"
                  : "border-border hover:border-muted-foreground"
              }`}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={(e) =>
                  e.target.files?.[0] && handleFile(e.target.files[0])
                }
                className="hidden"
              />
              {isUploading ? (
                <div>
                  <Loader2
                    size={20}
                    className="mx-auto text-muted-foreground animate-spin"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Uploading...
                  </p>
                </div>
              ) : (
                <>
                  <Upload
                    size={20}
                    className="mx-auto text-muted-foreground mb-1"
                  />
                  <p className="text-xs text-muted-foreground">
                    Drop or click (max 4MB)
                  </p>
                </>
              )}
            </div>
          )}
          {mode === "url" && !url && (
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 border border-input rounded-md text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
            />
          )}
          {mode === "storage" && !url && (
            <div className="max-h-64 overflow-y-auto">
              {loadingStorage ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2
                    size={20}
                    className="animate-spin text-muted-foreground"
                  />
                  <span className="ml-2 text-xs text-muted-foreground">
                    Loading...
                  </span>
                </div>
              ) : storageFiles.length === 0 ? (
                <div className="text-center py-8 text-xs text-muted-foreground">
                  No images in storage
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {storageFiles.map((file) => (
                    <button
                      key={file.key}
                      onClick={() => {
                        setUrl(file.url);
                        setMode("url");
                      }}
                      className="relative aspect-square rounded-md overflow-hidden border border-border hover:border-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {url && (
            <div className="space-y-3">
              <div className="relative group">
                <img
                  src={url}
                  alt={alt || "Image preview"}
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  onClick={() => setUrl("")}
                  aria-label="Remove image"
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Image URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1 w-full px-2 py-1.5 border border-input rounded-md bg-transparent focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Alt text
                </label>
                <input
                  type="text"
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Describe the image"
                  className="mt-1 w-full px-2 py-1.5 border border-input rounded-md text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Width
                  </label>
                  <select
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    className="mt-1 w-full px-2 py-1.5 border border-input rounded-md text-sm bg-transparent"
                  >
                    <option value="100%">Full</option>
                    <option value="75%">75%</option>
                    <option value="50%">50%</option>
                  </select>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wide block">
                    Align
                  </span>
                  <div className="mt-1 flex border border-input rounded-md overflow-hidden">
                    {(["left", "center", "right"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => setAlignment(a)}
                        aria-pressed={alignment === a}
                        className={`p-1.5 ${
                          alignment === a
                            ? "bg-foreground text-background"
                            : "text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {a === "left" && <AlignLeft size={14} />}
                        {a === "center" && <AlignCenter size={14} />}
                        {a === "right" && <AlignRight size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          {initialData && onDelete ? (
            <button
              onClick={async () => {
                if (!initialData?.src) {
                  onDelete();
                  return;
                }
                if (initialData.src.startsWith("/images/uploads/")) {
                  setDeleting(true);
                  try {
                    await deleteImage(initialData.src);
                  } catch (err) {
                    console.error("Failed to delete file:", err);
                  } finally {
                    setDeleting(false);
                  }
                }
                onDelete();
              }}
              disabled={deleting}
              className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded flex items-center gap-1 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Trash2 size={12} />
              )}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded"
            >
              Cancel
            </button>
            <button
              onClick={handleInsert}
              disabled={!url || isUploading}
              className="px-3 py-1.5 text-xs font-medium text-background bg-foreground hover:bg-foreground/90 rounded disabled:opacity-50"
            >
              {initialData ? "Update" : "Insert"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
