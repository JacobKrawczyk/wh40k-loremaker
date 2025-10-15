// src/app/auth/sign-out/route.ts
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await getSupabaseServerClient();

  // If the user is already signed out this will be a no-op; ignore errors.
  await supabase.auth.signOut();

  const url = new URL(req.url);
  const nextParam = url.searchParams.get("next");

  // Only allow same-site absolute paths to prevent open redirects.
  const nextPath =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";

  // 303 avoids the browser trying to re-POST on back/refresh.
  return NextResponse.redirect(new URL(nextPath, url), 303);
}
