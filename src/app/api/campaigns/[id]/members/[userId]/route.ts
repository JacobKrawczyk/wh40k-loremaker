// appui/src/app/api/campaigns/[id]/members/[userId]/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  // Expect: /api/campaigns/{id}/members/{userId}
  const id = parts[3] ?? "";
  const userId = parts[5] ?? "";
  if (!id || !userId) {
    return new NextResponse("Invalid path parameters", { status: 400 });
  }
  const supabase = await getSupabaseServerClient();
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();

  if (authErr || !user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Optional extra guard: ensure requester is the owner (creator) of this campaign
  const { data: campaign } = await supabase
    .from("campaigns")
    .select("id, created_by")
    .eq("id", id)
    .maybeSingle();

  if (!campaign || campaign.created_by !== user.id) {
    // RLS will also block delete, but we fail early with a clear message
    return new NextResponse("Only the campaign owner can remove members.", { status: 403 });
  }

  // Don’t allow kicking the owner (even if someone tinkers with client)
  if (userId === campaign.created_by) {
    return new NextResponse("Cannot remove the owner.", { status: 400 });
  }

  const { error: delErr } = await supabase
    .from("campaign_members")
    .delete()
    .eq("campaign_id", id)
    .eq("user_id", userId);

  if (delErr) {
    return new NextResponse(delErr.message, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
