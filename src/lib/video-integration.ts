import { mkdirSync } from "fs";
import path from "path";

export interface VideoGenerationData {
  title: string;
  audioUrl: string;
  assets: Array<{
    type: "image" | "video";
    url: string;
    alt?: string;
  }>;
  narrationStyle: string;
  voiceSettings: {
    voiceId: string;
    model: string;
    voiceSettings: {
      stability: number;
      similarity_boost: number;
      style: number;
      use_speaker_boost: boolean;
    };
  };
  postSlug: string;
}

export interface VideoGenerationResult {
  success: boolean;
  videoUrl?: string;
  videoPath?: string;
  error?: string;
  metadata?: {
    duration: number;
    size: number;
    format: string;
  };
}

/**
 * Generates a video using Remotion based on form data from the admin interface
 */
export async function generateVideoWithRemotion(
  data: VideoGenerationData,
): Promise<VideoGenerationResult> {
  try {
    console.log("Starting Remotion video generation with data:", data);

    // Create output directory if it doesn't exist
    const outputDir = path.join(process.cwd(), "public", "videos");
    mkdirSync(outputDir, { recursive: true });

    // Generate unique video ID
    const videoId = `video_${data.postSlug}_${Date.now()}`;
    const outputPath = path.join(outputDir, `${videoId}.mp4`);

    console.log("Output path:", outputPath);

    // For now, we'll use a simplified approach that calls the existing CLI
    // This can be enhanced later to use Remotion directly
    const { generateVideoFromData } = await import(
      "./generate-video-from-data"
    );

    const result = await generateVideoFromData({
      audioPath: data.audioUrl,
      mediaUrls: data.assets.map((asset) => asset.url),
      titleText: data.title,
      outputPath,
      postSlug: data.postSlug,
    });

    if (!result.success) {
      return {
        success: false,
        error: result.error || "Video generation failed",
      };
    }

    // Get file stats
    const fs = await import("fs");
    const stats = fs.statSync(outputPath);

    return {
      success: true,
      videoUrl: `/videos/${videoId}.mp4`,
      videoPath: outputPath,
      metadata: {
        duration: 90, // Default duration, can be calculated from audio
        size: stats.size,
        format: "mp4",
      },
    };
  } catch (error) {
    console.error("Error generating video with Remotion:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Validates video generation data before processing
 */
export function validateVideoGenerationData(data: VideoGenerationData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.title?.trim()) {
    errors.push("Title is required");
  }

  if (!data.audioUrl?.trim()) {
    errors.push("Audio URL is required");
  }

  if (!data.assets?.length) {
    errors.push("At least one asset is required");
  }

  if (!data.postSlug?.trim()) {
    errors.push("Post slug is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Cleans up old generated videos (optional utility)
 */
export async function cleanupOldVideos(
  maxAge: number = 24 * 60 * 60 * 1000,
): Promise<void> {
  try {
    const fs = await import("fs");
    const path = await import("path");

    const videosDir = path.join(process.cwd(), "public", "videos");
    const files = fs.readdirSync(videosDir);

    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(videosDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old video: ${file}`);
      }
    }
  } catch (error) {
    console.error("Error cleaning up old videos:", error);
  }
}
