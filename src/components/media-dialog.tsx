"use client";

import {
  Download,
  ExternalLink,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MediaDialogProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string | undefined;
  type: "image" | "video";
  caption?: string | undefined;
}

export function MediaDialog({
  isOpen,
  onClose,
  src,
  alt,
  type,
  caption,
}: MediaDialogProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Reset zoom and rotation when dialog opens/closes or src changes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setRotation(0);
      setIsLoading(true);
    }
  }, [isOpen]);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = alt || "media";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenInNewTab = () => {
    window.open(src, "_blank");
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case "Escape":
        onClose();
        break;
      case "+":
      case "=":
        e.preventDefault();
        handleZoomIn();
        break;
      case "-":
        e.preventDefault();
        handleZoomOut();
        break;
      case "r":
      case "R":
        e.preventDefault();
        handleRotate();
        break;
      case "0":
        e.preventDefault();
        handleReset();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-auto h-auto p-0 bg-black/95 border-none">
        {/* Header with controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            {type === "image" && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-white text-sm min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownload}
              className="text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenInNewTab}
              className="text-white hover:bg-white/20"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <DialogClose asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </div>
        </div>

        {/* Media content */}
        <div className="flex items-center justify-center min-h-[50vh] max-h-[95vh] p-16">
          {type === "image" ? (
            <div className="relative max-w-full max-h-full">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
              <img
                src={src}
                alt={alt}
                className={cn(
                  "max-w-full max-h-full object-contain transition-all duration-300 ease-in-out",
                  isLoading ? "opacity-0" : "opacity-100",
                )}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center",
                }}
                onLoad={() => setIsLoading(false)}
                onError={() => setIsLoading(false)}
                draggable={false}
              />
            </div>
          ) : (
            <video
              src={src}
              controls
              className="max-w-full max-h-full"
              onLoadedData={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Caption */}
        {caption && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-center text-sm">{caption}</p>
          </div>
        )}

        {/* Keyboard shortcuts hint */}
        {type === "image" && (
          <div className="absolute bottom-4 right-4 text-white/60 text-xs">
            <div>ESC: Close • +/-: Zoom • R: Rotate • 0: Reset</div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing media dialog state
export function useMediaDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaData, setMediaData] = useState<{
    src: string;
    alt?: string | undefined;
    type: "image" | "video";
    caption?: string | undefined;
  } | null>(null);

  const openDialog = (data: {
    src: string;
    alt?: string | undefined;
    type: "image" | "video";
    caption?: string | undefined;
  }) => {
    setMediaData(data);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    // Keep mediaData for smooth closing animation
    setTimeout(() => setMediaData(null), 300);
  };

  return {
    isOpen,
    mediaData,
    openDialog,
    closeDialog,
  };
}
