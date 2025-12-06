import { type NextRequest, NextResponse } from "next/server";

export function checkAdminAuth(request: NextRequest): NextResponse | null {
  const adminAccess = request.cookies.get("admin_access")?.value;
  const validKey = process.env.ACCESS_KEY;

  if (!validKey || adminAccess !== validKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
