import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * POST /api/campaigns/join
 * body: { code: string }
 */
export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "Missing invite code" }, { status: 400 });
  }

  const supabase = await getSupabaseServerClient();

  // Ensure user is signed in
  const { data: auth } = await supabase.auth.getUser();
  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

  // Call the DB function you created earlier
  const { data, error } = await supabase.rpc("rpc_join_campaign", { p_code: code });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, joined: data ?? null });
}
