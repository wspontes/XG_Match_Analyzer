import { Percent, Info } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatPercent, formatOdd } from '../utils/formatters'

const rows = [
  {
    key: 'home',
    label: 'Mandante',
    badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  },
  {
    key: 'draw',
    label: 'Empate',
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  },
  {
    key: 'away',
    label: 'Visitante',
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  },
]

export default function FairOdds({ result }) {
  return (
    <section>
      <SectionHeading
        icon={Percent}
        title="Odds justas"
        subtitle="Odds calculadas pelo modelo, sem margem da casa de apostas"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {rows.map((r) => {
          const prob = result.prob[r.key]
          const odd = result.fairOdds[r.key]
          return (
            <Card key={r.key} className="p-5">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.badge}`}>
                {r.label}
              </span>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Probabilidade</div>
                  <div className="text-2xl font-extrabold font-tabular text-zinc-900 dark:text-white">
                    {formatPercent(prob)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">Odd justa</div>
                  <div className="text-2xl font-extrabold font-tabular text-zinc-900 dark:text-white">
                    {formatOdd(odd)}
                  </div>
                </div>
              </div>
              <p className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-500">
                <Info className="h-3.5 w-3.5 shrink-0" />
                Odd justa calculada pelo modelo, sem margem da casa
              </p>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
