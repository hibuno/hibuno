"use client";

import { useEffect, useRef } from "react";
import { MediaDialog, useMediaDialog } from "@/components/media-dialog";
import { cn } from "@/lib/utils";

interface InteractiveMarkdownRendererProps {
 html: string;
 className?: string | undefined;
}

export function InteractiveMarkdownRenderer({
 html,
 className,
}: InteractiveMarkdownRendererProps) {
 const contentRef = useRef<HTMLDivElement>(null);
 const { isOpen, mediaData, openDialog, closeDialog } = useMediaDialog();

 useEffect(() => {
  if (!contentRef.current) return;

  const container = contentRef.current;

  // Function to extract caption from image/video context
  const getMediaCaption = (element: HTMLElement): string | undefined => {
   // Check for alt text
   const alt = element.getAttribute("alt");
   if (alt?.trim()) return alt;

   // Check for title attribute
   const title = element.getAttribute("title");
   if (title?.trim()) return title;

   // Check for figcaption in parent figure
   const figure = element.closest("figure");
   if (figure) {
    const figcaption = figure.querySelector("figcaption");
    if (figcaption?.textContent?.trim()) {
     return figcaption.textContent.trim();
    }
   }

   // Check for caption in next sibling
   const nextSibling = element.nextElementSibling;
   if (
    nextSibling &&
    (nextSibling.tagName.toLowerCase() === "p" ||
     nextSibling.classList.contains("caption") ||
     nextSibling.classList.contains("image-caption"))
   ) {
    const text = nextSibling.textContent?.trim();
    if (text && text.length < 200) {
     // Reasonable caption length
     return text;
    }
   }

   return undefined;
  };

  // Make images clickable
  const images = container.querySelectorAll("img");
  images.forEach((img) => {
   // Skip if already processed
   if (img.dataset.interactive === "true") return;

   img.dataset.interactive = "true";
   img.style.cursor = "pointer";
   img.classList.add("hover:opacity-90", "transition-opacity");

   const handleClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const src = img.src || img.getAttribute("data-src");
    if (!src) return;

    const dialogData: Parameters<typeof openDialog>[0] = {
     src,
     type: "image",
    };

    if (img.alt) dialogData.alt = img.alt;

    const caption = getMediaCaption(img);
    if (caption) dialogData.caption = caption;

    openDialog(dialogData);
   };

   img.addEventListener("click", handleClick);

   // Store cleanup function
   (img as any)._cleanup = () => {
    img.removeEventListener("click", handleClick);
   };
  });

  // Convert video markdown to actual video elements and make them clickable
  const processVideoElements = () => {
   // Find video links in markdown format: ![alt](video.mp4)
   const videoLinkRegex =
    /!\[([^\]]*)\]\(([^)]+\.(mp4|webm|ogg|mov|avi|mkv)[^)]*)\)/gi;
   let updatedHtml = container.innerHTML;
   let hasChanges = false;

   updatedHtml = updatedHtml.replace(videoLinkRegex, (_match, alt, src) => {
    hasChanges = true;
    return `
          <div class="video-container my-6">
            <video 
              src="${src}" 
              alt="${alt || ""}"
              controls 
              class="w-full rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              data-interactive="true"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            ${
             alt
              ? `<p class="text-sm text-muted-foreground mt-2 text-center italic">${alt}</p>`
              : ""
            }
          </div>
        `;
   });

   if (hasChanges) {
    container.innerHTML = updatedHtml;
   }
  };

  // Process video elements
  processVideoElements();

  // Make video elements clickable
  const videos = container.querySelectorAll('video[data-interactive="true"]');
  videos.forEach((video) => {
   const handleClick = (e: Event) => {
    // Only open dialog if not clicking on controls
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === "video") {
     e.preventDefault();
     e.stopPropagation();

     const src = (video as HTMLVideoElement).src;
     if (!src) return;

     const dialogData: Parameters<typeof openDialog>[0] = {
      src,
      type: "video",
     };

     const alt = video.getAttribute("alt");
     if (alt) dialogData.alt = alt;

     const caption = getMediaCaption(video as HTMLElement);
     if (caption) dialogData.caption = caption;

     openDialog(dialogData);
    }
   };

   video.addEventListener("click", handleClick);

   // Store cleanup function
   (video as any)._cleanup = () => {
    video.removeEventListener("click", handleClick);
   };
  });

  // Handle TOC link clicks for smooth scrolling
  const tocLinks = container.querySelectorAll(".toc-link");
  tocLinks.forEach((link) => {
   const handleClick = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();

    const headingId = (link as HTMLElement).getAttribute("data-heading-id");
    if (headingId) {
     const target = container.querySelector(`[id$="${headingId}"]`);
     if (target) {
      const elementTop =
       target.getBoundingClientRect().top + window.pageYOffset;
      const offset = 80; // Offset for fixed header
      window.scrollTo({
       top: elementTop - offset,
       behavior: "smooth",
      });
     }
    }
   };

   link.addEventListener("click", handleClick);

   // Store cleanup function
   (link as any)._cleanup = () => {
    link.removeEventListener("click", handleClick);
   };
  });

  // Cleanup function
  return () => {
   // Clean up image listeners
   images.forEach((img) => {
    if ((img as any)._cleanup) {
     (img as any)._cleanup();
    }
   });

   // Clean up video listeners
   videos.forEach((video) => {
    if ((video as any)._cleanup) {
     (video as any)._cleanup();
    }
   });

   // Clean up TOC link listeners
   tocLinks.forEach((link) => {
    if ((link as any)._cleanup) {
     (link as any)._cleanup();
    }
   });
  };
 }, [openDialog]);

 return (
  <>
   <article
    ref={contentRef}
    className={cn(
     "prose prose-zinc dark:prose-invert max-w-none prose-custom",
     // Enhanced styles for interactive media
     "[&_img]:transition-all [&_img]:duration-200",
     "[&_video]:transition-all [&_video]:duration-200",
     "[&_.video-container]:my-6",
     className
    )}
    dangerouslySetInnerHTML={{ __html: html }}
   />

   {mediaData && (
    <MediaDialog
     isOpen={isOpen}
     onClose={closeDialog}
     src={mediaData.src}
     type={mediaData.type}
     {...(mediaData.alt && { alt: mediaData.alt })}
     {...(mediaData.caption && { caption: mediaData.caption })}
    />
   )}
  </>
 );
}

// Server-side wrapper that renders markdown to HTML and passes it to the interactive component
interface MarkdownRendererProps {
 markdown: string;
 className?: string | undefined;
}

export default function MarkdownRenderer({
 markdown,
 className,
}: MarkdownRendererProps) {
 // Pass content directly as HTML (no markdown conversion needed)

 return (
  <InteractiveMarkdownRenderer
   html={markdown} // Content is already HTML
   {...(className && { className })}
  />
 );
}
