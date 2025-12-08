/**
 * Image compression utilities using browser-image-compression
 * Reduces file size while maintaining quality
 */

import imageCompression from "browser-image-compression";

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  quality?: number;
  initialQuality?: number;
}

/**
 * Default compression options
 */
const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1, // Maximum file size in MB
  maxWidthOrHeight: 1920, // Maximum width or height
  useWebWorker: true, // Use web worker for better performance
  quality: 0.8, // Quality (0-1)
  initialQuality: 0.8,
};

/**
 * Compress an image file
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Compressed image file
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Check if file is an image
  if (!file.type.startsWith("image/")) {
    throw new Error("File is not an image");
  }

  // Skip compression for SVG files
  if (file.type === "image/svg+xml") {
    return file;
  }

  // Skip compression for GIF files (to preserve animation)
  if (file.type === "image/gif") {
    return file;
  }

  // Merge options with defaults
  const compressionOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  try {
    // Compress the image
    const compressedFile = await imageCompression(file, compressionOptions);

    // If compressed file is larger than original, return original
    if (compressedFile.size >= file.size) {
      return file;
    }

    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compress multiple images
 * @param files - Array of image files to compress
 * @param options - Compression options
 * @param onProgress - Progress callback
 * @returns Array of compressed image files
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressedFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (!file) continue;

    if (onProgress) {
      onProgress(i + 1, files.length);
    }

    try {
      const compressedFile = await compressImage(file, options);
      compressedFiles.push(compressedFile);
    } catch (error) {
      console.error(`Failed to compress ${file.name}:`, error);
      // Add original file if compression fails
      compressedFiles.push(file);
    }
  }

  return compressedFiles;
}

/**
 * Check if image needs compression
 * @param file - The image file to check
 * @param maxSizeMB - Maximum file size in MB
 * @returns True if image needs compression
 */
export function needsCompression(file: File, maxSizeMB: number = 1): boolean {
  // Skip non-images
  if (!file.type.startsWith("image/")) {
    return false;
  }

  // Skip SVG and GIF
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return false;
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size > maxSizeBytes;
}

/**
 * Get image dimensions from file
 * @param file - The image file
 * @returns Promise with width and height
 */
export async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.src = url;
  });
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Compress image with preview
 * Useful for showing before/after comparison
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Object with original and compressed files, plus metadata
 */
export async function compressImageWithPreview(
  file: File,
  options: CompressionOptions = {}
) {
  const originalDimensions = await getImageDimensions(file);
  const compressedFile = await compressImage(file, options);
  const compressedDimensions = await getImageDimensions(compressedFile);

  const originalSize = file.size;
  const compressedSize = compressedFile.size;
  const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(
    1
  );

  return {
    original: {
      file,
      size: originalSize,
      dimensions: originalDimensions,
      url: URL.createObjectURL(file),
    },
    compressed: {
      file: compressedFile,
      size: compressedSize,
      dimensions: compressedDimensions,
      url: URL.createObjectURL(compressedFile),
    },
    metadata: {
      compressionRatio: parseFloat(compressionRatio),
      sizeSaved: originalSize - compressedSize,
    },
  };
}

/**
 * Compress image for upload with automatic quality adjustment
 * @param file - The image file to compress
 * @param targetSizeMB - Target file size in MB
 * @returns Compressed image file
 */
export async function compressForUpload(
  file: File,
  targetSizeMB: number = 1
): Promise<File> {
  // Skip if already small enough
  if (file.size <= targetSizeMB * 1024 * 1024) {
    return file;
  }

  // Try compression with default quality first
  let compressedFile = await compressImage(file, {
    maxSizeMB: targetSizeMB,
    maxWidthOrHeight: 1920,
    quality: 0.8,
  });

  // If still too large, try with lower quality
  if (compressedFile.size > targetSizeMB * 1024 * 1024) {
    compressedFile = await compressImage(file, {
      maxSizeMB: targetSizeMB,
      maxWidthOrHeight: 1920,
      quality: 0.6,
    });
  }

  // If still too large, try with even lower quality and smaller dimensions
  if (compressedFile.size > targetSizeMB * 1024 * 1024) {
    compressedFile = await compressImage(file, {
      maxSizeMB: targetSizeMB,
      maxWidthOrHeight: 1280,
      quality: 0.5,
    });
  }

  return compressedFile;
}
