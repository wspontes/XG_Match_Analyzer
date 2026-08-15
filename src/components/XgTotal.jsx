import { Gauge, Home as HomeIcon, Globe, Sigma } from 'lucide-react'
import { Card, SectionHeading, Badge } from './ui'
import { formatDecimal } from '../utils/formatters'

const classificationColor = {
  Baixo: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  Médio: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  Alto: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
}

export default function XgTotal({ result }) {
  const maxScale = 6
  const positionPct = Math.min(100, (result.totalXG / maxScale) * 100)

  return (
    <section>
      <SectionHeading
        icon={Gauge}
        title="Total de gols esperados"
        subtitle="Soma do xG das duas equipes e classificação do cenário de gols"
      />
      <Card className="p-5 sm:p-6">
        <div className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              <HomeIcon className="h-4 w-4" />
              xG Mandante
            </div>
            <div className="mt-2 text-3xl font-extrabold font-tabular text-zinc-900 dark:text-white">
              {formatDecimal(result.homeXG)}
            </div>
          </div>
          <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
              <Globe className="h-4 w-4" />
              xG Visitante
            </div>
            <div className="mt-2 text-3xl font-extrabold font-tabular text-zinc-900 dark:text-white">
              {formatDecimal(result.awayXG)}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              <Sigma className="h-4 w-4" />
              xG Total
            </div>
            <div className="mt-2 flex items-center gap-3">
              <span className="text-3xl font-extrabold font-tabular text-zinc-900 dark:text-white">
                {formatDecimal(result.totalXG)}
              </span>
              <Badge color={result.classification.label === 'Baixo' ? 'sky' : result.classification.label === 'Médio' ? 'amber' : 'emerald'}>
                {result.classification.label}
              </Badge>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative h-3 w-full rounded-full bg-gradient-to-r from-sky-500 via-amber-500 to-emerald-500">
            <div
              className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-zinc-900 shadow-lg dark:border-zinc-900"
              style={{ left: `${positionPct}%` }}
              title={`xG total: ${formatDecimal(result.totalXG)}`}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
            <span>0</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-tabular">
              {formatDecimal(result.totalXG)}
            </span>
            <span>{maxScale}</span>
          </div>
          <div className="mt-3 flex gap-2">
            {['Baixo', 'Médio', 'Alto'].map((label) => (
              <span
                key={label}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  result.classification.label === label ? classificationColor[label] : 'text-zinc-400 dark:text-zinc-500'
                } ${result.classification.label !== label ? 'border border-zinc-200 dark:border-zinc-700' : ''}`}
              >
                {label}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-500">
            Faixas de referência: Baixo (xG total &lt; 2,2) · Médio (2,2 a 3,2) · Alto (&gt; 3,2)
          </p>
        </div>
      </Card>
    </section>
  )
}
