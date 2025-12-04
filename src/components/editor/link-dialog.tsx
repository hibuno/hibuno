"use client";

import { ExternalLink, Unlink, X } from "lucide-react";
import { useEffect, useState } from "react";

interface LinkDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (data: {
    href: string;
    text?: string;
    title?: string;
    target?: "_blank" | "_self" | "_parent" | "_top";
  }) => void;
  initialData?: {
    href?: string;
    text?: string;
    title?: string;
    target?: "_blank" | "_self" | "_parent" | "_top";
  };
}

export default function LinkDialog({
  open,
  onClose,
  onInsert,
  initialData,
}: LinkDialogProps) {
  const [href, setHref] = useState(initialData?.href || "");
  const [openInNewTab, setOpenInNewTab] = useState(
    initialData?.target === "_blank" || !initialData?.target
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setHref(initialData.href || "");
      setOpenInNewTab(initialData.target === "_blank" || !initialData.target);
    }
  }, [initialData]);

  useEffect(() => {
    if (open) setError("");
  }, [open]);

  const handleInsert = () => {
    if (!href) {
      setError("Please enter a URL");
      return;
    }
    let finalHref = href;
    if (
      !/^https?:\/\//i.test(href) &&
      !href.startsWith("/") &&
      !href.startsWith("#")
    ) {
      finalHref = `https://${href}`;
    }
    try {
      if (!href.startsWith("/") && !href.startsWith("#")) new URL(finalHref);
    } catch {
      setError("Invalid URL");
      return;
    }
    onInsert({ href: finalHref, target: openInNewTab ? "_blank" : "_self" });
    handleClose();
  };

  const handleClose = () => {
    setError("");
    setHref(initialData?.href || "");
    setOpenInNewTab(initialData?.target === "_blank" || !initialData?.target);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleInsert();
    }
    if (e.key === "Escape") handleClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative bg-card rounded-lg shadow-2xl w-full max-w-xs mx-4 overflow-hidden animate-in">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-sm font-medium">
            {initialData?.href ? "Edit Link" : "Add Link"}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <X size={14} />
          </button>
        </div>
        <div className="p-4 pt-2 space-y-3">
          {error && (
            <div className="px-2 py-1.5 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
              {error}
            </div>
          )}
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">
              URL
            </label>
            <input
              type="text"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="example.com or /page"
              autoFocus
              className="mt-1 w-full px-3 py-2 border border-input rounded-md text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={openInNewTab}
                onChange={(e) => setOpenInNewTab(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-muted rounded-full peer-checked:bg-foreground transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-3 h-3 bg-card rounded-full shadow peer-checked:translate-x-4 transition-transform" />
            </div>
            <span className="text-xs text-muted-foreground group-hover:text-foreground flex items-center gap-1">
              <ExternalLink size={12} /> New tab
            </span>
          </label>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
          {initialData?.href ? (
            <button
              onClick={() => {
                onInsert({ href: "", target: "_self" });
                handleClose();
              }}
              className="px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded flex items-center gap-1"
            >
              <Unlink size={12} /> Remove
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
              disabled={!href}
              className="px-3 py-1.5 text-xs font-medium text-background bg-foreground hover:bg-foreground/90 rounded disabled:opacity-50"
            >
              {initialData?.href ? "Update" : "Insert"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
