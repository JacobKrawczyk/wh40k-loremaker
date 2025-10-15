"use client";

import { ReactNode, useEffect } from "react";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  widthClassName?: string; // e.g. "max-w-2xl"
};

export default function Modal({
  open,
  onClose,
  title,
  children,
  widthClassName = "max-w-2xl",
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className={`w-full ${widthClassName} rounded-2xl border border-white/15 bg-neutral-950 text-white shadow-2xl`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
          <h2 className="text-lg font-semibold">{title ?? "Dialog"}</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-white/80 hover:bg-white/10"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>

      {/* backdrop click */}
      <button
        aria-hidden
        tabIndex={-1}
        className="fixed inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
}
