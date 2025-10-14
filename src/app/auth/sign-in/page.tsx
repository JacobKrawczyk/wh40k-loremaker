"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md p-6 text-white/70">Loading…</div>}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onGoogle = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  const onPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!email || !password) {
      setErr("Enter email and password.");
      return;
    }
    setBusy(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErr(error.message || "Sign-in failed.");
        return;
      }
      router.replace(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">Sign in</h1>
      <div className="space-y-3 rounded-lg border border-white/20 bg-black/40 p-4 text-white/80">
        <div>
          <Label className="mb-1 block">Email</Label>
          <Input
            className="bg-black/40"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <Label className="mb-1 block">Password</Label>
          <Input
            className="bg-black/40"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="bg-white text-black hover:bg-white/90" onClick={onPassword} disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={onGoogle}>
            Continue with Google
          </Button>
        </div>
        {err && <p className="text-sm text-red-300">{err}</p>}
      </div>

      <div className="mt-3 text-sm text-white/70">
        New here? <a className="underline" href={`/auth/sign-up?next=${encodeURIComponent(next)}`}>Create an account</a>
      </div>
    </div>
  );
}
