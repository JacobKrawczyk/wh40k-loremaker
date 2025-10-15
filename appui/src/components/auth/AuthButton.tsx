"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";

export default function AuthButton() {
  const supabase = getSupabaseBrowserClient();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const refresh = async () => {
      const { data } = await supabase.auth.getUser();
      if (active) setEmail(data.user?.email ?? null);
    };

    refresh();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      refresh();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);

  if (email) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm opacity-80">{email}</span>
        <Button
          variant="outline"
          className="border-white/30 text-white hover:bg-white/10"
          onClick={() => supabase.auth.signOut()}
        >
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button
      className="bg-white text-black hover:bg-white/90"
      onClick={() =>
        supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo: `${location.origin}/auth/callback` },
        })
      }
    >
      Sign in with Google
    </Button>
  );
}
