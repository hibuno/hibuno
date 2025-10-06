"use client";

import { motion, useTransform, useSpring, useScroll } from "framer-motion";

export function ReadingProgress() {
 const { scrollYProgress } = useScroll();

 // Create a spring animation for ultra-smooth progress
 const smoothProgress = useSpring(scrollYProgress, {
  stiffness: 100,
  damping: 30,
  restDelta: 0.001,
 });

 // Transform progress for the width animation
 const width = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

 // Transform for opacity animation
 const opacity = useTransform(smoothProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

 return (
  <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-transparent">
   <motion.div
    className="h-full bg-black relative overflow-hidden"
    style={{
     width,
     opacity,
    }}
    role="progressbar"
    aria-label="Reading progress"
   >
    {/* Add a subtle shine effect */}
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
   </motion.div>
  </div>
 );
}
