import { exec } from "child_process";
import { promisify } from "util";
import { mkdirSync } from "fs";
import path from "path";

const execAsync = promisify(exec);

export interface VideoGenerationConfig {
	audioPath: string;
	mediaUrls: string[];
	titleText: string;
	outputPath: string;
	postSlug: string;
	backgroundColor?: string;
	titleColor?: string;
	titleFontSize?: number;
	transitionDurationInSeconds?: number;
	mediaFitMode?: "cover" | "contain" | "fill";
}

export interface VideoGenerationResult {
	success: boolean;
	outputPath?: string;
	error?: string;
	metadata?: {
		duration: number;
		size: number;
		format: string;
	};
}

/**
 * Generates a video from the provided data using the existing CLI system
 */
export async function generateVideoFromData(
	config: VideoGenerationConfig
): Promise<VideoGenerationResult> {
	try {
		console.log("Generating video from data:", config);

		// Ensure output directory exists
		const outputDir = path.dirname(config.outputPath);
		mkdirSync(outputDir, { recursive: true });

		// Create a temporary JSON config file for the CLI
		const tempConfigPath = path.join(outputDir, `temp-config-${Date.now()}.json`);

		const cliConfig = {
			audioPath: config.audioPath,
			mediaUrls: config.mediaUrls,
			titleText: config.titleText,
			outputPath: config.outputPath,
			speechStartsAtSecond: 0,
			titleColor: config.titleColor || "#FFFFFF",
			titleFontSize: config.titleFontSize || 52,
			backgroundColor: config.backgroundColor || "#0a0a0a",
			captionsTextColor: "#F8F9FA",
			onlyDisplayCurrentSentence: true,
			transitionDurationInSeconds: config.transitionDurationInSeconds || 0.8,
			mediaFitMode: config.mediaFitMode || "cover",
			backgroundSoundVolume: 0.15,
			audioOffsetInSeconds: 0,
		};

		// Write config to temp file
		const fs = await import("fs");
		fs.writeFileSync(tempConfigPath, JSON.stringify(cliConfig, null, 2));

		try {
			// Execute the video generation script
			const scriptPath = path.join(process.cwd(), "generate-video.ts");
			const command = `npx tsx ${scriptPath} '${JSON.stringify(cliConfig)}'`;

			console.log("Executing command:", command);

			const { stdout, stderr } = await execAsync(command);

			console.log("Video generation stdout:", stdout);
			if (stderr) {
				console.warn("Video generation stderr:", stderr);
			}

			// Clean up temp config file
			fs.unlinkSync(tempConfigPath);

			// Verify the output file exists
			if (fs.existsSync(config.outputPath)) {
				const stats = fs.statSync(config.outputPath);

				return {
					success: true,
					outputPath: config.outputPath,
					metadata: {
						duration: 90, // Default duration, should be calculated from audio
						size: stats.size,
						format: "mp4",
					},
				};
			} else {
				return {
					success: false,
					error: "Output video file was not created",
				};
			}
		} catch (execError) {
			// Clean up temp config file
			try {
				const fs = await import("fs");
				if (fs.existsSync(tempConfigPath)) {
					fs.unlinkSync(tempConfigPath);
				}
			} catch (cleanupError) {
				console.error("Failed to cleanup temp config:", cleanupError);
			}

			console.error("Video generation failed:", execError);
			return {
				success: false,
				error: execError instanceof Error ? execError.message : "Video generation failed",
			};
		}
	} catch (error) {
		console.error("Error in generateVideoFromData:", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

/**
 * Validates the video generation configuration
 */
export function validateVideoConfig(config: VideoGenerationConfig): {
	isValid: boolean;
	errors: string[];
} {
	const errors: string[] = [];

	if (!config.audioPath?.trim()) {
		errors.push("Audio path is required");
	}

	if (!config.mediaUrls?.length) {
		errors.push("At least one media URL is required");
	}

	if (!config.titleText?.trim()) {
		errors.push("Title text is required");
	}

	if (!config.outputPath?.trim()) {
		errors.push("Output path is required");
	}

	if (!config.postSlug?.trim()) {
		errors.push("Post slug is required");
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
}