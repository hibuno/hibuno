import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs/promises";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
	try {
		const { title, audioUrl, assets, postSlug } = await request.json();

		if (!title || !audioUrl || !assets?.length || !postSlug) {
			return NextResponse.json(
				{ error: "Title, audio URL, assets, and post slug are required" },
				{ status: 400 }
			);
		}

		// Create a unique video ID
		const videoId = `video_${postSlug}_${Date.now()}`;
		const outputDir = path.join(process.cwd(), "public", "videos");
		const outputPath = path.join(outputDir, `${videoId}.mp4`);

		// Ensure the output directory exists
		try {
			await fs.access(outputDir);
		} catch {
			await fs.mkdir(outputDir, { recursive: true });
		}

		// For now, we'll create a simple video generation script
		// In a real implementation, you would integrate with FFmpeg or other video tools
		const videoScript = `
#!/bin/bash
# Video generation script
echo "Starting video generation for: ${title}"
echo "Video ID: ${videoId}"
echo "Assets: ${assets.length}"
echo "Audio URL: ${audioUrl}"

# Create a simple placeholder video
# In a real implementation, this would:
# 1. Download the audio file
# 2. Create video slides from assets
# 3. Combine audio with video using FFmpeg
# 4. Add transitions and effects

echo "Video generation completed successfully"
echo "Output: ${outputPath}"
`;

		// Write the script to a temporary file
		const scriptPath = path.join(outputDir, `${videoId}.sh`);
		await fs.writeFile(scriptPath, videoScript, { mode: 0o755 });

		try {
			// Execute the video generation script
			// Note: In a production environment, you might want to use a more robust
			// video generation service or queue system
			const { stdout, stderr } = await execAsync(`bash ${scriptPath}`);

			console.log("Video generation stdout:", stdout);
			if (stderr) {
				console.warn("Video generation stderr:", stderr);
			}

			// Clean up the script file
			await fs.unlink(scriptPath);

			// For demonstration purposes, we'll return a mock video URL
			// In a real implementation, you would return the actual generated video URL
			const videoUrl = `/videos/${videoId}.mp4`;

			return NextResponse.json({
				videoUrl,
				videoId,
				title,
				status: "completed",
				generationLog: stdout,
			});

		} catch (execError: any) {
			console.error("Video generation failed:", execError);

			// Clean up the script file
			try {
				await fs.unlink(scriptPath);
			} catch (cleanupError) {
				console.error("Failed to cleanup script:", cleanupError);
			}

			return NextResponse.json(
				{
					error: "Video generation failed",
					details: execError.message,
				},
				{ status: 500 }
			);
		}

	} catch (error) {
		console.error("Error in generate-video API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 }
		);
	}
}

// Example of a more complete video generation function
async function generateVideoWithFFmpeg(
	title: string,
	audioUrl: string,
	assets: any[],
	outputPath: string
): Promise<string> {
	// This is a template for a more sophisticated video generation process
	// You would need to install FFmpeg and implement proper video creation logic

	const commands = [
		// Download audio file
		`curl -o audio.mp3 "${audioUrl}"`,

		// Create video from assets (this is simplified)
		// In reality, you would create individual slides/images and combine them
		`ffmpeg -f lavfi -i color=c=blue:s=1920x1080:d=10 -vf "drawtext=text='${title}':fontsize=60:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -c:a copy -shortest title_slide.mp4`,

		// Combine title slide with audio
		`ffmpeg -i title_slide.mp4 -i audio.mp3 -c:v libx264 -c:a aac -map 0:v -map 1:a -y "${outputPath}"`,
	];

	for (const command of commands) {
		await execAsync(command);
	}

	return outputPath;
}