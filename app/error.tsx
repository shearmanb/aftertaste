"use client";

import AppShell from "@/components/AppShell";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <AppShell>
      <div className="text-center py-20">
        <p className="text-4xl mb-4">⚠</p>
        <p className="text-stone-300 font-semibold mb-2">Something went wrong</p>
        <p className="text-stone-500 text-sm mb-6">
          {error.message || "An unexpected error occurred"}
        </p>
        <button
          onClick={reset}
          className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
        >
          Try again
        </button>
      </div>
    </AppShell>
  );
}
