"use client";

import { Calculator } from "lucide-react";
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

interface LaTeXDialogProps {
  open: boolean;
  onClose: () => void;
  onInsert: (latex: string, inline?: boolean) => void;
}

export default function LaTeXDialog({
  open,
  onClose,
  onInsert,
}: LaTeXDialogProps) {
  const [latex, setLatex] = useState("");
  const [inline, setInline] = useState(false);

  const handleInsert = () => {
    if (latex.trim()) {
      onInsert(latex.trim(), inline);
      setLatex("");
      setInline(false);
      onClose();
    }
  };

  const handleClose = () => {
    setLatex("");
    setInline(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator size={20} />
            Insert Math Formula
          </DialogTitle>
          <DialogDescription>
            Enter a LaTeX formula. Use standard LaTeX syntax like \frac{"{a}"}
            {"{b}"} or x^2.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="latex-input">LaTeX Formula</Label>
            <Input
              id="latex-input"
              value={latex}
              onChange={(e) => setLatex(e.target.value)}
              placeholder="E = mc^2"
              className="font-mono"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="inline-checkbox"
              checked={inline}
              onChange={(e) => setInline(e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="inline-checkbox" className="text-sm">
              Inline formula (within text)
            </Label>
          </div>

          {latex && (
            <div className="space-y-2">
              <Label>Preview:</Label>
              <div className="p-3 bg-gray-50 rounded border font-mono text-sm">
                {inline ? `$${latex}$` : `$$${latex}$$`}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleInsert} disabled={!latex.trim()}>
            Insert Formula
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
