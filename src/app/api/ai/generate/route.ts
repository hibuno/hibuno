import { type NextRequest, NextResponse } from "next/server";

const UPSTAGE_API_URL = "https://api.upstage.ai/v1/chat/completions";

// Clean and normalize AI response
function cleanAIResponse(text: string, type: GenerationType): string {
  if (!text) return "";

  // For JSON responses, return as-is
  if (["title", "tags"].includes(type)) {
    return text.trim();
  }

  // For slug/excerpt, return plain text
  if (["slug", "excerpt"].includes(type)) {
    return text.trim().replace(/^["']|["']$/g, "");
  }

  let result = text.trim();

  // Remove common AI greeting patterns
  const greetingPatterns = [
    /^(Here'?s?|Here is|Below is|The following is|I'?ve|I have|Sure[,!]?|Certainly[,!]?|Of course[,!]?|Absolutely[,!]?)[^<\n]*[:.]?\s*/i,
    /^(The improved|The expanded|The rewritten|The summarized|The continued)[^<\n]*[:.]?\s*/i,
    /^(This is|Let me|I'll|I will)[^<\n]*[:.]?\s*/i,
  ];

  for (const pattern of greetingPatterns) {
    result = result.replace(pattern, "");
  }

  // Convert markdown to HTML if markdown is detected
  if (
    result.includes("**") ||
    result.includes("##") ||
    result.includes("- ") ||
    result.includes("* ")
  ) {
    // Convert headers
    result = result.replace(/^### (.+)$/gm, "<h3>$1</h3>");
    result = result.replace(/^## (.+)$/gm, "<h2>$1</h2>");
    result = result.replace(/^# (.+)$/gm, "<h1>$1</h1>");

    // Convert bold and italic
    result = result.replace(
      /\*\*\*(.+?)\*\*\*/g,
      "<strong><em>$1</em></strong>"
    );
    result = result.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
    result = result.replace(/__(.+?)__/g, "<strong>$1</strong>");
    result = result.replace(/_(.+?)_/g, "<em>$1</em>");

    // Convert unordered lists
    const ulPattern = /^[\-\*] (.+)$/gm;
    if (ulPattern.test(result)) {
      result = result.replace(/^([\-\*] .+\n?)+/gm, (match) => {
        const items = match
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => `<li>${line.replace(/^[\-\*] /, "")}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      });
    }

    // Convert ordered lists
    const olPattern = /^\d+\. (.+)$/gm;
    if (olPattern.test(result)) {
      result = result.replace(/^(\d+\. .+\n?)+/gm, (match) => {
        const items = match
          .split("\n")
          .filter((line) => line.trim())
          .map((line) => `<li>${line.replace(/^\d+\. /, "")}</li>`)
          .join("");
        return `<ol>${items}</ol>`;
      });
    }

    // Wrap remaining plain text lines in paragraphs
    result = result
      .split("\n\n")
      .map((block) => {
        block = block.trim();
        if (!block) return "";
        if (block.startsWith("<")) return block;
        return `<p>${block.replace(/\n/g, " ")}</p>`;
      })
      .filter(Boolean)
      .join("\n");
  }

  // If result doesn't start with HTML tag, wrap in paragraph
  if (result && !result.trim().startsWith("<")) {
    result = result
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => (p.startsWith("<") ? p : `<p>${p.replace(/\n/g, " ")}</p>`))
      .join("\n");
  }

  // Clean up excessive whitespace and newlines
  result = result
    .replace(/\n{3,}/g, "\n\n")
    .replace(/(<\/p>)\s*(<p>)/g, "$1\n$2")
    .replace(/(<\/li>)\s*(<li>)/g, "$1$2")
    .replace(/(<\/ul>)\s*(<ul>)/g, "$1\n$2")
    .replace(/(<\/ol>)\s*(<ol>)/g, "$1\n$2")
    .trim();

  return result;
}

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
  post: `You are a content writer. Output ONLY the blog post content in clean HTML.
Rules:
- Use <h2>, <h3> for headings, <p> for paragraphs, <ul>/<ol> for lists
- NO greetings, NO explanations, NO "Here is...", NO markdown
- Start directly with the content
- Single newline between elements only`,

  improve: `You are an editor. Output ONLY the improved text in clean HTML.
Rules:
- Fix grammar, spelling, clarity, and flow
- Keep the original meaning and tone
- NO greetings, NO explanations, NO "Here is the improved version"
- NO markdown syntax (no **, no ##, no -)
- Use HTML tags: <p>, <strong>, <em>, <ul>, <li>
- Start directly with the improved content`,

  expand: `You are a content writer. Output ONLY the expanded text in clean HTML.
Rules:
- Add more details, examples, and elaboration
- Maintain the original style
- NO greetings, NO explanations, NO "Here is..."
- NO markdown syntax
- Use HTML tags: <p>, <strong>, <em>, <ul>, <li>, <h3>
- Start directly with the expanded content`,

  summarize: `You are a summarizer. Output ONLY the summary in clean HTML.
Rules:
- Capture main points concisely
- NO greetings, NO explanations, NO "Here is the summary"
- NO markdown syntax
- Use HTML tags: <p>, <ul>, <li>
- Start directly with the summary`,

  title: `Generate 5 SEO-friendly titles in the SAME language as the content. Return ONLY a JSON array.
Example: ["Title 1", "Title 2", "Title 3", "Title 4", "Title 5"]
NO explanations, NO markdown, ONLY the JSON array.
CRITICAL: Use the same language as the input content.`,

  excerpt: `Generate a meta description (120-160 characters) in the SAME language as the content.
Return ONLY the excerpt text, nothing else.
NO quotes, NO explanations, NO "Here is..."
CRITICAL: Use the same language as the input content.`,

  tags: `Generate 5-10 relevant tags in the SAME language as the content, lowercase hyphenated format.
Return ONLY a JSON array.
Example: ["tag-one", "tag-two"]
NO explanations, ONLY the JSON array.
CRITICAL: Use the same language as the input content.`,

  slug: `Generate an SEO-friendly URL slug (3-6 words, lowercase, hyphens).
Return ONLY the slug, nothing else.
NO quotes, NO explanations.
Use transliteration for non-Latin scripts (e.g., Indonesian "Menjelajahi" → "menjelajahi").`,

  continue: `You are a content writer. Continue the text naturally in clean HTML.
Rules:
- Match the existing tone and style exactly
- Flow naturally from where it left off
- NO greetings, NO "Continuing from...", NO explanations
- NO markdown syntax (no **, no ##, no -)
- Use HTML tags: <p>, <strong>, <em>, <ul>, <li>
- Do NOT repeat any existing content
- Start directly with the continuation`,

  rewrite: `You are an editor. Rewrite the text in clean HTML.
Rules:
- Preserve the meaning, improve engagement
- Vary sentence structures
- NO greetings, NO explanations, NO "Here is the rewritten..."
- NO markdown syntax
- Use HTML tags: <p>, <strong>, <em>, <ul>, <li>
- Start directly with the rewritten content`,
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
    const rawResult = data.choices?.[0]?.message?.content || "";
    const result = cleanAIResponse(rawResult, type);

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
