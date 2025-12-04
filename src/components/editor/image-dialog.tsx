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
import { useRef, useState } from "react";
import { uploadImage } from "./editor-utils";

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

export default function ImageDialog({
  open,
  onClose,
  onInsert,
  onDelete,
  initialData,
}: ImageDialogProps) {
  const [mode, setMode] = useState<"url" | "upload">("upload");
  const [url, setUrl] = useState(initialData?.src || "");
  const [alt, setAlt] = useState(initialData?.alt || "");
  const [width, setWidth] = useState(initialData?.width || "100%");
  const [alignment, setAlignment] = useState<"left" | "center" | "right">(
    initialData?.alignment || "center"
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Max 5MB");
      return;
    }
    setUploading(true);
    setError("");
    try {
      const uploadedUrl = await uploadImage(file);
      setUrl(uploadedUrl);
      setMode("url");
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
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
    setError("");
    setUrl(initialData?.src || "");
    setAlt(initialData?.alt || "");
    setWidth(initialData?.width || "100%");
    setAlignment(initialData?.alignment || "center");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-card rounded-lg shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium">
            {initialData ? "Edit Image" : "Add Image"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex gap-1 p-0.5 bg-muted rounded-md">
            <button
              onClick={() => setMode("upload")}
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
              className={`flex-1 py-1.5 px-2 rounded text-xs font-medium ${
                mode === "url" ? "bg-card shadow-sm" : "text-muted-foreground"
              }`}
            >
              <LinkIcon size={12} className="inline mr-1" /> URL
            </button>
          </div>
          {error && (
            <div className="px-2 py-1.5 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
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
                  ? "border-[var(--gold)] bg-[var(--gold-light)]/30"
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
              {uploading ? (
                <Loader2
                  size={20}
                  className="mx-auto text-muted-foreground animate-spin"
                />
              ) : (
                <>
                  <Upload
                    size={20}
                    className="mx-auto text-muted-foreground mb-1"
                  />
                  <p className="text-xs text-muted-foreground">Drop or click</p>
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
          {url && (
            <div className="space-y-3">
              <div className="relative group">
                <img
                  src={url}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded-md"
                />
                <button
                  onClick={() => setUrl("")}
                  className="absolute top-1 right-1 p-1 bg-black/60 rounded text-white opacity-0 group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
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
                    className="mt-1 w-full px-2 py-1.5 border border-input rounded-md text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="100%">Full</option>
                    <option value="75%">75%</option>
                    <option value="50%">50%</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
                    Align
                  </label>
                  <div className="mt-1 flex border border-input rounded-md overflow-hidden">
                    {(["left", "center", "right"] as const).map((a) => (
                      <button
                        key={a}
                        onClick={() => setAlignment(a)}
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
              onClick={onDelete}
              className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded flex items-center gap-1"
            >
              <Trash2 size={12} /> Delete
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
              disabled={!url || uploading}
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
