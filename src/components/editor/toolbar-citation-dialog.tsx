"use client";

import { Quote as QuoteIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

interface ToolbarCitationDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (data: { id: string; text: string; url?: string }) => void;
  initialData?: {
    id?: string;
    text?: string;
    url?: string;
  };
}

export default function ToolbarCitationDialog({
  open,
  onClose,
  onInsert,
  initialData,
}: ToolbarCitationDialogProps) {
  const [citationId, setCitationId] = useState(initialData?.id || "");
  const [citationText, setCitationText] = useState(initialData?.text || "");
  const [citationUrl, setCitationUrl] = useState(initialData?.url || "");

  const handleInsert = () => {
    if (citationId.trim() && citationText.trim()) {
      const citationData: { id: string; text: string; url?: string } = {
        id: citationId.trim(),
        text: citationText.trim(),
      };

      if (citationUrl.trim()) {
        citationData.url = citationUrl.trim();
      }

      onInsert(citationData);
      setCitationId("");
      setCitationText("");
      setCitationUrl("");
      onClose();
    }
  };

  const handleClose = () => {
    setCitationId("");
    setCitationText("");
    setCitationUrl("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QuoteIcon size={20} />
            Insert Citation
          </DialogTitle>
          <DialogDescription>
            Add a citation reference to your document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="citation-id">Citation ID *</Label>
            <Input
              id="citation-id"
              value={citationId}
              onChange={(e) => setCitationId(e.target.value)}
              placeholder="e.g., smith2023, doe2019"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="citation-text">Citation Text *</Label>
            <Input
              id="citation-text"
              value={citationText}
              onChange={(e) => setCitationText(e.target.value)}
              placeholder="e.g., Smith, J. (2023). Research Methods in Computer Science"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="citation-url">URL (optional)</Label>
            <Input
              id="citation-url"
              type="url"
              value={citationUrl}
              onChange={(e) => setCitationUrl(e.target.value)}
              placeholder="https://example.com/paper.pdf"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleInsert}
            disabled={!citationId.trim() || !citationText.trim()}
          >
            Insert Citation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
