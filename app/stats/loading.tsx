import AppShell from "@/components/AppShell";

export default function Loading() {
  return (
    <AppShell>
      <div className="pt-2 mb-6">
        <div className="h-7 w-28 bg-stone-800 rounded animate-pulse mb-2" />
        <div className="h-4 w-44 bg-stone-800 rounded animate-pulse" />
      </div>
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-stone-900 border border-stone-800 rounded-xl p-4 animate-pulse flex flex-col items-center gap-2"
            >
              <div className="h-8 w-14 bg-stone-800 rounded" />
              <div className="h-3 w-16 bg-stone-800 rounded" />
            </div>
          ))}
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-stone-900 border border-stone-800 rounded-xl p-4 animate-pulse"
          >
            <div className="h-3 w-24 bg-stone-800 rounded mb-4" />
            <div className="h-20 bg-stone-800 rounded" />
          </div>
        ))}
      </div>
    </AppShell>
  );
}
