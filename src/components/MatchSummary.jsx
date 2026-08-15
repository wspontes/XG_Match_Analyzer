import { Home as HomeIcon, Globe, Target, Activity } from 'lucide-react'
import { Card, Badge } from './ui'
import { formatDecimal } from '../utils/formatters'

function TeamCard({ side, name, xg, icon: Icon, accent }) {
  return (
    <Card className="relative flex flex-1 flex-col items-center overflow-hidden p-6 text-center">
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-1 ${accent.bar}`}
        aria-hidden
      />
      <span
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent.chip}`}
      >
        <Icon className="h-6 w-6" />
      </span>
      <span className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {side}
      </span>
      <h3 className="mt-1 max-w-full truncate text-xl font-bold text-zinc-900 dark:text-white sm:text-2xl">
        {name}
      </h3>
      <div className="mt-3 flex items-center gap-2">
        <Target className="h-4 w-4 text-zinc-400" />
        <span className="text-sm text-zinc-500 dark:text-zinc-400">xG:</span>
        <span className={`text-2xl font-extrabold font-tabular ${accent.text}`}>
          {formatDecimal(xg)}
        </span>
      </div>
      <Badge color={accent.badge} className="mt-3">
        <Activity className="h-3 w-3" />
        Probabilidade estimada pelo modelo
      </Badge>
    </Card>
  )
}

export default function MatchSummary({ match, result }) {
  return (
    <div>
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
        <TeamCard
          side="Mandante"
          name={match.homeName}
          xg={result.homeXG}
          icon={HomeIcon}
          accent={{
            bar: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
            chip: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
            text: 'text-emerald-600 dark:text-emerald-400',
            badge: 'emerald',
          }}
        />
        <div className="flex items-center justify-center">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-center dark:border-emerald-500/40">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Probabilidade
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              do jogo
            </div>
          </div>
        </div>
        <TeamCard
          side="Visitante"
          name={match.awayName}
          xg={result.awayXG}
          icon={Globe}
          accent={{
            bar: 'bg-gradient-to-r from-sky-500 to-sky-400',
            chip: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
            text: 'text-sky-600 dark:text-sky-400',
            badge: 'sky',
          }}
        />
      </div>
    </div>
  )
}
