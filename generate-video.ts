#!/usr/bin/env node

import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { type TranscriptionOptions, transcribeAudio } from "./transcribe";

// Simple background sound selection function
function getRandomBackgroundSound(): string {
	const sounds = ["backsounds/backsound-1.mp3", "backsounds/backsound-2.mp3"];
	// Use true random for CLI generation (not during rendering)
	// eslint-disable-next-line @remotion/deterministic-randomness
	const randomIndex = Math.floor(Math.random() * sounds.length);
	return sounds[randomIndex];
}

interface VideoGenerationInput {
	// Required fields
	audioPath: string;
	mediaUrls: string[];
	titleText: string;
	outputPath?: string;

	// Optional fields with defaults
	speechStartsAtSecond?: number;
	titleColor?: string;
	titleFontSize?: number;
	backgroundColor?: string;
	captionsTextColor?: string;
	onlyDisplayCurrentSentence?: boolean;
	transitionDurationInSeconds?: number;
	mediaFitMode?: "cover" | "contain" | "fill";
	backgroundSoundVolume?: number;
	audioOffsetInSeconds?: number;
}

interface VideoGenerationConfig extends VideoGenerationInput {
	// Processed fields
	backgroundSoundUrl: string;
	captionsFileName: string;
	audioFileUrl: string;
}

function validateInput(input: unknown): VideoGenerationInput {
	if (typeof input !== "object" || input === null) {
		throw new Error("Input must be an object");
	}

	const obj = input as Record<string, unknown>;

	if (!obj.audioPath || typeof obj.audioPath !== "string") {
		throw new Error("audioPath is required and must be a string");
	}

	if (
		!obj.mediaUrls ||
		!Array.isArray(obj.mediaUrls) ||
		obj.mediaUrls.length === 0
	) {
		throw new Error("mediaUrls is required and must be a non-empty array");
	}

	if (!obj.titleText || typeof obj.titleText !== "string") {
		throw new Error("titleText is required and must be a string");
	}

	return obj as unknown as VideoGenerationInput;
}

function prepareAssets(input: VideoGenerationInput): VideoGenerationConfig {
	const timestamp = Date.now();
	const publicDir = path.join(process.cwd(), "public");

	// Copy audio file to public directory
	const audioFileName = `audio-${timestamp}.wav`;
	const audioDestPath = path.join(publicDir, audioFileName);

	// Convert audio to WAV format if needed
	try {
		execSync(
			`npx remotion ffmpeg -i "${input.audioPath}" -ar 44100 -ac 2 "${audioDestPath}" -y`,
			{
				stdio: "pipe",
			},
		);
	} catch (error) {
		throw new Error(`Failed to process audio file: ${error}`);
	}

	// Copy media files to public directory
	const processedMediaUrls: string[] = [];
	input.mediaUrls.forEach((mediaUrl, index) => {
		const ext = path.extname(mediaUrl);
		const mediaFileName = `media-${timestamp}-${index}${ext}`;
		const mediaDestPath = path.join(publicDir, mediaFileName);

		try {
			fs.copyFileSync(mediaUrl, mediaDestPath);
			processedMediaUrls.push(mediaFileName);
		} catch (error) {
			throw new Error(`Failed to copy media file ${mediaUrl}: ${error}`);
		}
	});

	return {
		...input,
		audioFileUrl: audioFileName,
		mediaUrls: processedMediaUrls,
		backgroundSoundUrl: getRandomBackgroundSound(),
		captionsFileName: `captions-${timestamp}.json`,
		// Apply defaults
		speechStartsAtSecond: input.speechStartsAtSecond || 0,
		titleColor: input.titleColor || "#FFFFFF",
		titleFontSize: input.titleFontSize || 52,
		backgroundColor: input.backgroundColor || "#0a0a0a",
		captionsTextColor: input.captionsTextColor || "#F8F9FA",
		onlyDisplayCurrentSentence: input.onlyDisplayCurrentSentence !== false,
		transitionDurationInSeconds: input.transitionDurationInSeconds || 0.8,
		mediaFitMode: input.mediaFitMode || "cover",
		backgroundSoundVolume: input.backgroundSoundVolume || 0.15,
		audioOffsetInSeconds: input.audioOffsetInSeconds || 0,
	};
}

async function generateCaptions(config: VideoGenerationConfig): Promise<void> {
	const transcriptionOptions: TranscriptionOptions = {
		audioPath: path.join(process.cwd(), "public", config.audioFileUrl),
		speechStartsAtSecond: config.speechStartsAtSecond || 0,
	};

	console.log("🎤 Generating captions...");
	await transcribeAudio(transcriptionOptions);

	// Rename the generated captions file
	const defaultCaptionsPath = path.join(
		process.cwd(),
		"public",
		"captions.json",
	);
	const targetCaptionsPath = path.join(
		process.cwd(),
		"public",
		config.captionsFileName,
	);

	if (fs.existsSync(defaultCaptionsPath)) {
		fs.renameSync(defaultCaptionsPath, targetCaptionsPath);
	}
}

