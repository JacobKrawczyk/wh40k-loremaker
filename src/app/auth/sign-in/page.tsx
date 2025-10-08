"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const onGoogle = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">Sign in</h1>
      <div className="rounded-lg border border-white/20 bg-black/40 p-4 text-white/80">
        <p className="mb-3">Use Google to sign in. You&apos;ll be redirected back here.</p>
        <Button className="bg-white text-black hover:bg-white/90" onClick={onGoogle}>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
