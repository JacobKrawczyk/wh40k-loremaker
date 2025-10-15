"use client";

import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

let _client: SupabaseClient | null = null;

/**
 * Browser (client) Supabase instance, memoized.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (_client) return _client;
  _client = _createBrowserClient(url, anon);
  return _client;
}

/**
 * Backwards-compat alias so old imports keep working.
 * If some file still imports { createBrowserClient } from "@/lib/supabase/client",
 * it will receive the same instance as getSupabaseBrowserClient().
 */
export const createBrowserClient = getSupabaseBrowserClient;
