"use client";

import { Button } from "@/components/ui/button";

export default function ScenarioSchedule({
  valueIso,
  onChange,
}: {
  valueIso?: string;
  onChange: (iso?: string) => void;
}) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <input
        type="datetime-local"
        className="rounded-md border border-white/20 bg-black/40 p-2 text-white"
        value={valueIso ? toLocalInputValue(valueIso) : ""}
        onChange={(e) => onChange(fromLocalInputValue(e.target.value))}
      />
      <Button
        variant="outline"
        className="border-white/30 text-white hover:bg-white/10"
        onClick={() => onChange(undefined)}
        title="Clear scheduled time"
      >
        Clear
      </Button>
    </div>
  );
}

function toLocalInputValue(iso: string): string {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  } catch {
    return "";
  }
}
function fromLocalInputValue(local: string): string | undefined {
  if (!local) return undefined;
  const d = new Date(local);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}
