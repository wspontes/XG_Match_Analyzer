import { Sparkles } from 'lucide-react'
import { Card, SectionHeading, StatBar } from './ui'
import { formatPercent, formatOdd } from '../utils/formatters'

const barColors = ['bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-violet-500', 'bg-rose-500']

export default function MostLikelyMarkets({ result }) {
  const max = result.marketsRanking[0]?.prob ?? 1
  return (
    <section>
      <SectionHeading
        icon={Sparkles}
        title="Mercados com maior probabilidade"
        subtitle="Principais mercados ordenados pela probabilidade estimada pelo modelo — nenhuma classificação automática de valor"
      />
      <Card className="overflow-hidden">
        <div className="grid gap-x-8 gap-y-4 p-5 sm:grid-cols-2">
          {result.marketsRanking.map((m, i) => (
            <div key={`${m.name}-${i}`} className="flex items-center gap-3">
              <span className="w-6 shrink-0 text-xs font-bold text-zinc-400 dark:text-zinc-500">
                {i + 1}º
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                    {m.name}
                  </span>
                  <span className="shrink-0 font-tabular text-sm font-bold text-zinc-900 dark:text-white">
                    {formatPercent(m.prob)}
                    <span className="ml-2 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                      odd {formatOdd(m.odd)}
                    </span>
                  </span>
                </div>
                <StatBar value={m.prob} max={max} color={barColors[i % barColors.length]} className="mt-1.5" />
              </div>
            </div>
          ))}
        </div>
        <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
          As probabilidades refletem apenas o modelo. Nenhum mercado é automaticamente indicado como
          "aposta de valor".
        </p>
      </Card>
    </section>
  )
}
