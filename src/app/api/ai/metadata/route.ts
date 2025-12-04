import { type NextRequest, NextResponse } from "next/server";

const UPSTAGE_API_URL = "https://api.upstage.ai/v1/chat/completions";

export async function POST(request: NextRequest) {
  const apiKey = process.env.UPSTAGE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "UPSTAGE_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const { content, title } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are an SEO and content optimization expert. Analyze the given blog post content and generate optimized metadata.

CRITICAL: Detect the language of the content and generate ALL metadata in the SAME language as the content. If the content is in Indonesian, generate metadata in Indonesian. If in English, generate in English, etc.

Generate the following:
1. title: A compelling, SEO-friendly title in the same language as the content (if not provided or to suggest alternatives)
2. slug: URL-friendly slug based on the title (use appropriate transliteration for non-Latin scripts)
3. excerpt: Meta description between 120-160 characters in the same language as the content
4. tags: Array of 5-10 relevant tags in the same language as the content, lowercase, hyphenated format
5. suggestedTitles: Array of 3 alternative title suggestions in the same language as the content

Return as valid JSON matching this exact schema.`;

    const userPrompt = title
      ? `Title: ${title}\n\nContent (first 3000 chars):\n${content.substring(
          0,
          3000
        )}\n\nIMPORTANT: Generate all metadata in the SAME language as this content.`
      : `Content (first 3000 chars):\n${content.substring(
          0,
          3000
        )}\n\nIMPORTANT: Generate all metadata in the SAME language as this content.`;

    const response = await fetch(UPSTAGE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "solar-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "post_metadata",
            strict: true,
            schema: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "SEO-optimized title for the post",
                },
                slug: {
                  type: "string",
                  description: "URL-friendly slug",
                },
                excerpt: {
                  type: "string",
                  description: "Meta description between 120-160 characters",
                },
                tags: {
                  type: "array",
                  items: { type: "string" },
                  description: "Array of relevant tags",
                },
                suggestedTitles: {
                  type: "array",
                  items: { type: "string" },
                  description: "Alternative title suggestions",
                },
              },
              required: ["title", "slug", "excerpt", "tags", "suggestedTitles"],
            },
          },
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Upstage API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    const metadata = JSON.parse(result);
    return NextResponse.json(metadata);
  } catch (error) {
    console.error("AI Metadata error:", error);
    return NextResponse.json(
      { error: "Failed to generate metadata" },
      { status: 500 }
    );
  }
}
