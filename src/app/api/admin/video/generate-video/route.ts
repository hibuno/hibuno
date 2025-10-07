import { type NextRequest, NextResponse } from "next/server";
import {
  generateVideoWithRemotion,
  validateVideoGenerationData,
  type VideoGenerationData,
} from "@/lib/video-integration";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, audioUrl, assets, postSlug, narrationStyle, voiceSettings } =
      body;

    // Prepare data for video generation
    const videoData: VideoGenerationData = {
      title,
      audioUrl,
      assets,
      postSlug,
      narrationStyle,
      voiceSettings,
    };

    // Validate the input data
    const validation = validateVideoGenerationData(videoData);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.errors,
        },
        { status: 400 },
      );
    }

    console.log("Starting video generation with Remotion for:", title);

    // Generate video using Remotion
    const result = await generateVideoWithRemotion(videoData);

    if (!result.success) {
      console.error("Video generation failed:", result.error);
      return NextResponse.json(
        {
          error: "Video generation failed",
          details: result.error,
        },
        { status: 500 },
      );
    }

    console.log("Video generated successfully:", result.videoUrl);

    return NextResponse.json({
      videoUrl: result.videoUrl,
      videoId: result.videoUrl?.split("/").pop()?.replace(".mp4", ""),
      title,
      status: "completed",
      metadata: result.metadata,
      generationLog: `Video generated successfully in ${result.metadata?.duration}s`,
    });
  } catch (error) {
    console.error("Error in generate-video API:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
