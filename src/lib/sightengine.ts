// Sightengine API integration for AI Image Validator

/**
 * Analyzes an image using the Sightengine API
 * @param imageUrl URL of the image to analyze
 * @returns Analysis results from Sightengine
 */
export async function analyzeSightengine(imageUrl: string) {
	try {
		// Get API credentials from environment variables
		const apiUser = process.env.SIGHTENGINE_KEY
		const apiSecret = process.env.SIGHTENGINE_SECRET

		if (!apiUser || !apiSecret) {
			throw new Error("Sightengine API credentials not configured")
		}

		// Construct the API URL with parameters
		const params = new URLSearchParams({
			models: "properties,text-content,text,genai",
			api_user: apiUser,
			api_secret: apiSecret,
			url: imageUrl,
		})

		const apiUrl = `https://api.sightengine.com/1.0/check.json?${params.toString()}`

		// Make the API request
		const response = await fetch(apiUrl)

		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(`Sightengine API error (${response.status}): ${errorText}`)
		}

		// Parse the response
		const data = await response.json()

		if (data.status !== "success") {
			throw new Error(`Sightengine API returned error: ${JSON.stringify(data)}`)
		}

		return data
	} catch (error) {
		console.error("Sightengine analysis error:", error)
		throw error
	}
}

/**
 * Extracts color information from Sightengine response
 * @param sightengineData Response from Sightengine API
 * @returns Formatted color information
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractColorInfo(sightengineData: any) {
	if (!sightengineData?.colors) {
		return null
	}

	return {
		dominant: sightengineData.colors.dominant,
		accent: sightengineData.colors.accent || [],
		other: sightengineData.colors.other || [],
	}
}

/**
 * Determines if an image is AI-generated based on Sightengine analysis
 * @param sightengineData Response from Sightengine API
 * @returns AI detection results
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function determineAiGenerated(sightengineData: any) {
	// Check if the API returned AI detection data
	if (!sightengineData?.type?.ai_generated) {
		return {
			isAiGenerated: false,
			confidence: 0,
			details: {
				modelPrediction: "Analysis failed or unavailable",
				patternAnalysis: "No pattern analysis available",
				inconsistencies: ["No data available from AI detection service"],
			},
		}
	}

	// Get the AI generation score (0-1)
	const aiScore = sightengineData.type.ai_generated

	// Convert to percentage and determine if AI-generated
	// Using 0.5 (50%) as the threshold, but this can be adjusted
	const confidence = aiScore * 100
	const isAiGenerated = aiScore >= 0.5

	return {
		isAiGenerated,
		confidence,
		details: {
			modelPrediction: isAiGenerated ? "AI Generated" : "Human Created",
			patternAnalysis: `The image was analyzed and received an AI generation score of ${confidence.toFixed(2)}%`,
			inconsistencies: getInconsistencies(sightengineData),
		},
	}
}

/**
 * Extracts image properties from Sightengine response
 * @param sightengineData Response from Sightengine API
 * @returns Formatted image properties
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractImageProperties(sightengineData: any) {
	if (!sightengineData) {
		return null
	}

	return {
		sharpness: sightengineData.sharpness,
		brightness: sightengineData.brightness,
		contrast: sightengineData.contrast,
	}
}

/**
 * Generates a list of inconsistencies that might indicate AI generation
 * @param sightengineData Response from Sightengine API
 * @returns Array of inconsistency descriptions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getInconsistencies(sightengineData: any): string[] {
	const inconsistencies = []

	// Only add inconsistencies if the image is likely AI-generated
	if (sightengineData.type.ai_generated >= 0.5) {
		inconsistencies.push("Image shows patterns consistent with AI generation")

		// Add more specific inconsistencies based on properties
		if (sightengineData.sharpness > 0.95) {
			inconsistencies.push("Unusually high sharpness throughout the image")
		}

		if (sightengineData.contrast > 0.9) {
			inconsistencies.push("Abnormally consistent contrast levels")
		}

		// Text analysis can also indicate AI generation
		if (sightengineData.text?.has_artificial > 0.5) {
			inconsistencies.push("Text in the image appears artificially generated")
		}
	}

	// If no specific inconsistencies were found but the score is high
	if (inconsistencies.length === 0 && sightengineData.type.ai_generated >= 0.5) {
		inconsistencies.push("General patterns consistent with AI-generated imagery")
	}

	return inconsistencies
}
