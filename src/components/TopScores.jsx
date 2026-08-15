import { ListOrdered } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatPercent, formatOdd } from '../utils/formatters'

const medals = ['bg-amber-400/90 text-zinc-900', 'bg-zinc-300 text-zinc-700', 'bg-amber-700/80 text-white']

export default function TopScores({ result }) {
  return (
    <section>
      <SectionHeading
        icon={ListOrdered}
        title="Ranking de placares"
        subtitle="Os 10 placares mais prováveis, com odd justa de cada placar"
      />
      <Card className="overflow-hidden">
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {result.topScores.map((s, i) => (
            <div
              key={`${s.home}-${s.away}`}
              className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  medals[i] ?? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
                }`}
              >
                {i + 1}º
              </span>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-zinc-100 px-2.5 py-1 text-sm font-bold font-tabular text-zinc-900 dark:bg-zinc-800 dark:text-white">
                  {s.home} x {s.away}
                </span>
                <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  {s.home > s.away
                    ? 'Mandante'
                    : s.home < s.away
                      ? 'Visitante'
                      : 'Empate'}
                </span>
              </div>
              <div className="ml-auto flex items-center gap-6">
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Probabilidade
                  </div>
                  <div className="font-tabular font-bold text-zinc-900 dark:text-white">
                    {formatPercent(s.prob)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Odd justa
                  </div>
                  <div className="font-tabular font-bold text-emerald-600 dark:text-emerald-400">
                    {formatOdd(s.odd)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  )
}
