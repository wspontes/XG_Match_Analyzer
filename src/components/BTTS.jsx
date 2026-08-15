import { CheckCircle2, XCircle } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatPercent, formatOdd } from '../utils/formatters'

export default function BTTS({ result, match }) {
  const homeAny = 1 - result.homeDist[0]
  const awayAny = 1 - result.awayDist[0]

  return (
    <section>
      <SectionHeading
        icon={CheckCircle2}
        title="BTTS — Ambas marcam"
        subtitle="P(Sim) = P(Mandante ≥ 1) × P(Visitante ≥ 1)"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="relative overflow-hidden border-emerald-500/30 p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-emerald-500" aria-hidden />
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Ambas Marcam — SIM</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                {match.homeName} {formatPercent(homeAny)} × {match.awayName} {formatPercent(awayAny)}
              </p>
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold font-tabular text-emerald-600 dark:text-emerald-400">
            {formatPercent(result.btts.yes)}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Odd justa: <span className="font-semibold font-tabular text-zinc-700 dark:text-zinc-200">{formatOdd(result.bttsOdds.yes)}</span>
          </p>
        </Card>

        <Card className="relative overflow-hidden p-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-zinc-400" aria-hidden />
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
              <XCircle className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Ambas Marcam — NÃO</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Pelo menos uma equipe não marca</p>
            </div>
          </div>
          <div className="mt-4 text-3xl font-extrabold font-tabular text-zinc-800 dark:text-zinc-200">
            {formatPercent(result.btts.no)}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            Odd justa: <span className="font-semibold font-tabular text-zinc-700 dark:text-zinc-200">{formatOdd(result.bttsOdds.no)}</span>
          </p>
        </Card>
      </div>
    </section>
  )
}
