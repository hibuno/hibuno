"use client";

import { FileText, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

interface OCRDropZoneProps {
  onTextExtracted: (text: string) => void;
}

export function OCRDropZone({ onTextExtracted }: OCRDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/ai/ocr", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "OCR processing failed");
      }

      const data = await response.json();

      // Extract text from the OCR response
      // Upstage OCR returns pages array with text in each page
      let extractedText = "";

      if (data.pages && Array.isArray(data.pages)) {
        // Combine text from all pages
        extractedText = data.pages
          .map((page: any) => page.text || "")
          .filter((text: string) => text.trim())
          .join("\n\n");
      } else if (data.text) {
        extractedText = data.text;
      } else if (data.content) {
        extractedText = data.content;
      }

      if (extractedText.trim()) {
        onTextExtracted(extractedText);
      } else {
        throw new Error("No text extracted from document");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to process document";
      setError(errorMessage);
      console.error("OCR error:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={`border border-dashed rounded-md p-3 text-center cursor-pointer transition-colors ${
          isDragging
            ? "border-[var(--gold)] bg-[var(--gold-light)]/30"
            : "border-border hover:border-muted-foreground"
        } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Processing...</p>
          </div>
        ) : (
          <>
            <FileText className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
            <p className="text-xs font-medium">Upload Document</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Drop or click here
            </p>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <X className="w-3 h-3 text-destructive mt-0.5 shrink-0" />
          <p className="text-[10px] text-destructive flex-1">{error}</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.png,.jpg,.jpeg,.tiff,.bmp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={isProcessing}
      />
    </div>
  );
}
