"use client";

import { Plus, Trash2, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SocialMediaLink } from "@/db/types";

const PLATFORMS = [
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "youtube", label: "YouTube", icon: "▶️" },
  { value: "instagram", label: "Instagram", icon: "📷" },
  { value: "twitter", label: "Twitter/X", icon: "𝕏" },
  { value: "facebook", label: "Facebook", icon: "📘" },
] as const;

interface SocialMediaEditorProps {
  links: SocialMediaLink[];
  onChange: (links: SocialMediaLink[]) => void;
}

export default function SocialMediaEditor({
  links,
  onChange,
}: SocialMediaEditorProps) {
  const t = useTranslations("editor");
  const addLink = () => {
    onChange([...links, { platform: "tiktok", url: "", caption: "" }]);
  };

  const removeLink = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const updateLink = (
    index: number,
    field: keyof SocialMediaLink,
    value: string
  ) => {
    const updated = [...links];
    const currentLink = updated[index];
    if (!currentLink) return;
    updated[index] = {
      platform: currentLink.platform,
      url: currentLink.url,
      caption: currentLink.caption,
      [field]: value,
    } as SocialMediaLink;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {links.map((link, index) => (
        <div
          key={index}
          className="p-2 border border-border rounded-md space-y-2 bg-muted/30"
        >
          <div className="flex items-center gap-2">
            <Select
              value={link.platform}
              onValueChange={(value) =>
                updateLink(
                  index,
                  "platform",
                  value as SocialMediaLink["platform"]
                )
              }
            >
              <SelectTrigger className="h-7 text-xs flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    <span className="flex items-center gap-1.5">
                      <span>{p.icon}</span>
                      <span>{p.label}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-destructive hover:text-destructive"
              onClick={() => removeLink(index)}
              aria-label="Remove social media link"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          <Input
            type="url"
            placeholder="https://..."
            value={link.url}
            onChange={(e) => updateLink(index, "url", e.target.value)}
            className="h-7 text-xs"
          />
          <Textarea
            placeholder="Caption (optional)"
            value={link.caption || ""}
            onChange={(e) => updateLink(index, "caption", e.target.value)}
            rows={2}
            className="text-xs resize-none"
          />
          {link.url && (
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Preview link
            </a>
          )}
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        onClick={addLink}
        className="w-full h-7 text-xs"
      >
        <Plus className="w-3 h-3 mr-1" />
        {t("addSocialMediaLink")}
      </Button>
    </div>
  );
}
