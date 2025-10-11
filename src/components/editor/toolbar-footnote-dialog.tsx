"use client";

import { FileText } from "lucide-react";
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

interface ToolbarFootnoteDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (data: { id: string; text: string }) => void;
  initialData?: {
    id?: string;
    text?: string;
  };
}

export default function ToolbarFootnoteDialog({
  open,
  onClose,
  onInsert,
  initialData,
}: ToolbarFootnoteDialogProps) {
  const [footnoteId, setFootnoteId] = useState(initialData?.id || "");
  const [footnoteText, setFootnoteText] = useState(initialData?.text || "");

  const handleInsert = () => {
    if (footnoteId.trim() && footnoteText.trim()) {
      onInsert({
        id: footnoteId.trim(),
        text: footnoteText.trim(),
      });
      setFootnoteId("");
      setFootnoteText("");
      onClose();
    }
  };

  const handleClose = () => {
    setFootnoteId("");
    setFootnoteText("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText size={20} />
            Insert Footnote
          </DialogTitle>
          <DialogDescription>
            Add a footnote reference to your document.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="footnote-id">Footnote Number *</Label>
            <Input
              id="footnote-id"
              value={footnoteId}
              onChange={(e) => setFootnoteId(e.target.value)}
              placeholder="e.g., 1, 2, 3"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="footnote-text">Footnote Text *</Label>
            <Input
              id="footnote-text"
              value={footnoteText}
              onChange={(e) => setFootnoteText(e.target.value)}
              placeholder="Enter the footnote content"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleInsert}
            disabled={!footnoteId.trim() || !footnoteText.trim()}
          >
            Insert Footnote
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
