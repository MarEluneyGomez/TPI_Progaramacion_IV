export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-slate-200 ${className}`} aria-hidden="true" />
}

export function SkeletonFilas({ filas = 5 }: { filas?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      {Array.from({ length: filas }, (_, i) => (
        <Skeleton key={i} className="h-8 w-full" />
      ))}
    </div>
  )
}
