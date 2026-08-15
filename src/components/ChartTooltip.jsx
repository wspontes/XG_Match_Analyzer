import { useTheme } from '../context/ThemeContext'

export function ChartTooltip({ active, payload, label, formatter, labelFormatter }) {
  const { dark } = useTheme()
  if (!active || !payload || !payload.length) return null

  return (
    <div
      className={`rounded-lg border px-3 py-2 text-xs shadow-xl ${
        dark ? 'border-zinc-700 bg-zinc-900 text-zinc-100' : 'border-zinc-200 bg-white text-zinc-800'
      }`}
    >
      {labelFormatter ? (
        <div className="mb-1 font-semibold">{labelFormatter(label, payload)}</div>
      ) : (
        <div className="mb-1 font-semibold">{label}</div>
      )}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span
            className="inline-block h-2 w-2 shrink-0 rounded-full"
            style={{ background: entry.color || entry.fill || '#10b981' }}
          />
          <span className="text-zinc-500 dark:text-zinc-400">{entry.name}:</span>
          <span className="font-semibold font-tabular">
            {formatter ? formatter(entry.value, entry) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}
