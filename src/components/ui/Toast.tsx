import React from "react";
import { useAppStore } from "../../store/AppContext";

export default function Toast() {
  const { toastMessage } = useAppStore();
  if (!toastMessage) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-2xl shadow-2xl shadow-black/40 backdrop-blur-md max-w-sm text-center animate-in fade-in slide-in-from-bottom-2 duration-300"
    >
      {toastMessage}
    </div>
  );
}
