import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code =
    url.searchParams.get("code") ??
    url.searchParams.get("token_hash") ??
    url.searchParams.get("token");

  const type = url.searchParams.get("type");
  const rawNext = url.searchParams.get("next");

  let next = rawNext ?? "";
  if (!next) {
    next = type === "recovery" ? "/auth/reset" : "/";
  } else {
    try {
      next = decodeURIComponent(next);
    } catch {
      // keep as-is if decoding fails
    }
  }

  if (code) {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
