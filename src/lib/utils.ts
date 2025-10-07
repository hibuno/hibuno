import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Enhanced stats calculation with more metrics
export function calculateStats(content: string) {
  const plainText = content
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/<[^>]*>/g, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "");

  const words = plainText.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTime = Math.ceil(wordCount / 200);
  const characters = plainText.length;
  const charactersNoSpaces = plainText.replace(/\s/g, "").length;

  // Count headers, images, links
  const headers = (content.match(/^#{1,6}\s/gm) || []).length;
  const images = (content.match(/!\[([^\]]*)\]\([^)]+\)/g) || []).length;
  const links = (content.match(/\[([^\]]+)\]\([^)]+\)/g) || []).length;
  const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;

  return {
    wordCount,
    readingTime,
    characters,
    charactersNoSpaces,
    headers,
    images,
    links,
    codeBlocks,
  };
}
