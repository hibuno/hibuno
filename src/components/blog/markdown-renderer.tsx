"use client";

import { useEffect, useRef, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
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

    // Wrap images with react-medium-image-zoom
    const images = container.querySelectorAll("img");
    images.forEach((img) => {
      // Skip if already processed
      if (img.dataset.interactive === "true") return;

      img.dataset.interactive = "true";

      // Ensure all images have alt text for accessibility
      if (!img.alt || img.alt.trim() === "") {
        img.alt = img.title || "Image";
      }

      // Add native lazy loading for images not yet in viewport
      if (!img.loading) {
        img.loading = "lazy";
      }

      // Add decoding async for better performance
      img.decoding = "async";

      // Create a wrapper div for React component
      const wrapper = document.createElement("div");
      wrapper.className = "inline-block max-w-full";

      // Clone the image to preserve all attributes
      const imgClone = img.cloneNode(true) as HTMLImageElement;

      // Replace the original image with the wrapper
      img.parentNode?.replaceChild(wrapper, img);

      // Render React component with Zoom
      const root = createRoot(wrapper);
      root.render(
        <Zoom>
          <img
            src={imgClone.src}
            alt={imgClone.alt}
            title={imgClone.title}
            className={imgClone.className}
            loading="lazy"
            decoding="async"
          />
        </Zoom>
      );

      // Store cleanup function
      (wrapper as ElementWithCleanup)._cleanup = () => {
        root.unmount();
      };
    });

    // Convert video markdown to actual video elements
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
              class="w-full rounded-lg shadow-lg"
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

      // Clean up image wrappers
      const imageWrappers = container.querySelectorAll(
        '[data-interactive="true"]'
      );
      imageWrappers.forEach((wrapper) => {
        const cleanup = (wrapper.parentElement as ElementWithCleanup)?._cleanup;
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
  }, []);

  return (
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
