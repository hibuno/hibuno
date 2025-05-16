"use server"

import { put, del } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { extractExifData } from "./exif"
import { detectAiImage } from "./ai-detection"
import { extractColorInfo, extractImageProperties } from "./sightengine"

export async function uploadImage(formData: FormData) {
	try {
		const file = formData.get("image") as File

		if (!file) {
			return { success: false, error: "No file provided" }
		}

		// Check file type
		if (!file.type.startsWith("image/")) {
			return { success: false, error: "File must be an image" }
		}

		// Generate a unique ID for the image
		const id = uuidv4()

		// Upload to Vercel Blob with expiration (3 hours)
		const blob = await put(`images/${id}`, file, {
			access: "public",
			addRandomSuffix: false,
		})

		// Process the image (extract EXIF data, detect AI, etc.)
		const arrayBuffer = await file.arrayBuffer()
		const buffer = Buffer.from(arrayBuffer)

		// Extract EXIF data using exif-reader
		console.log("Extracting EXIF data...")
		const exifData = await extractExifData(buffer)
		console.log("EXIF data extracted:", JSON.stringify(exifData).substring(0, 200) + "...")

		// Detect if image is AI-generated using Sightengine
		// Pass the public URL of the uploaded image to Sightengine
		const aiDetectionResult = await detectAiImage(buffer, blob.url)

		// Extract color information and image properties if available
		let colorInfo = null
		let imageProperties = null

		if (aiDetectionResult.rawData) {
			colorInfo = extractColorInfo(aiDetectionResult.rawData)
			imageProperties = extractImageProperties(aiDetectionResult.rawData)

			// Remove the raw data before storing to save space
			delete aiDetectionResult.rawData
		}

		// Store the analysis results
		const analysisResult = {
			id,
			url: blob.url,
			filename: file.name,
			fileType: file.type,
			fileSize: file.size,
			uploadedAt: new Date().toISOString(),
			expiresAt: new Date(Date.now() + 10800 * 1000).toISOString(),
			exifData,
			aiDetection: aiDetectionResult,
			colorInfo,
			imageProperties,
		}

		// Store the analysis results as a JSON file in Vercel Blob
		const analysisJson = JSON.stringify(analysisResult)

		// Log the JSON to help with debugging
		console.log("Storing analysis JSON:", analysisJson.substring(0, 100) + "...")

		// Make sure we're using the correct content type for JSON
		await put(`analysis/${id}.json`, analysisJson, {
			access: "public",
			addRandomSuffix: false,
			contentType: "application/json",
		})

		// Log the URL where we're storing the analysis
		const baseUrl = process.env.NEXT_PUBLIC_BLOB_BASE_URL || ""
		const formattedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
		console.log("Analysis stored at:", `${formattedBaseUrl}analysis/${id}.json`)

		return {
			success: true,
			id,
			url: blob.url,
		}
	} catch (error) {
		console.error("Upload error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "An unknown error occurred",
		}
	}
}

export async function getImageAnalysis(id: string) {
	try {
		// Construct the URL properly using the environment variable
		const baseUrl = process.env.NEXT_PUBLIC_BLOB_BASE_URL || ""
		// Make sure the URL ends with a slash if needed
		const formattedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
		const url = `${formattedBaseUrl}analysis/${id}.json`

		console.log("Fetching analysis from:", url)

		const response = await fetch(url, {
			// Add cache: no-store to prevent caching issues
			cache: "no-store",
			// Add next.js revalidate
			next: { revalidate: 0 },
		})

		if (!response.ok) {
			console.error("Error fetching analysis:", response.status, response.statusText)
			// If the file doesn't exist, return null instead of trying to parse JSON
			return null
		}

		// Get the response text first to debug if needed
		const text = await response.text()

		try {
			// Try to parse the text as JSON
			const result = JSON.parse(text)
			return result
		} catch (parseError) {
			console.error("Error parsing JSON:", parseError, "Response text:", text)
			return null
		}
	} catch (error) {
		console.error("Error fetching analysis:", error)
		return null
	}
}

export async function deleteImage(id: string) {
	try {
		// Delete both the image and analysis files from Vercel Blob
		await del(`images/${id}`)
		await del(`analysis/${id}.json`)

		revalidatePath("/")
		return { success: true }
	} catch (error) {
		console.error("Delete error:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "An unknown error occurred",
		}
	}
}
