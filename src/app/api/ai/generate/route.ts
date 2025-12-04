import { type NextRequest, NextResponse } from "next/server";

const UPSTAGE_API_URL = "https://api.upstage.ai/v1/chat/completions";

type GenerationType =
  | "post"
  | "improve"
  | "expand"
  | "summarize"
  | "title"
  | "excerpt"
  | "tags"
  | "slug"
  | "continue"
  | "rewrite";

const SYSTEM_PROMPTS: Record<GenerationType, string> = {
  post: `You are an expert blog writer. Generate a well-structured, engaging blog post based on the given topic or outline. 
Use proper HTML formatting with headings (h2, h3), paragraphs, lists, and emphasis where appropriate.
Write in a professional yet conversational tone. Include an introduction, main content sections, and a conclusion.`,

  improve: `You are an expert editor. Improve the given text by:
- Fixing grammar and spelling errors
- Improving clarity and readability
- Enhancing word choice and flow
- Maintaining the original meaning and tone
Return only the improved text in HTML format.`,

  expand: `You are an expert content writer. Expand the given text by:
- Adding more details and examples
- Elaborating on key points
- Including relevant information
- Maintaining consistency with the original style
Return the expanded content in HTML format.`,

  summarize: `You are an expert summarizer. Create a concise summary of the given text that:
- Captures the main points
- Maintains key information
- Is clear and readable
Return the summary in HTML format.`,

  title: `You are an expert headline writer. Generate 5 compelling, SEO-friendly titles for the given content.
Return as a JSON array of strings. Example: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]`,

  excerpt: `You are an SEO expert. Generate a compelling meta description/excerpt for the given content.
- Keep it between 120-160 characters
- Include relevant keywords naturally
- Make it engaging and click-worthy
Return only the excerpt text, no quotes.`,

  tags: `You are an SEO expert. Generate relevant tags/keywords for the given content.
- Generate 5-10 relevant tags
- Use lowercase, hyphenated format for multi-word tags
- Focus on searchable, relevant terms
Return as a JSON array of strings. Example: ["tag-one", "tag-two", "tag-three"]`,

  slug: `You are a URL optimization expert. Generate an SEO-friendly URL slug for the given title.
- Use lowercase letters
- Replace spaces with hyphens
- Remove special characters
- Keep it concise (3-6 words)
Return only the slug, no quotes or explanation.`,

  continue: `You are an expert blog writer. Continue writing from where the text left off.
- Maintain the same tone and style
- Follow the logical flow of the content
- Add valuable, relevant information
Return the continuation in HTML format (do not repeat the existing content).`,

  rewrite: `You are an expert editor. Rewrite the given text in a different style while preserving the meaning.
- Make it more engaging and readable
- Use varied sentence structures
- Improve the overall flow
Return the rewritten content in HTML format.`,
};

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
    const {
      type,
      content,
      context,
      stream = false,
    } = body as {
      type: GenerationType;
      content: string;
      context?: string;
      stream?: boolean;
    };

    if (!type || !SYSTEM_PROMPTS[type]) {
      return NextResponse.json(
        { error: "Invalid generation type" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[type];
    let userPrompt = content;

    if (context) {
      userPrompt = `Context: ${context}\n\nContent: ${content}`;
    }

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const isJsonResponse = ["title", "tags"].includes(type);

    const requestBody: Record<string, unknown> = {
      model: "solar-mini",
      messages,
      stream,
    };

    if (isJsonResponse) {
      requestBody.response_format = { type: "json_object" };
    }

    if (stream) {
      const response = await fetch(UPSTAGE_API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        return NextResponse.json(
          { error: `Upstage API error: ${error}` },
          { status: response.status }
        );
      }

      return new NextResponse(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const response = await fetch(UPSTAGE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `Upstage API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data.choices?.[0]?.message?.content || "";

    return NextResponse.json({
      result,
      type,
      usage: data.usage,
    });
  } catch (error) {
    console.error("AI Generate error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
