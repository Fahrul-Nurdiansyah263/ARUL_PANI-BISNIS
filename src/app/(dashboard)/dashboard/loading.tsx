export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-muted rounded-md" />
        <div className="h-4 w-64 bg-muted rounded-md" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-muted/50 p-4 space-y-3 min-h-[300px]">
            <div className="h-4 w-24 bg-muted rounded-md" />
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="h-20 bg-muted/70 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
