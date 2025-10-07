// Small fetch helpers that integrate with the global busy overlay.
import { useBusyStore } from "@/lib/busyStore";

type BusyOpts = { message?: string };

export async function postJSON<TReq, TResp>(
  url: string,
  payload: TReq,
  busy?: BusyOpts
): Promise<TResp> {
  const { begin, endSuccess, setError } = useBusyStore.getState();
  begin(busy?.message ?? "Working…");

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      const msg = `HTTP ${res.status} ${res.statusText}\n${txt || "(no body)"}`;
      setError(msg);
      throw new Error(msg);
    }

    const data = (await res.json()) as TResp;
    endSuccess();
    return data;
  } catch (err) {
    // if an error wasn't already set above, ensure overlay shows something
    const s = useBusyStore.getState();
    if (!s.error) s.setError(String(err));
    throw err;
  }
}
