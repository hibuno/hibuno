import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { content, style = "engaging" } = await request.json();

		if (!content) {
			return NextResponse.json(
				{ error: "Content is required" },
				{ status: 400 },
			);
		}

		// Get OpenRouter API key from environment
		const openRouterApiKey = process.env.OPENROUTER_API_KEY;
		if (!openRouterApiKey) {
			return NextResponse.json(
				{ error: "OpenRouter API key not configured" },
				{ status: 500 },
			);
		}

		// Clean the content for better processing
		const plainText = content
			.replace(/#{1,6}\s/g, "")
			.replace(/\*\*([^*]+)\*\*/g, "$1")
			.replace(/\*([^*]+)\*/g, "$1")
			.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
			.replace(/```[\s\S]*?```/g, "")
			.replace(/`([^`]+)`/g, "$1")
			.replace(/<[^>]*>/g, "")
			.replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
			.trim();

		// Calculate target word count for 1.5 minute narration (roughly 150 words per minute)
		const wordCount = plainText.split(/\s+/).length;
		const targetWords = Math.max(150, Math.floor(wordCount * 0.15));

		const prompt = `Convert this article content into an engaging ${targetWords}-word narration script for a 1.5-minute video. Use a ${style} storytelling style with natural pauses and emphasis points. Make it conversational and compelling:

${plainText.substring(0, 3000)}...

Requirements:
- Target length: ${targetWords} words (approximately 1.5 minutes when spoken)
- Make it conversational and engaging
- Include natural transitions and storytelling elements
- Focus on the key points and main message
- End with a strong call-to-action or memorable conclusion
- Use simple, clear language that's easy to follow when spoken`;

		// Call OpenRouter API
		const response = await fetch(
			"https://openrouter.ai/api/v1/chat/completions",
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${openRouterApiKey}`,
					"Content-Type": "application/json",
					"HTTP-Referer":
						process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
					"X-Title": "Video Generator",
				},
				body: JSON.stringify({
					model: "anthropic/claude-3-haiku", // Using Claude for better narrative generation
					messages: [
						{
							role: "user",
							content: prompt,
						},
					],
					max_tokens: 800,
					temperature: 0.7,
				}),
			},
		);

		if (!response.ok) {
			const errorData = await response.text();
			console.error("OpenRouter API error:", errorData);
			return NextResponse.json(
				{ error: "Failed to generate narration from OpenRouter" },
				{ status: 500 },
			);
		}

		const data = await response.json();

		if (!data.choices?.[0]?.message?.content) {
			return NextResponse.json(
				{ error: "Invalid response from OpenRouter API" },
				{ status: 500 },
			);
		}

		const narration = data.choices[0].message.content.trim();

		return NextResponse.json({
			narration,
			wordCount: narration.split(/\s+/).length,
			style,
		});
	} catch (error) {
		console.error("Error in generate-narration API:", error);
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
