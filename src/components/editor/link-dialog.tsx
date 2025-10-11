"use client";

import { ExternalLink, Unlink } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [text, setText] = useState(initialData?.text || "");
  const [title, setTitle] = useState(initialData?.title || "");
  const [target, setTarget] = useState<"_blank" | "_self" | "_parent" | "_top">(
    initialData?.target || "_blank",
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setHref(initialData.href || "");
      setText(initialData.text || "");
      setTitle(initialData.title || "");
      setTarget(initialData.target || "_blank");
    }
  }, [initialData]);

  const handleInsert = () => {
    if (!href) {
      setError("Please provide a URL");
      return;
    }

    // Basic URL validation
    try {
      new URL(href);
    } catch {
      setError("Please provide a valid URL");
      return;
    }

    onInsert({
      href,
      ...(text && { text }),
      ...(title && { title }),
      target,
    });
    onClose();
  };

  const handleClose = () => {
    setError("");
    setHref(initialData?.href || "");
    setText(initialData?.text || "");
    setTitle(initialData?.title || "");
    setTarget(initialData?.target || "_blank");
    onClose();
  };

  const handleUnlink = () => {
    onInsert({
      href: "",
      text: "",
      title: "",
      target: "_self",
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Link" : "Insert Link"}</DialogTitle>
          <DialogDescription>
            {initialData
              ? "Edit the link properties below."
              : "Add a hyperlink to your content."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="link-url">URL *</Label>
            <Input
              id="link-url"
              type="url"
              value={href}
              onChange={(e) => setHref(e.target.value)}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-text">Link Text (optional)</Label>
            <Input
              id="link-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Link display text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-title">Title (optional)</Label>
            <Input
              id="link-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tooltip text"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link-target">Target</Label>
            <select
              id="link-target"
              value={target}
              onChange={(e) =>
                setTarget(
                  e.target.value as "_blank" | "_self" | "_parent" | "_top",
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="_blank">New tab (_blank)</option>
              <option value="_self">Same tab (_self)</option>
              <option value="_parent">Parent frame (_parent)</option>
              <option value="_top">Top frame (_top)</option>
            </select>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {initialData && (
            <Button variant="outline" onClick={handleUnlink}>
              <Unlink size={16} className="mr-2" />
              Remove Link
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleInsert} disabled={!href}>
              {initialData ? "Update Link" : "Insert Link"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
