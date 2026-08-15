import { Goal, Gauge, Target, Trophy } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatPercent, formatDecimal } from '../utils/formatters'

function Mini({ icon: Icon, title, children, accent }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent.bg} ${accent.text}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</span>
      </div>
      <div className="mt-3">{children}</div>
    </Card>
  )
}

function Row({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-1.5 text-xs last:border-0 dark:border-zinc-800">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className={`font-tabular font-semibold ${strong ? 'text-base text-zinc-900 dark:text-white' : 'text-zinc-800 dark:text-zinc-200'}`}>
        {value}
      </span>
    </div>
  )
}

export default function KeyMetrics({ result, match }) {
  const ou25 = result.overUnder.find((o) => o.line === 2.5)
  return (
    <section>
      <SectionHeading
        icon={Goal}
        title="Visão rápida"
        subtitle="Os indicadores centrais do modelo para esta partida"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Mini icon={Trophy} title="Placar mais provável" accent={{ bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' }}>
          <div className="text-2xl font-extrabold font-tabular text-zinc-900 dark:text-white">
            {result.mostLikely.home} x {result.mostLikely.away}
          </div>
          <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            {formatPercent(result.mostLikely.prob)} de probabilidade
          </div>
        </Mini>

        <Mini icon={Goal} title="Gols — Over/Under 2.5" accent={{ bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400' }}>
          <Row label="Over 2.5" value={formatPercent(ou25.over)} />
          <Row label="Under 2.5" value={formatPercent(ou25.under)} />
        </Mini>

        <Mini icon={Target} title="BTTS — Ambas marcam" accent={{ bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' }}>
          <Row label="Sim" value={formatPercent(result.btts.yes)} />
          <Row label="Não" value={formatPercent(result.btts.no)} />
        </Mini>

        <Mini icon={Gauge} title="xG total" accent={{ bg: 'bg-zinc-500/10', text: 'text-zinc-600 dark:text-zinc-300' }}>
          <div className="text-2xl font-extrabold font-tabular text-zinc-900 dark:text-white">
            {formatDecimal(result.totalXG)}
          </div>
          <div className="mt-1 text-xs capitalize text-zinc-500 dark:text-zinc-400">
            Classificação: {result.classification.label}
          </div>
        </Mini>
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">
        Exemplo: {match.homeName} xG {formatDecimal(result.homeXG)} vs {match.awayName} xG{' '}
        {formatDecimal(result.awayXG)}.
      </p>
    </section>
  )
}
