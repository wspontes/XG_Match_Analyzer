export function Card({ className = '', children }) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/70 ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionHeading({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h2 className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 sm:text-lg">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}

const badgeColors = {
  emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  sky: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  red: 'bg-red-500/10 text-red-700 dark:text-red-400',
  zinc: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300',
}

export function Badge({ color = 'emerald', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeColors[color]} ${className}`}
    >
      {children}
    </span>
  )
}

export function ProgressBar({ value = 0, color = 'bg-emerald-500', className = '' }) {
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ${color}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  )
}

export function StatBar({ value, max = 1, color = 'bg-emerald-500', className = '' }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800 ${className}`}>
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  )
}
