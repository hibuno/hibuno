"use client";

import Image, { type ImageProps } from "next/image";
import { memo, useCallback, useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string;
  fallback?: string;
  className?: string;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
  priority?: boolean;
  clickable?: boolean;
  caption?: string | undefined;
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
}

// Memoized aspect ratio classes to prevent recreation
const ASPECT_RATIO_CLASSES = {
  video: "aspect-[16/9]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  auto: "",
} as const;

// Default fallback image
const DEFAULT_FALLBACK = "/placeholder.png";

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
    ...props
  }: OptimizedImageProps) => {
    const [imageSrc, setImageSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

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
    const handleSrcChange = useCallback(() => {
      if (src !== imageSrc && !hasError) {
        setImageSrc(src);
        setIsLoading(true);
      }
    }, [src, imageSrc, hasError]);

    // Effect to handle src changes
    if (src !== imageSrc && !hasError) {
      handleSrcChange();
    }

    return (
      <div
        className={cn(
          "relative",
          ASPECT_RATIO_CLASSES[aspectRatio],
          clickable && "cursor-pointer hover:opacity-90 transition-opacity",
          className,
        )}
      >
        <Image
          src={imageSrc}
          alt={alt}
          fill
          className={cn(
            "object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
          )}
          onError={handleError}
          onLoad={handleLoad}
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          {...props}
        />
        {isLoading && <LoadingSkeleton />}
      </div>
    );
  },
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
  }: OptimizedVideoProps) => {
    const [isLoading, setIsLoading] = useState(true);

    const handleLoad = useCallback(() => {
      setIsLoading(false);
    }, []);

    return (
      <div
        className={cn(
          "relative",
          ASPECT_RATIO_CLASSES[aspectRatio],
          clickable && "cursor-pointer",
          className,
        )}
      >
        <video
          src={src}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            clickable && "hover:opacity-90 transition-opacity",
          )}
          controls={controls}
          autoPlay={autoPlay}
          muted={muted}
          loop={loop}
          poster={poster}
          onLoadedData={handleLoad}
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
        {isLoading && <LoadingSkeleton />}
      </div>
    );
  },
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
  ),
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
  ),
);

AuthorAvatar.displayName = "AuthorAvatar";

export const PostCardImage = memo(
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
      aspectRatio="video"
      className={cn("rounded-md border border-border", className)}
    />
  ),
);

PostCardImage.displayName = "PostCardImage";
