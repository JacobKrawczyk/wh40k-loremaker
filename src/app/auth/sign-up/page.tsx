"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-md p-6 text-white/70">Loading…</div>}>
      <SignUpInner />
    </Suspense>
  );
}

function SignUpInner() {
  const supabase = getSupabaseBrowserClient();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Password guidance only (Supabase enforces on the server)
  const rules = useMemo(
    () => [
      { key: "len", label: "At least 8 characters", ok: password.length >= 8 },
      { key: "upper", label: "One uppercase letter (A-Z)", ok: /[A-Z]/.test(password) },
      { key: "lower", label: "One lowercase letter (a-z)", ok: /[a-z]/.test(password) },
      { key: "num", label: "One number (0-9)", ok: /\d/.test(password) },
    ],
    [password]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!email || !password) {
      setErr("Please enter an email and password.");
      return;
    }

    try {
      setBusy(true);
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        setErr(error.message || "Sign-up failed.");
        return;
      }
      setMsg("Check your email to confirm your account.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold text-white">Create account</h1>
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
        <div>
          <Label>Password</Label>
          <Input
            className="mt-1 bg-black/40"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <ul className="mt-2 space-y-1 text-xs">
            {rules.map((r) => (
              <li key={r.key} className={r.ok ? "text-green-300" : "text-white/60"}>
                {r.ok ? "✓" : "•"} {r.label}
              </li>
            ))}
          </ul>
        </div>

        <Button type="submit" disabled={busy} className="bg-white text-black hover:bg-white/90 disabled:opacity-60">
          {busy ? "Creating…" : "Create account"}
        </Button>

        {msg && <p className="text-green-300 text-sm">{msg}</p>}
        {err && <p className="text-red-300 text-sm">{err}</p>}
      </form>

      <div className="mt-3 text-sm text-white/70">
        Already have an account? {" "}
        <a href={`/auth/sign-in?next=${encodeURIComponent(next)}`} className="underline">
          Sign in
        </a>
      </div>
    </div>
  );
}

