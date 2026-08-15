import { Home as HomeIcon, Globe } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatPercent } from '../utils/formatters'

function TeamGoalsPanel({ title, icon: Icon, name, data, accent }) {
  const rows = [
    { label: 'Marcar 0 gols', value: data.exact[0] },
    { label: 'Marcar 1+ gols', value: data.atLeast[0] },
    { label: 'Marcar 2+ gols', value: data.atLeast[1] },
    { label: 'Marcar 3+ gols', value: data.atLeast[2] },
    { label: 'Marcar 4+ gols', value: data.atLeast[3] },
  ]

  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent.chip}`}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{title}</h3>
          <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">{name}</p>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">{row.label}</span>
              <span className={`font-tabular font-bold ${accent.text}`}>{formatPercent(row.value)}</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
              <div className={`h-full rounded-full ${accent.bar}`} style={{ width: `${row.value * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default function TeamGoals({ result, match }) {
  return (
    <section>
      <SectionHeading
        icon={HomeIcon}
        title="Gols esperados por equipe"
        subtitle="Probabilidade de cada equipe marcar determinada quantidade de gols"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <TeamGoalsPanel
          title="Mandante"
          icon={HomeIcon}
          name={match.homeName}
          data={result.teamGoals.home}
          accent={{
            chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            text: 'text-emerald-600 dark:text-emerald-400',
            bar: 'bg-emerald-500',
          }}
        />
        <TeamGoalsPanel
          title="Visitante"
          icon={Globe}
          name={match.awayName}
          data={result.teamGoals.away}
          accent={{
            chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
            text: 'text-sky-600 dark:text-sky-400',
            bar: 'bg-sky-500',
          }}
        />
      </div>
    </section>
  )
}
