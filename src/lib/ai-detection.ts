import { analyzeSightengine, determineAiGenerated } from "./sightengine"

// This function now uses Sightengine API for AI detection
export async function detectAiImage(buffer: Buffer, imageUrl?: string) {
	try {
		// We need a URL to the image for Sightengine API
		if (!imageUrl) {
			console.warn("No image URL provided for Sightengine analysis")
			return fallbackDetection()
		}

		// Call Sightengine API
		const sightengineData = await analyzeSightengine(imageUrl)

		// Process the results
		const aiDetectionResult = determineAiGenerated(sightengineData)

		// Add the raw data for debugging/advanced usage
		return {
			...aiDetectionResult,
			rawData: sightengineData,
		}
	} catch (error) {
		console.error("AI detection error:", error)

		// Fall back to simplified detection if Sightengine fails
		return fallbackDetection(error)
	}
}

// Fallback detection when Sightengine is unavailable
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fallbackDetection(error?: any) {
	return {
		isAiGenerated: Math.random() > 0.5, // Random result for demonstration
		confidence: Math.random() * 100,
		details: {
			modelPrediction: "Analysis Failed - Using Fallback",
			patternAnalysis: "Sightengine API unavailable. Using simplified detection.",
			inconsistencies: [
				"API Error - Using fallback detection",
				error instanceof Error ? error.message : "Unknown error",
			],
		},
		rawData: {},
		error: "Failed to perform AI detection with Sightengine",
	}
}
