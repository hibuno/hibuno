"use server"

import { put, del, list } from "@vercel/blob"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { extractExifData } from "./exif"
import { detectAiImage } from "./ai-detection"
import { extractColorInfo, extractImageProperties } from "./sightengine"

const oneDay = 24 * 60 * 60;

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

		// Add timestamp to the filename for expiration tracking
		const timestamp = Date.now()
		const filename = `${timestamp}_${id}`

		// Upload to Vercel Blob with timestamp in filename
		const blob = await put(`images/${filename}`, file, {
			access: "public",
			cacheControlMaxAge: oneDay,
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
			expiresAt: new Date(Date.now() + oneDay * 1000).toISOString(),
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
		await put(`analysis/${filename}.json`, analysisJson, {
			access: "public",
			addRandomSuffix: false,
			contentType: "application/json",
			cacheControlMaxAge: oneDay,
		})

		// Log the URL where we're storing the analysis
		const baseUrl = process.env.NEXT_PUBLIC_BLOB_BASE_URL || ""
		const formattedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`
		console.log("Analysis stored at:", `${formattedBaseUrl}analysis/${filename}.json`)

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
		// First, try to find the analysis file with the timestamp prefix
		const listResult = await list({
			prefix: `analysis/`,
			limit: 100,
		})

		// Find the file that ends with the provided ID
		const analysisFile = listResult.blobs.find(blob => {
			const filename = blob.pathname.split('/').pop() || ''
			return filename.endsWith(`${id}.json`)
		})

		if (!analysisFile) {
			console.error(`Analysis file for ID ${id} not found`)
			return null
		}

		// Use the URL from the found file
		const url = analysisFile.url

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
		// Find the files with the timestamp prefix that match the ID
		const imagesResult = await list({
			prefix: 'images/',
			limit: 100,
		})

		const analysisResult = await list({
			prefix: 'analysis/',
			limit: 100,
		})

		// Find the image file that contains the ID
		const imageFile = imagesResult.blobs.find(blob => {
			const filename = blob.pathname.split('/').pop() || ''
			return filename.includes(id)
		})

		// Find the analysis file that contains the ID
		const analysisFile = analysisResult.blobs.find(blob => {
			const filename = blob.pathname.split('/').pop() || ''
			return filename.includes(id)
		})

		// Delete the files if found
		if (imageFile) {
			await del(imageFile.url)
		}

		if (analysisFile) {
			await del(analysisFile.url)
		}

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

/**
 * Deletes files older than the specified hours
 * @param hours Number of hours after which files should be deleted
 */
export async function deleteOldFiles(hours: number = 24) {
	try {
		const currentTime = Date.now()
		const expirationTime = currentTime - (hours * 60 * 60 * 1000) // Convert hours to milliseconds
		let cursor: string | undefined
		let deletedCount = 0

		do {
			// List all blobs with pagination
			const listResult = await list({
				cursor,
				limit: 100,
			})

			// Filter blobs that are older than the expiration time
			const blobsToDelete = listResult.blobs.filter(blob => {
				const pathname = blob.pathname
				// Extract timestamp from filename (assuming format: timestamp_id.ext)
				const filename = pathname.split('/').pop() || ''
				const timestampStr = filename.split('_')[0]

				if (!timestampStr || isNaN(Number(timestampStr))) {
					return false // Skip files without proper timestamp format
				}

				const timestamp = Number(timestampStr)
				return timestamp < expirationTime
			})

			// Delete the filtered blobs
			if (blobsToDelete.length > 0) {
				await del(blobsToDelete.map(blob => blob.url))
				deletedCount += blobsToDelete.length
			}

			cursor = listResult.cursor
		} while (cursor)

		console.log(`Deleted ${deletedCount} expired files`)
		return { success: true, deletedCount }
	} catch (error) {
		console.error("Error deleting old files:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "An unknown error occurred"
		}
	}
}
