export default function DashboardLoading() {
  return (
    <div className="relative min-h-[60vh] overflow-hidden space-y-10 rounded-lg">
      {/* Scanning line effect */}
      <div className="skeleton-scan-line" aria-hidden />

      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-12 w-48 animate-pulse rounded bg-white/10" />
        <div className="h-4 w-64 animate-pulse rounded bg-white/5" />
      </div>

      {/* Get Started card skeleton */}
      <div className="rounded-xl border border-white/10 bg-white/[0.08] p-6">
        <div className="h-7 w-56 animate-pulse rounded bg-white/10" />
        <div className="mt-2 h-4 w-full max-w-sm animate-pulse rounded bg-white/5" />
        <div className="mt-4 space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-full animate-pulse rounded bg-white/5" />
          ))}
        </div>
      </div>

      {/* Overview skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-lg border border-white/10 bg-white/[0.08] p-6">
              <div className="h-12 w-16 animate-pulse rounded bg-white/10" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Inventory skeleton */}
      <div className="space-y-4">
        <div className="h-8 w-40 animate-pulse rounded bg-white/10" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/[0.08] p-5">
              <div className="h-6 w-24 animate-pulse rounded bg-white/10" />
              <div className="mt-3 h-4 w-20 animate-pulse rounded bg-white/5" />
              <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-white/10" />
              <div className="mt-4 h-4 w-28 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
