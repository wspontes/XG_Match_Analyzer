import { Shuffle } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatPercent, formatOdd } from '../utils/formatters'

const cards = [
  { key: '1X', title: 'Dupla chance 1X', desc: 'Mandante ou empate', accent: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'X2', title: 'Dupla chance X2', desc: 'Empate ou visitante', accent: 'text-sky-600 dark:text-sky-400' },
  { key: '12', title: 'Dupla chance 12', desc: 'Sem empate', accent: 'text-amber-600 dark:text-amber-400' },
]

export default function DoubleChance({ result }) {
  return (
    <section>
      <SectionHeading
        icon={Shuffle}
        title="Dupla chance"
        subtitle="Combinação de dois dos três resultados do mercado 1X2"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.key} className="p-5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{c.title}</h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{c.desc}</p>
            <div className={`mt-3 text-3xl font-extrabold font-tabular ${c.accent}`}>
              {formatPercent(result.doubleChance[c.key])}
            </div>
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Odd justa: <span className="font-semibold font-tabular text-zinc-700 dark:text-zinc-200">{formatOdd(result.doubleChanceOdds[c.key])}</span>
            </div>
          </Card>
        ))}
      </div>
    </section>
  )
}
