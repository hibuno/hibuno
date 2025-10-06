import Image, { type ImageProps } from "next/image";
import React from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, "src"> {
  src: string;
  fallback?: string;
  className?: string;
  aspectRatio?: "video" | "square" | "portrait" | "auto";
  priority?: boolean;
}

const aspectRatioClasses = {
  video: "aspect-[16/9]",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  auto: "",
};

export function OptimizedImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  className,
  aspectRatio = "auto",
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = React.useState(src);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleError = () => {
    if (imageSrc !== fallback) {
      setImageSrc(fallback);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={cn("relative", aspectRatioClasses[aspectRatio], className)}>
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
      {isLoading && (
        <div className="absolute inset-0 animate-pulse bg-muted rounded-md" />
      )}
    </div>
  );
}

// Specific image components for common use cases
export function PostCoverImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="video"
      className={cn("rounded-md border border-border", className)}
      priority
    />
  );
}

export function AuthorAvatar({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="square"
      className={cn("rounded-full object-cover", className)}
    />
  );
}

export function PostCardImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="video"
      className={cn("rounded-md border border-border", className)}
    />
  );
}
