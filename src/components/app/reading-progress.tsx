"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { memo, useCallback, useEffect, useRef } from "react";

// Memoized shine effect component
const ShineEffect = memo(() => (
  <motion.div
    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
    initial={{ x: "-100%" }}
    animate={{ x: "100%" }}
    transition={{
      duration: 3,
      repeat: Infinity,
      repeatDelay: 5,
      ease: "easeInOut",
    }}
  />
));

ShineEffect.displayName = "ShineEffect";

// Throttle function for performance optimization
const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

export const ReadingProgress = memo(() => {
  const progressRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();

  // Create a spring animation for ultra-smooth progress with optimized settings
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform progress for the width animation
  const width = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  // Transform for opacity animation with better visibility curve
  const opacity = useTransform(
    smoothProgress, 
    [0, 0.05, 0.95, 1], 
    [0, 1, 1, 0]
  );

  // Throttled scroll handler for better performance
  const handleScroll = useCallback(
    throttle(() => {
      // Additional scroll handling if needed
    }, 16), // ~60fps
    []
  );

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <div 
      ref={progressRef}
      className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent pointer-events-none"
    >
      <motion.div
        className="h-full bg-black relative overflow-hidden"
        style={{
          width,
          opacity,
        }}
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0} // This would need to be updated with actual progress
      >
        <ShineEffect />
      </motion.div>
    </div>
  );
});

ReadingProgress.displayName = "ReadingProgress";
