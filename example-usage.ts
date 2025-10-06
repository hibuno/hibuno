#!/usr/bin/env node

import { generateVideo } from "./generate-video";

// Example usage of the video generation CLI
async function example() {
  const exampleInput = {
    audioPath: "./public/audio.wav",
    mediaUrls: [
      "./public/sample-image-1.svg",
      "./public/sample-image-2.svg",
      "./public/sample-image-3.svg",
    ],
    titleText: "Professional Content Creation",
    outputPath: "./output/example-video.mp4",
    speechStartsAtSecond: 0,
    titleColor: "#FFFFFF",
    titleFontSize: 52,
    backgroundColor: "#0a0a0a",
    captionsTextColor: "#F8F9FA",
    onlyDisplayCurrentSentence: true,
    transitionDurationInSeconds: 0.8,
    mediaFitMode: "cover" as const,
    backgroundSoundVolume: 0.15,
  };

  try {
    console.log("🚀 Starting video generation...");
    const outputPath = await generateVideo(JSON.stringify(exampleInput));
    console.log(`✅ Video generated successfully: ${outputPath}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// CLI usage example
function showUsageExample() {
  console.log("📖 CLI Usage Example:");
  console.log("");
  console.log("npx ts-node generate-video.ts '{");
  console.log('  "audioPath": "/path/to/your/audio.wav",');
  console.log('  "mediaUrls": [');
  console.log('    "/path/to/image1.jpg",');
  console.log('    "/path/to/image2.jpg",');
  console.log('    "/path/to/image3.jpg"');
  console.log("  ],");
  console.log('  "titleText": "My Amazing Video",');
  console.log('  "outputPath": "./my-video.mp4"');
  console.log("}'");
  console.log("");
  console.log("🎛️  Optional parameters:");
  console.log("- speechStartsAtSecond: number (default: 0)");
  console.log("- titleColor: string (default: '#FFFFFF')");
  console.log("- titleFontSize: number (default: 52)");
  console.log("- backgroundColor: string (default: '#0a0a0a')");
  console.log("- captionsTextColor: string (default: '#F8F9FA')");
  console.log("- onlyDisplayCurrentSentence: boolean (default: true)");
  console.log("- transitionDurationInSeconds: number (default: 0.8)");
  console.log("- mediaFitMode: 'cover'|'contain'|'fill' (default: 'cover')");
  console.log("- backgroundSoundVolume: number (default: 0.15)");
  console.log("- audioOffsetInSeconds: number (default: 0)");
}

if (require.main === module) {
  if (process.argv.includes("--example")) {
    example();
  } else {
    showUsageExample();
  }
}

export { example, showUsageExample };
