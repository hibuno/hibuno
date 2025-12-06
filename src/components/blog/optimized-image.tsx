"use client";

import Image, { type ImageProps } from "next/image";
import { memo, useCallback, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/content-utils";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string;
  fallback?: string;
  className?: string;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
  priority?: boolean;
  clickable?: boolean;
  caption?: string | undefined;
  /** Enable lazy loading with intersection observer */
  lazyLoad?: boolean;
  /** Preload image before it enters viewport */
  preloadOffset?: string;
}

interface OptimizedVideoProps {
  src: string;
  className?: string;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
  clickable?: boolean;
  caption?: string | undefined;
  controls?: boolean;
  autoPlay?: boolean;
  muted?: boolean;
  loop?: boolean;
  poster?: string;
  /** Enable lazy loading with intersection observer */
  lazyLoad?: boolean;
  /** Preload video before it enters viewport */
  preloadOffset?: string;
}

// Memoized aspect ratio classes to prevent recreation
const ASPECT_RATIO_CLASSES = {
  video: "aspect-[16/9]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  auto: "",
} as const;

// Default fallback image
const DEFAULT_FALLBACK = "/placeholder.svg";

// Memoized loading skeleton component
const LoadingSkeleton = memo(() => (
  <div className="absolute inset-0 animate-pulse bg-muted rounded-md" />
));

LoadingSkeleton.displayName = "LoadingSkeleton";

export const OptimizedImage = memo(
  ({
    src,
    alt,
    fallback = DEFAULT_FALLBACK,
    className,
    aspectRatio = "auto",
    priority = false,
    clickable = false,
    caption,
    lazyLoad = true,
    preloadOffset = "200px",
    ...props
  }: OptimizedImageProps) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [isInView, setIsInView] = useState(priority || !lazyLoad);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading with preload offset
    useEffect(() => {
      if (priority || !lazyLoad || isInView) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: preloadOffset, // Preload before entering viewport
          threshold: 0,
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, [priority, lazyLoad, preloadOffset, isInView]);

    const handleError = useCallback(() => {
      if (imageSrc !== fallback && !hasError) {
        setImageSrc(fallback);
        setHasError(true);
      }
    }, [imageSrc, fallback, hasError]);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
    }, []);

    // Reset state when src changes
    useEffect(() => {
      if (src !== imageSrc && !hasError) {
        setImageSrc(src);
        setIsLoading(true);
      }
    }, [src, imageSrc, hasError]);

    // Ensure alt text is always present for accessibility
    const safeAlt = alt || caption || "Image";

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative",
          ASPECT_RATIO_CLASSES[aspectRatio],
          clickable && "cursor-pointer hover:opacity-90 transition-opacity",
          className
        )}
      >
        {isInView ? (
          <Image
            src={imageSrc}
            alt={safeAlt}
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100"
            )}
            onError={handleError}
            onLoad={handleLoad}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            {...props}
          />
        ) : null}
        {(isLoading || !isInView) && <LoadingSkeleton />}
      </div>
    );
  }
);

OptimizedImage.displayName = "OptimizedImage";

export const OptimizedVideo = memo(
  ({
    src,
    className,
    aspectRatio = "video",
    clickable = false,
    caption,
    controls = true,
    autoPlay = false,
    muted = false,
    loop = false,
    poster,
    lazyLoad = true,
    preloadOffset = "200px",
  }: OptimizedVideoProps) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isInView, setIsInView] = useState(!lazyLoad);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for lazy loading with preload offset
    useEffect(() => {
      if (!lazyLoad || isInView) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: preloadOffset, // Preload before entering viewport
          threshold: 0,
        }
      );

      if (containerRef.current) {
        observer.observe(containerRef.current);
      }

      return () => observer.disconnect();
    }, [lazyLoad, preloadOffset, isInView]);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
    }, []);

    // Ensure accessible label
    const ariaLabel = caption || "Video content";

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative",
          ASPECT_RATIO_CLASSES[aspectRatio],
          clickable && "cursor-pointer",
          className
        )}
      >
        {isInView ? (
          <video
            src={src}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100",
              clickable && "hover:opacity-90 transition-opacity"
            )}
            controls={controls}
            autoPlay={autoPlay}
            muted={muted}
            loop={loop}
            poster={poster}
            onLoadedData={handleLoad}
            preload="metadata"
            aria-label={ariaLabel}
          >
            <track kind="captions" srcLang="en" label="No captions available" />
            Your browser does not support the video tag.
          </video>
        ) : null}
        {(isLoading || !isInView) && <LoadingSkeleton />}
      </div>
    );
  }
);

OptimizedVideo.displayName = "OptimizedVideo";

// Specific image components for common use cases
export const PostCoverImage = memo(
  ({
    src,
    alt,
    className,
    clickable = true,
    caption,
  }: {
    src: string;
    alt: string;
    className?: string;
    clickable?: boolean;
    caption?: string | undefined;
  }) => (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="video"
      className={cn(className)}
      priority
      clickable={clickable}
      {...(caption && { caption })}
    />
  )
);

PostCoverImage.displayName = "PostCoverImage";

export const AuthorAvatar = memo(
  ({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) => (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="square"
      className={cn("rounded-full object-cover", className)}
    />
  )
);

AuthorAvatar.displayName = "AuthorAvatar";
