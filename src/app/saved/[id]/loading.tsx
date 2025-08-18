// FILE: src/app/campaigns/[id]/loading.tsx
export default function Loading() {
  return (
    <div className="relative z-10 mx-auto max-w-3xl space-y-6 p-6">
      <div className="h-8 w-72 animate-pulse rounded bg-white/10" />
      <div className="h-5 w-56 animate-pulse rounded bg-white/10" />
      <div className="h-[60vh] animate-pulse rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur" />
    </div>
  );
}
