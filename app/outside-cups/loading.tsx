import AppShell from "@/components/AppShell";

export default function Loading() {
  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 pt-2">
        <div className="h-7 w-32 bg-stone-800 rounded animate-pulse" />
        <div className="h-9 w-20 bg-stone-800 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-stone-900 border border-stone-800 rounded-xl p-4 animate-pulse"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-stone-800 rounded w-2/3" />
                <div className="h-3 bg-stone-800 rounded w-1/4" />
                <div className="h-3 bg-stone-800 rounded w-1/3" />
              </div>
              <div className="h-8 w-10 bg-stone-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
