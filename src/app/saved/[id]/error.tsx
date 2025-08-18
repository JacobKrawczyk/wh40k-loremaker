"use client";

import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="relative z-10 mx-auto max-w-3xl space-y-4 p-6" aria-live="assertive">
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-100 backdrop-blur">
        <h2 className="mb-2 text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm opacity-90">
          {error?.message || "An unexpected error occurred while opening the scenario."}
        </p>

        {error?.digest && (
          <p className="mt-2 text-xs opacity-60">
            Ref: <span className="font-mono">{error.digest}</span>
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => reset()}
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black hover:bg-white/90"
          >
            Try again
          </button>

          <button
            onClick={() => location.reload()}
            className="rounded-md border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Reload page
          </button>

          <Link href="/saved" className="inline-block">
            <button className="rounded-md border border-white/30 px-4 py-2 text-sm text-white hover:bg-white/10">
              Back to Saved
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
