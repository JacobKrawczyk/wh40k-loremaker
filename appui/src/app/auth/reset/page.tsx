"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md p-6 text-white/70">Loading…</div>}>
      <ResetInner />
    </Suspense>
  );
}

function ResetInner() {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    if (!password || password !== confirm) {
      setErr("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErr(error.message || "Could not update password.");
        return;
      }
      setMsg("Password updated.");
      router.replace(next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">Set a new password</h1>
      <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-white/20 bg-black/40 p-4 text-white/80">
        <div>
          <Label>New password</Label>
          <Input
            className="mt-1 bg-black/40"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <div>
          <Label>Confirm password</Label>
          <Input
            className="mt-1 bg-black/40"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        <Button type="submit" disabled={busy} className="bg-white text-black hover:bg-white/90 disabled:opacity-60">
          {busy ? "Updating…" : "Update password"}
        </Button>
        {msg && <p className="text-green-300 text-sm">{msg}</p>}
        {err && <p className="text-red-300 text-sm">{err}</p>}
      </form>
      <div className="mt-3 text-sm text-white/70">
        <a className="underline" href="/auth/forgot">Request a new reset link</a>
      </div>
    </div>
  );
}

