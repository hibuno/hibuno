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
    const {
      messages,
      model = "solar-mini",
      stream = false,
      reasoning_effort,
      response_format,
    } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    const requestBody: Record<string, unknown> = {
      model,
      messages,
      stream,
    };

    if (reasoning_effort) {
      requestBody.reasoning_effort = reasoning_effort;
    }

    if (response_format) {
      requestBody.response_format = response_format;
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("AI API error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request" },
      { status: 500 }
    );
  }
}
