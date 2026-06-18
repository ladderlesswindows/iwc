import { NextRequest, NextResponse } from "next/server";

export function assertAdmin(req: NextRequest): NextResponse | null {
  if (req.headers.get("x-admin-pw") !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

export function adminHeader(pw: string): Record<string, string> {
  return { "Content-Type": "application/json", "x-admin-pw": pw };
}
