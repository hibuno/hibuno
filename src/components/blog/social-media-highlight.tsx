"use client";

import LiteYouTubeEmbed from "react-lite-youtube-embed";
import "react-lite-youtube-embed/dist/LiteYouTubeEmbed.css";
import type { SocialMediaLink } from "@/db/types";

const PLATFORM_CONFIG = {
  tiktok: {
    label: "TikTok",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    color: "bg-black text-white dark:bg-white dark:text-black",
  },
  youtube: {
    label: "YouTube",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    color: "bg-red-600 text-white",
  },
  instagram: {
    label: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    color:
      "bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white",
  },
  twitter: {
    label: "Twitter/X",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "bg-black text-white dark:bg-white dark:text-black",
  },
  facebook: {
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: "bg-blue-600 text-white",
  },
};

// Extract video ID from various URL formats
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

// Check if URL is a YouTube Shorts
function isYouTubeShorts(url: string): boolean {
  return url.includes("youtube.com/shorts/");
}

// Link card for platforms (TikTok, Instagram, Twitter, Facebook)
function LinkCard({
  link,
  config,
}: {
  link: SocialMediaLink;
  config: (typeof PLATFORM_CONFIG)[keyof typeof PLATFORM_CONFIG];
}) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 mb-2">
          <div className={`p-2 rounded-lg ${config.color}`}>{config.icon}</div>
          <span className="font-medium text-sm">{config.label}</span>
        </div>
        {link.caption && (
          <p className="text-xs text-muted-foreground line-clamp-3">
            {link.caption}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
          <span>Buka di {config.label}</span>
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}

// Single social media item with embed support
function SocialMediaItem({ link }: { link: SocialMediaLink }) {
  const config = PLATFORM_CONFIG[link.platform];

  // YouTube - use LiteYouTubeEmbed for performance
  if (link.platform === "youtube") {
    const videoId = getYouTubeVideoId(link.url);
    const isShorts = isYouTubeShorts(link.url);

    if (videoId) {
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${config.color}`}>{config.icon}</div>
            <span className="font-medium text-sm">
              {isShorts ? "YouTube Shorts" : config.label}
            </span>
          </div>
          {isShorts ? (
            // YouTube Shorts - 9:16 aspect ratio with iframe
            <div className="aspect-[9/16] max-h-[500px] w-full rounded-lg overflow-hidden bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title={link.caption || "YouTube Shorts"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          ) : (
            // Regular YouTube video - 16:9 aspect ratio
            <div className="rounded-lg overflow-hidden">
              <LiteYouTubeEmbed
                id={videoId}
                title={link.caption || "YouTube video"}
                poster="hqdefault"
                webp
              />
            </div>
          )}
          {link.caption && (
            <p className="text-xs text-muted-foreground">{link.caption}</p>
          )}
        </div>
      );
    }
  }

  // All other platforms - use link card
  return <LinkCard link={link} config={config} />;
}

interface SocialMediaHighlightProps {
  links: SocialMediaLink[];
}

export default function SocialMediaHighlight({
  links,
}: SocialMediaHighlightProps) {
  if (!links || links.length === 0) return null;

  return (
    <div className="sticky top-24 space-y-4">
      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Lihat juga di
      </h3>
      <div className="space-y-4">
        {links.map((link, index) => (
          <SocialMediaItem key={index} link={link} />
        ))}
      </div>
    </div>
  );
}
