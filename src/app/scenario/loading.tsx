// FILE: src/app/scenario/loading.tsx
export default function Loading() {
  return (
    <div className="relative z-10 mx-auto max-w-3xl space-y-6 p-6">
      <div className="h-8 w-64 animate-pulse rounded bg-white/10" />
      <div className="space-y-4 rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur">
        <div className="h-10 w-full animate-pulse rounded bg-white/10" />
        <div className="h-10 w-full animate-pulse rounded bg-white/10" />
        <div className="h-24 w-full animate-pulse rounded bg-white/10" />
        <div className="h-10 w-32 animate-pulse rounded bg-white/20" />
      </div>
      <div className="h-64 w-full animate-pulse rounded-2xl border border-white/10 bg-black/50 backdrop-blur" />
    </div>
  );
}
