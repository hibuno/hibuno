import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const adminAccess = request.cookies.get("admin_access")?.value;
  const validKey = process.env.ACCESS_KEY;

  if (!validKey) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  if (adminAccess === validKey) {
    return NextResponse.json({ authorized: true });
  }

  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
