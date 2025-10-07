"use client";

import Image, { type ImageProps } from "next/image";
import React from "react";
import { useMediaContext } from "@/components/media-provider";
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
 clickable = false,
 caption,
 ...props
}: OptimizedImageProps) {
 const [imageSrc, setImageSrc] = React.useState(src);
 const [isLoading, setIsLoading] = React.useState(true);
 const { openDialog } = useMediaContext();

 const handleError = () => {
  if (imageSrc !== fallback) {
   setImageSrc(fallback);
  }
 };

 const handleLoad = () => {
  setIsLoading(false);
 };

 const handleClick = () => {
  if (clickable) {
   const dialogData: Parameters<typeof openDialog>[0] = {
    src: imageSrc,
    type: "image",
   };

   if (alt) dialogData.alt = alt;
   if (caption) dialogData.caption = caption;

   openDialog(dialogData);
  }
 };

 return (
  <div
   className={cn(
    "relative",
    aspectRatioClasses[aspectRatio],
    clickable && "cursor-pointer hover:opacity-90 transition-opacity",
    className
   )}
   onClick={handleClick}
  >
   <Image
    src={imageSrc}
    alt={alt}
    fill
    className={cn(
     "object-cover transition-opacity duration-300",
     isLoading ? "opacity-0" : "opacity-100"
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

export function OptimizedVideo({
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
}: OptimizedVideoProps) {
 const [isLoading, setIsLoading] = React.useState(true);
 const { openDialog } = useMediaContext();

 const handleLoad = () => {
  setIsLoading(false);
 };

 const handleClick = (e: React.MouseEvent) => {
  if (clickable && e.target === e.currentTarget) {
   // Only open dialog if clicking on the video itself, not controls
   const dialogData: Parameters<typeof openDialog>[0] = {
    src,
    type: "video",
   };

   if (caption) dialogData.caption = caption;

   openDialog(dialogData);
  }
 };

 return (
  <div
   className={cn(
    "relative",
    aspectRatioClasses[aspectRatio],
    clickable && "cursor-pointer",
    className
   )}
  >
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
    onClick={handleClick}
    preload="metadata"
   >
    Your browser does not support the video tag.
   </video>
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
 clickable = true,
 caption,
}: {
 src: string;
 alt: string;
 className?: string;
 clickable?: boolean;
 caption?: string | undefined;
}) {
 return (
  <OptimizedImage
   src={src}
   alt={alt}
   aspectRatio="video"
   className={cn(className)}
   priority
   clickable={clickable}
   {...(caption && { caption })}
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
