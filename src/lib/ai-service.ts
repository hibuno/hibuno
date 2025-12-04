export type GenerationType =
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

export interface AIGenerateOptions {
  type: GenerationType;
  content: string;
  context?: string;
  stream?: boolean;
}

export interface AIMetadataResult {
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  suggestedTitles: string[];
}

export interface AIGenerateResult {
  result: string;
  type: GenerationType;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function generateContent(
  options: AIGenerateOptions
): Promise<AIGenerateResult> {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate content");
  }

  return response.json();
}

export async function* streamContent(
  options: AIGenerateOptions
): AsyncGenerator<string> {
  const response = await fetch("/api/ai/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...options, stream: true }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate content");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

export async function generateMetadata(
  content: string,
  title?: string
): Promise<AIMetadataResult> {
  const response = await fetch("/api/ai/metadata", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, title }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to generate metadata");
  }

  return response.json();
}

export async function chat(
  messages: AIChatMessage[],
  options?: {
    stream?: boolean;
    reasoning_effort?: "low" | "medium" | "high";
  }
): Promise<string> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      stream: options?.stream || false,
      reasoning_effort: options?.reasoning_effort,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to chat");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

export async function* streamChat(
  messages: AIChatMessage[],
  options?: { reasoning_effort?: "low" | "medium" | "high" }
): AsyncGenerator<string> {
  const response = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      stream: true,
      reasoning_effort: options?.reasoning_effort,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to chat");
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}

export async function processOCR(
  file: File
): Promise<{ text: string; html?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/ai/ocr", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to process OCR");
  }

  return response.json();
}
