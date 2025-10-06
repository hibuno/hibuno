"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LazySectionProps {
 children: React.ReactNode;
 className?: string;
 fallback?: React.ReactNode;
 rootMargin?: string;
 threshold?: number;
}

export function LazySection({
 children,
 className,
 fallback,
 rootMargin = "50px",
 threshold = 0.1,
}: LazySectionProps) {
 const [isVisible, setIsVisible] = useState(false);
 const [hasLoaded, setHasLoaded] = useState(false);
 const sectionRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const observer = new IntersectionObserver(
   (entries) => {
    const [entry] = entries;
    if (entry?.isIntersecting && !hasLoaded) {
     setIsVisible(true);
     setHasLoaded(true);
     observer.disconnect();
    }
   },
   {
    rootMargin,
    threshold,
   }
  );

  if (sectionRef.current) {
   observer.observe(sectionRef.current);
  }

  return () => observer.disconnect();
 }, [rootMargin, threshold, hasLoaded]);

 return (
  <div ref={sectionRef} className={cn("min-h-[200px]", className)}>
   {isVisible
    ? children
    : fallback || <div className="animate-pulse bg-muted rounded-md h-48" />}
  </div>
 );
}

// Hook for lazy loading data
export function useLazyLoad<T>(
 loadFn: () => Promise<T>,
 dependencies: React.DependencyList = []
) {
 const [data, setData] = useState<T | null>(null);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<Error | null>(null);

 const loadData = async () => {
  if (loading || data) return;

  setLoading(true);
  setError(null);

  try {
   const result = await loadFn();
   setData(result);
  } catch (err) {
   setError(err instanceof Error ? err : new Error("Failed to load data"));
  } finally {
   setLoading(false);
  }
 };

 return { data, loading, error, loadData };
}
