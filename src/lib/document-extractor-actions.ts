"use server"

import OpenAI from 'openai'
import type { ChatCompletionMessageParam } from 'openai/resources'
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"
import { MAX_FILE_SIZE } from "./constants"
import { convertToBasicMarkdown } from "./document-extractor-utils"

// Initialize OpenAI
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY || "",
})

// Check if API key is configured
const isApiConfigured = !!process.env.OPENAI_API_KEY

// Server action to process extracted text with AI
export async function processWithAI(textContent: string, imageUrls: string[], fileType: string) {
	try {
		if (!textContent || textContent.trim().length === 0 || !isApiConfigured) {
			console.log("No text extracted or API not configured, returning basic markdown")
			const markdown = await convertToBasicMarkdown(textContent || "")
			return {
				success: true,
				markdown
			}
		}

		// Truncate if too long
		const truncatedText = textContent.slice(0, 15000)
		console.log(`Processing ${truncatedText.length} characters with AI`)

		// Create messages array with text content
		const messages: ChatCompletionMessageParam[] = [
			{
				role: "system",
				content: "You are a document formatting assistant. Convert the extracted text into well-formatted markdown that preserves the original structure as much as possible."
			}
		]

		// Prepare user message content
		const userMessageContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
			{
				type: "text",
				text: `I have extracted text from a ${fileType} document. Please convert this text to well-formatted markdown that preserves the original structure as much as possible.

For tables, use markdown table syntax. For headings, use appropriate heading levels. Preserve lists, code blocks, and other formatting elements.

Here is the extracted text:

${truncatedText}

Please respond with ONLY the markdown-formatted version of this text, without any additional explanations or comments.`
			}
		]

		// Add image references if available
		if (imageUrls && imageUrls.length > 0) {
			imageUrls
				.forEach(imageUrl => {
					userMessageContent.push({
						type: "image_url",
						image_url: { url: imageUrl }
					})
				})
		}

		// Add the user message with content
		messages.push({
			role: "user",
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			content: userMessageContent as any // Type assertion needed for OpenAI compatibility
		})


		console.log("Calling OpenAI with messages:", messages)
		// Call OpenAI via OpenAI
		const completion = await openai.chat.completions.create({
			model: "gpt-4.1-nano",
			messages: messages,
			max_tokens: 4000,
		})

		const markdown = completion.choices[0]?.message?.content || ""
		console.log("AI processing successful")

		if (!markdown) {
			const basicMarkdown = await convertToBasicMarkdown(truncatedText)
			return {
				success: true,
				markdown: basicMarkdown
			}
		}
		
		return {
			success: true,
			markdown
		}
	} catch (error) {
		console.error("Error processing with AI:", error)
		const basicMarkdown = await convertToBasicMarkdown(textContent || "")
		return {
			success: false,
			error: error instanceof Error ? error.message : "An unknown error occurred during AI processing",
			markdown: basicMarkdown
		}
	}
}

// Server action to upload a blob to Vercel
export async function uploadBlob(formData: FormData) {
	try {
		const file = formData.get("file") as File

		if (!file) {
			return {
				success: false,
				error: "No file provided"
			}
		}
		
		// Check file size
		if (file.size > MAX_FILE_SIZE) {
			return {
				success: false,
				error: `File size exceeds the maximum limit of 3MB`
			}
		}

		// Generate a unique ID
		const id = uuidv4()
		const timestamp = Date.now()
		const filename = `${timestamp}_${id}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`

		// Upload to Vercel Blob
		const blob = await put(`document-extractor/${filename}`, file, {
			access: "public",
			cacheControlMaxAge: 3600, // 1 hour
			addRandomSuffix: false,
		})

		return {
			success: true,
			url: blob.url
		}
	} catch (error) {
		console.error("Error uploading to blob:", error)
		return {
			success: false,
			error: error instanceof Error ? error.message : "An unknown error occurred during file upload"
		}
	}
}
