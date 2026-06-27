import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { assertAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const deny = assertAdmin(req);
  if (deny) return deny;

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${params.id}.${ext}`;
  const bytes = await file.arrayBuffer();

  const supabase = getServiceClient();
  const { error: uploadError } = await supabase.storage
    .from("staff-photos")
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: { publicUrl } } = supabase.storage.from("staff-photos").getPublicUrl(path);

  await supabase.from("staff_profiles").update({ photo_url: publicUrl }).eq("id", params.id);

  return NextResponse.json({ url: publicUrl });
}
