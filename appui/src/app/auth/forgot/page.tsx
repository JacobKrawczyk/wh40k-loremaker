"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function ForgotPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md p-6 text-white/70">Loading…</div>}>
      <ForgotInner />
    </Suspense>
  );
}

function ForgotInner() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/";
  const supabase = getSupabaseBrowserClient();

  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!email) {
      setErr("Enter your email address.");
      return;
    }
    setBusy(true);
    try {
      const resetTarget = `/auth/reset?next=${encodeURIComponent(next)}`;
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(resetTarget)}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) {
        setErr(error.message || "Could not send reset email.");
        return;
      }
      setMsg("If that email exists, a reset link has been sent.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">Reset your password</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-white/20 bg-black/40 p-4 text-white/80">
        <div>
          <Label>Email</Label>
          <Input
            className="mt-1 bg-black/40"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        <Button type="submit" disabled={busy} className="bg-white text-black hover:bg-white/90 disabled:opacity-60">
          {busy ? "Sending…" : "Send reset link"}
        </Button>
        {msg && <p className="text-green-300 text-sm">{msg}</p>}
        {err && <p className="text-red-300 text-sm">{err}</p>}
      </form>
    </div>
  );
}

