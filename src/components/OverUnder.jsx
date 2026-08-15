import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatPercent, formatOdd } from '../utils/formatters'

export default function OverUnder({ result }) {
  return (
    <section>
      <SectionHeading
        icon={TrendingUp}
        title="Mercados Over / Under"
        subtitle="Probabilidade do total de gols (soma de duas Poisson = Poisson(λ_mandante + λ_visitante))"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        {result.overUnder.map((ou) => (
          <Card key={ou.line} className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Total de gols — {ou.line.toFixed(1)}
              </span>
              <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                λ total = {result.totalXG.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Over {ou.line.toFixed(1)}
                </div>
                <div className="mt-2 text-2xl font-extrabold font-tabular text-zinc-900 dark:text-white">
                  {formatPercent(ou.over)}
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Odd justa: <span className="font-semibold font-tabular">{formatOdd(ou.overOdd)}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${ou.over * 100}%` }} />
                </div>
              </div>
              <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
                  <TrendingDown className="h-3.5 w-3.5" />
                  Under {ou.line.toFixed(1)}
                </div>
                <div className="mt-2 text-2xl font-extrabold font-tabular text-zinc-900 dark:text-white">
                  {formatPercent(ou.under)}
                </div>
                <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                  Odd justa: <span className="font-semibold font-tabular">{formatOdd(ou.underOdd)}</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: `${ou.under * 100}%` }} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
