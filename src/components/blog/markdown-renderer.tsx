"use client";

import { useEffect, useRef, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { MediaDialog, useMediaDialog } from "@/components/blog/media-dialog";
import { ErrorBoundary } from "@/components/blog/error-boundary";
import { cn } from "@/lib/content-utils";
import "@/components/renderers/renderer-styles.css";

const CalloutRenderer = lazy(
  () => import("@/components/renderers/callout-renderer")
);
const DetailsRenderer = lazy(
  () => import("@/components/renderers/details-renderer")
);

// Extend the Element interface to include cleanup function
interface ElementWithCleanup extends Element {
  _cleanup?: () => void;
}

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

    // Render callouts
    const renderCallouts = () => {
      const callouts = container.querySelectorAll(".callout[data-type]");
      callouts.forEach((callout) => {
        if (callout.hasAttribute("data-rendered")) return;

        const type = callout.getAttribute("data-type") as
          | "info"
          | "warning"
          | "success"
          | "error"
          | "tip";
        const title = callout.getAttribute("data-title") || undefined;
        const content = callout.innerHTML;

        if (!type) return;

        // Create a wrapper div for React component
        const wrapper = document.createElement("div");
        callout.parentNode?.replaceChild(wrapper, callout);

        // Render React component with error boundary
        const root = createRoot(wrapper);
        root.render(
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="animate-pulse bg-muted/50 rounded-md p-4">
                  Loading callout...
                </div>
              }
            >
              <CalloutRenderer type={type} {...(title && { title })}>
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </CalloutRenderer>
            </Suspense>
          </ErrorBoundary>
        );

        wrapper.setAttribute("data-rendered", "true");
      });
    };

    // Render collapsible sections (details)
    const renderDetails = () => {
      const detailsElements = container.querySelectorAll("details.collapsible");
      detailsElements.forEach((details) => {
        if (details.hasAttribute("data-rendered")) return;

        const summary =
          details.getAttribute("data-summary") || "Click to expand";
        const open = details.hasAttribute("open");

        // Get the content (everything except the summary)
        const contentDiv = details.querySelector(".collapsible-content");
        const content = contentDiv ? contentDiv.innerHTML : details.innerHTML;

        // Create a wrapper div for React component
        const wrapper = document.createElement("div");
        details.parentNode?.replaceChild(wrapper, details);

        // Render React component with error boundary
        const root = createRoot(wrapper);
        root.render(
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="animate-pulse bg-muted/50 rounded-md p-4">
                  Loading collapsible section...
                </div>
              }
            >
              <DetailsRenderer summary={summary} open={open}>
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </DetailsRenderer>
            </Suspense>
          </ErrorBoundary>
        );

        wrapper.setAttribute("data-rendered", "true");
      });
    };

    // Render all custom elements after a short delay to ensure content is loaded
    const renderTimeout = setTimeout(() => {
      renderCallouts();
      renderDetails();
    }, 100);

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

    // Make images clickable and ensure accessibility
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      // Skip if already processed
      if (img.dataset.interactive === "true") return;

      img.dataset.interactive = "true";
      img.style.cursor = "pointer";
      img.classList.add("hover:opacity-90", "transition-opacity");

      // Ensure all images have alt text for accessibility
      if (!img.alt || img.alt.trim() === "") {
        const caption = getMediaCaption(img);
        img.alt = caption || img.title || "Image";
      }

      // Add native lazy loading for images not yet in viewport
      if (!img.loading) {
        img.loading = "lazy";
      }

      // Add decoding async for better performance
      img.decoding = "async";

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
      (img as ElementWithCleanup)._cleanup = () => {
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
        const safeAlt = alt || "Video content";
        return `
          <div class="video-container my-6">
            <video 
              src="${src}" 
              aria-label="${safeAlt}"
              controls 
              class="w-full rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
              data-interactive="true"
              preload="metadata"
              loading="lazy"
            >
              <track kind="captions" srclang="en" label="No captions available" />
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
      (video as ElementWithCleanup)._cleanup = () => {
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
          // Try exact ID match first, then fallback to partial match
          let target = document.getElementById(headingId);
          if (!target) {
            target = container.querySelector(
              `[id="${headingId}"]`
            ) as HTMLElement;
          }
          if (!target) {
            target = container.querySelector(
              `[id$="${headingId}"]`
            ) as HTMLElement;
          }

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
      (link as ElementWithCleanup)._cleanup = () => {
        link.removeEventListener("click", handleClick);
      };
    });

    // Cleanup function
    return () => {
      clearTimeout(renderTimeout);

      // Clean up image listeners
      images.forEach((img) => {
        const cleanup = (img as ElementWithCleanup)._cleanup;
        if (cleanup) {
          cleanup();
        }
      });

      // Clean up video listeners
      videos.forEach((video) => {
        const cleanup = (video as ElementWithCleanup)._cleanup;
        if (cleanup) {
          cleanup();
        }
      });

      // Clean up TOC link listeners
      tocLinks.forEach((link) => {
        const cleanup = (link as ElementWithCleanup)._cleanup;
        if (cleanup) {
          cleanup();
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
