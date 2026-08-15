import { Layers } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatPercent } from '../utils/formatters'

export default function CumulativeTable({ result, match }) {
  const rows = []
  for (let g = 0; g <= 10; g++) {
    rows.push({
      goals: g,
      home: result.homeCDF[g],
      away: result.awayCDF[g],
    })
  }

  return (
    <section>
      <SectionHeading
        icon={Layers}
        title="Probabilidade acumulada"
        subtitle="P(X ≤ gols) — a probabilidade de cada equipe marcar até X gols"
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-5 py-3 font-semibold">Gols até</th>
                <th className="px-5 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  {match.homeName} (Mandante)
                </th>
                <th className="px-5 py-3 text-right font-semibold text-sky-600 dark:text-sky-400">
                  {match.awayName} (Visitante)
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.goals}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-5 py-2 font-semibold text-zinc-900 dark:text-zinc-100">
                    {row.goals}
                  </td>
                  <td className="px-5 py-2 text-right font-tabular font-medium text-zinc-700 dark:text-zinc-200">
                    {formatPercent(row.home)}
                  </td>
                  <td className="px-5 py-2 text-right font-tabular font-medium text-zinc-700 dark:text-zinc-200">
                    {formatPercent(row.away)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </section>
  )
}
