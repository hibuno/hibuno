"use client";

import {
  Check,
  Facebook,
  Linkedin,
  Link as LinkIcon,
  Share2,
  Twitter,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SocialShareProps {
  url: string;
  title: string;
  className?: string;
}

export function SocialShare({ url, title, className }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
    setShowDropdown(false);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          Share:
        </span>

        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>

          {showDropdown && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />

              {/* Dropdown */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-popover border rounded-md shadow-lg z-20">
                <div className="py-1">
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleShare("twitter")}
                  >
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleShare("facebook")}
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={() => handleShare("linkedin")}
                  >
                    <Linkedin className="mr-2 h-4 w-4" />
                    LinkedIn
                  </button>
                  <button
                    className="flex items-center w-full px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="mr-2 h-4 w-4 text-green-600" />
                    ) : (
                      <LinkIcon className="mr-2 h-4 w-4" />
                    )}
                    {copied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for mobile or smaller spaces
export function SocialShareCompact({
  url,
  title,
  className,
}: SocialShareProps) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    window.open(shareLinks[platform], "_blank", "width=600,height=400");
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare("twitter")}
        className="h-8 w-8 p-0"
        aria-label="Share on Twitter"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare("facebook")}
        className="h-8 w-8 p-0"
        aria-label="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleShare("linkedin")}
        className="h-8 w-8 p-0"
        aria-label="Share on LinkedIn"
      >
        <Linkedin className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={copyToClipboard}
        className="h-8 w-8 p-0"
        aria-label="Copy link"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <LinkIcon className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
