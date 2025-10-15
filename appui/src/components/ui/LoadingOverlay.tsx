"use client";

import { useBusyStore } from "@/lib/busyStore";
import { Button } from "@/components/ui/button";

export default function LoadingOverlay() {
  const pending = useBusyStore((s) => s.pending);
  const message = useBusyStore((s) => s.message);
  const error = useBusyStore((s) => s.error);
  const dismiss = useBusyStore((s) => s.dismiss);

  const visible = pending > 0 || !!error;
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
      <div className="max-w-2xl text-center">
        {!error ? (
          <>
            <div
              className="mx-auto mb-6 h-20 w-20 animate-spin rounded-full border-4 border-white/20 border-t-white"
              aria-hidden
            />
            <h2 className="text-4xl font-extrabold text-white">Generating…</h2>
            <p className="mt-2 text-white/80">{message || "Please wait."}</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-red-200">Operation failed</h2>
            <pre className="mt-3 max-h-[40vh] max-w-[80vw] overflow-auto whitespace-pre-wrap rounded-lg border border-red-400/30 bg-red-950/40 p-4 text-left text-red-100/90">
              {error}
            </pre>
            <div className="mt-4">
              <Button className="bg-white text-black hover:bg-white/90" onClick={dismiss}>
                Dismiss
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
