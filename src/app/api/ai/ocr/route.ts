import { type NextRequest, NextResponse } from "next/server";

const UPSTAGE_OCR_URL = "https://api.upstage.ai/v1/document-digitization";

export async function POST(request: NextRequest) {
  const apiKey = process.env.UPSTAGE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "UPSTAGE_API_KEY not configured" },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    const upstageFormData = new FormData();
    upstageFormData.append("model", "ocr");
    upstageFormData.append("document", file);

    const response = await fetch(UPSTAGE_OCR_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: upstageFormData,
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json(
        { error: `OCR API error: ${error}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "Failed to process OCR request" },
      { status: 500 }
    );
  }
}
