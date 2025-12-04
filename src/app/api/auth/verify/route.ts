import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { accessKey } = await request.json();
    const validKey = process.env.ACCESS_KEY;

    if (!validKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (accessKey === validKey) {
      const response = NextResponse.json({ success: true });

      // Set cookie for 1 month
      const oneMonth = 30 * 24 * 60 * 60 * 1000;
      response.cookies.set("admin_access", validKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: oneMonth / 1000, // maxAge is in seconds
        path: "/",
      });

      return response;
    }

    return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
