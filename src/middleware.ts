// src/middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Routes that require auth
const PROTECTED = [/^\/campaigns(\/.*)?$/, /^\/saved(\/.*)?$/, /^\/reports(\/.*)?$/];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip protection if route isn't in the protected list
  if (!PROTECTED.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  // We need a response object so we can set refreshed cookies if Supabase rotates tokens
  const res = NextResponse.next();

  // ✅ Correct cookie adapter for @supabase/ssr in middleware (no functions returning objects)
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name: string) {
        return req.cookies.get(name)?.value;
      },
      set(name: string, value: string, options?: CookieOptions) {
        // Next 15: set via response so the browser receives updated tokens
        res.cookies.set({ name, value, ...(options ?? {}) });
      },
      remove(name: string, options?: CookieOptions) {
        res.cookies.set({ name, value: "", ...(options ?? {}), maxAge: 0 });
      },
    },
  });

  // Ask Supabase for the user (also refreshes session if needed and sets cookies on `res`)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Not signed in → redirect to sign-in and preserve the intended path
    const signIn = req.nextUrl.clone();
    signIn.pathname = "/auth/sign-in";
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  // Signed in → continue (and return `res` so any refreshed cookies are applied)
  return res;
}

// Exclude static assets, API, etc.
export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|api).*)"],
};
