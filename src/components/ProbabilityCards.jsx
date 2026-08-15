import { Trophy, Scale, Hand } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatPercent, formatOdd } from '../utils/formatters'
import { TrendingUp } from 'lucide-react'

const cards = [
  {
    key: 'home',
    title: 'Vitória Mandante',
    icon: Trophy,
    color: {
      text: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      bar: 'bg-emerald-500',
      border: 'border-emerald-500/40',
    },
  },
  {
    key: 'draw',
    title: 'Empate',
    icon: Scale,
    color: {
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      bar: 'bg-amber-500',
      border: 'border-amber-500/40',
    },
  },
  {
    key: 'away',
    title: 'Vitória Visitante',
    icon: Hand,
    color: {
      text: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      bar: 'bg-sky-500',
      border: 'border-sky-500/40',
    },
  },
]

export default function ProbabilityCards({ result }) {
  return (
    <section>
      <SectionHeading
        icon={TrendingUp}
        title="Probabilidade 1X2"
        subtitle="Calculada pela distribuição de Poisson combinada das duas equipes"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => {
          const prob = result.prob[c.key]
          const odd = result.fairOdds[c.key]
          return (
            <Card key={c.key} className="relative overflow-hidden p-5">
              <div className={`absolute inset-x-0 top-0 h-1 ${c.color.bar}`} aria-hidden />
              <div className="flex items-center justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.color.bg} ${c.color.text}`}>
                  <c.icon className="h-5 w-5" />
                </span>
                <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  1X2
                </span>
              </div>
              <h3 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {c.title}
              </h3>
              <div className={`mt-1 text-3xl font-extrabold font-tabular ${c.color.text}`}>
                {formatPercent(prob)}
              </div>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                Odd justa: <span className="font-semibold font-tabular text-zinc-700 dark:text-zinc-200">{formatOdd(odd)}</span>
              </p>
              <div className={`mt-3 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800`}>
                <div className={`h-full rounded-full ${c.color.bar}`} style={{ width: `${prob * 100}%` }} />
              </div>
              <p className="mt-3 text-[11px] text-zinc-400 dark:text-zinc-500">
                Probabilidade estimada pelo modelo
              </p>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
