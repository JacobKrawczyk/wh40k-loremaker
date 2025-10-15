import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

// Small helper to generate an invite code
function genCode(len = 6) {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // avoids 0/O/1/I
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

export async function POST(req: Request) {
  try {
    const supabase = await getSupabaseServerClient();

    // Must be signed in
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr) throw userErr;
    if (!user) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const name = (body?.name ?? "").toString().trim() || "Untitled Campaign";
    const tone = body?.tone ? String(body.tone) : null;
    const mode =
      body?.mode === "interplanetary" || body?.mode === "sequential-claim"
        ? body.mode
        : "sequential-claim";

    // 1) Insert campaign
    const { data: campaign, error: insErr } = await supabase
      .from("campaigns")
      .insert({
        name,
        tone,
        mode,
        created_by: user.id,
        code: genCode(),
      })
      .select("*")
      .single();

    if (insErr) {
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    }

    // 2) Add the current user as owner in campaign_members
    const { error: memErr } = await supabase.from("campaign_members").insert({
      campaign_id: campaign.id,
      user_id: user.id,
      role: "owner",
    });

    if (memErr) {
      // roll back the campaign insert if you want — or just surface the error
      return NextResponse.json(
        { error: `Membership insert failed: ${memErr.message}`, campaign },
        { status: 500 }
      );
    }

    return NextResponse.json({ campaign }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
