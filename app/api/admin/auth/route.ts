import { NextRequest } from "next/server";
import { assertAdmin } from "@/lib/admin";

export async function POST(req: NextRequest) {
  const denied = assertAdmin(req);
  if (denied) return denied;
  return new Response(null, { status: 200 });
}
