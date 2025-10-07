import { create } from "zustand";

export type BusyState = {
  /** number of in-flight tasks (>=0) */
  pending: number;
  /** status message while pending */
  message?: string;
  /** sticky error shown on overlay until dismissed */
  error?: string;

  /** start a pending operation, optionally update the message */
  begin: (message?: string) => void;
  /** finish one pending operation successfully; hides overlay when count hits 0 */
  endSuccess: () => void;
  /** set an error and clear pending (overlay stays visible until dismissed) */
  setError: (err: string) => void;
  /** dismiss error + message; pending stays as-is (usually 0) */
  dismiss: () => void;
};

export const useBusyStore = create<BusyState>((set, get) => ({
  pending: 0,
  message: undefined,
  error: undefined,

  begin: (message?: string) => {
    const next = Math.max(0, get().pending) + 1;
    set({ pending: next, message: message ?? get().message, error: undefined });
  },

  endSuccess: () => {
    const next = Math.max(0, get().pending - 1);
    // clear message only when everything finished
    set({ pending: next, message: next === 0 ? undefined : get().message });
  },

  setError: (err: string) => {
    set({ error: err || "Unknown error", pending: 0 });
  },

  dismiss: () => set({ error: undefined, message: undefined }),
}));
