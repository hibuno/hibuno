import { type NextRequest, NextResponse } from "next/server";

interface ElevenLabsRequestBody {
  text: string;
  model_id: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { text, voiceSettings } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (!voiceSettings?.voiceId) {
      return NextResponse.json(
        { error: "Voice settings are required" },
        { status: 400 },
      );
    }

    // Get ElevenLabs API key from environment
    const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsApiKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured" },
        { status: 500 },
      );
    }

    // Prepare the request body for ElevenLabs API
    const requestBody: ElevenLabsRequestBody = {
      text,
      model_id: voiceSettings.model || "eleven_monolingual_v1",
      voice_settings: {
        stability: voiceSettings.voiceSettings?.stability ?? 0.5,
        similarity_boost: voiceSettings.voiceSettings?.similarity_boost ?? 0.5,
        style: voiceSettings.voiceSettings?.style ?? 0.0,
        use_speaker_boost:
          voiceSettings.voiceSettings?.use_speaker_boost ?? true,
      },
    };

    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceSettings.voiceId}`,
      {
        method: "POST",
        headers: {
          Accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": elevenLabsApiKey,
        },
        body: JSON.stringify(requestBody),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("ElevenLabs API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to generate audio from ElevenLabs" },
        { status: 500 },
      );
    }

    // Convert the audio response to a buffer
    const audioBuffer = await response.arrayBuffer();

    // Convert to base64 for storage/transmission
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    // Create a data URL for the audio
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    // In a production environment, you might want to save this to a file storage service
    // and return a URL to the saved file instead of the data URL
    const audioUrl = audioDataUrl;

    return NextResponse.json({
      audioUrl,
      format: "mp3",
      size: audioBuffer.byteLength,
      voiceId: voiceSettings.voiceId,
      model: voiceSettings.model,
    });
  } catch (error) {
    console.error("Error in generate-audio API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