function createTemporaryComposition(config: VideoGenerationConfig): string {
	const compositionContent = `
import "./index.css";
import { Composition, staticFile } from "remotion";
import { Video } from "./Video/Main";
import { videoSchema } from "./Video/schema";
import { getSubtitles } from "./helpers/fetch-captions";
import { FPS } from "./helpers/ms-to-frame";
import { parseMedia } from "@remotion/media-parser";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GeneratedVideo"
        component={Video}
        width={1080}
        height={1920}
        schema={videoSchema}
        defaultProps={{
          mode: "video" as const,
          audioOffsetInSeconds: ${config.audioOffsetInSeconds},
          audioFileUrl: staticFile("${config.audioFileUrl}"),
          backgroundSoundUrl: staticFile("${config.backgroundSoundUrl}"),
          backgroundSoundVolume: ${config.backgroundSoundVolume},
          mediaUrls: [${config.mediaUrls.map((url) => `staticFile("${url}")`).join(", ")}],
          backgroundColor: "${config.backgroundColor}",
          titleText: "${config.titleText.replace(/"/g, '\\"')}",
          titleColor: "${config.titleColor}",
          titleFontSize: ${config.titleFontSize},
          captionsFileName: staticFile("${config.captionsFileName}"),
          captionsTextColor: "${config.captionsTextColor}",
          onlyDisplayCurrentSentence: ${config.onlyDisplayCurrentSentence},
          transitionDurationInSeconds: ${config.transitionDurationInSeconds},
          mediaFitMode: "${config.mediaFitMode}" as const,
        }}
        calculateMetadata={async ({ props }) => {
          let captions = null;
          if (props.captionsFileName) {
            captions = await getSubtitles(props.captionsFileName);
          }
          
          const { slowDurationInSeconds } = await parseMedia({
            src: props.audioFileUrl,
            acknowledgeRemotionLicense: true,
            fields: {
              slowDurationInSeconds: true,
            },
          });

          return {
            durationInFrames: Math.floor(
              (slowDurationInSeconds - props.audioOffsetInSeconds) * FPS,
            ),
            props: {
              ...props,
              captions,
            },
            fps: FPS,
          };
        }}
      />
    </>
  );
};
`;

	const tempRootPath = path.join(process.cwd(), "src", "Root-temp.tsx");
	fs.writeFileSync(tempRootPath, compositionContent);
	return tempRootPath;
}

async function renderVideo(config: VideoGenerationConfig): Promise<string> {
	const timestamp = Date.now();
	const outputFileName =
		config.outputPath || `generated-video-${timestamp}.mp4`;
	const outputPath = path.resolve(outputFileName);

	// Create temporary composition
	const tempRootPath = createTemporaryComposition(config);
	const originalRootPath = path.join(process.cwd(), "src", "Root.tsx");
	const backupRootPath = path.join(process.cwd(), "src", "Root-backup.tsx");

	try {
		// Backup original Root.tsx
		fs.copyFileSync(originalRootPath, backupRootPath);

		// Replace with temporary composition
		fs.copyFileSync(tempRootPath, originalRootPath);

		console.log("🎬 Rendering video...");

		// Render the video
		execSync(
			`npx remotion render GeneratedVideo "${outputPath}" --log=verbose`,
			{
				stdio: "inherit",
				cwd: process.cwd(),
			},
		);

		console.log(`✅ Video generated successfully: ${outputPath}`);
		return outputPath;
	} finally {
		// Restore original Root.tsx
		if (fs.existsSync(backupRootPath)) {
			fs.copyFileSync(backupRootPath, originalRootPath);
			fs.unlinkSync(backupRootPath);
		}

		// Clean up temporary files
		if (fs.existsSync(tempRootPath)) {
			fs.unlinkSync(tempRootPath);
		}
	}
}

function cleanupAssets(config: VideoGenerationConfig): void {
	const publicDir = path.join(process.cwd(), "public");

	// Clean up copied files
	const filesToClean = [
		config.audioFileUrl,
		config.captionsFileName,
		...config.mediaUrls,
	];

	filesToClean.forEach((fileName) => {
		const filePath = path.join(publicDir, fileName);
		if (fs.existsSync(filePath)) {
			try {
				fs.unlinkSync(filePath);
			} catch (error) {
				console.warn(`Warning: Could not clean up file ${fileName}: ${error}`);
			}
		}
	});
}

async function generateVideo(inputJson: string): Promise<string> {
	try {
		// Parse and validate input
		const input = JSON.parse(inputJson);
		const validatedInput = validateInput(input);

		console.log("📋 Preparing assets...");
		const config = prepareAssets(validatedInput);

		// Generate captions
		await generateCaptions(config);

		// Render video
		const outputPath = await renderVideo(config);

		// Clean up temporary assets
		cleanupAssets(config);

		return outputPath;
	} catch (error) {
		console.error("❌ Error generating video:", error);
		throw error;
	}
}

// CLI interface
async function main() {
	if (process.argv.length < 3) {
		console.error("Usage: npx ts-node generate-video.ts <json-input>");
		console.error("");
		console.error("Example JSON input:");
		console.error(
			JSON.stringify(
				{
					audioPath: "/path/to/audio.wav",
					mediaUrls: ["/path/to/image1.jpg", "/path/to/image2.jpg"],
					titleText: "My Amazing Video",
					outputPath: "output.mp4",
				},
				null,
				2,
			),
		);
		process.exit(1);
	}

	const jsonInput = process.argv[2];

	try {
		const outputPath = await generateVideo(jsonInput);
		console.log(outputPath); // Return only the path as requested
	} catch (error) {
		console.error("Failed to generate video:", error);
		process.exit(1);
	}
}

// Export for programmatic use
export { generateVideo, type VideoGenerationInput };

// Run CLI if called directly
if (require.main === module) {
	main();
}
