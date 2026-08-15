import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { ChartTooltip } from './ChartTooltip'
import { formatPercent, formatDecimal } from '../utils/formatters'
import { useTheme } from '../context/ThemeContext'

export default function PoissonDistribution({ result, match }) {
  const { dark } = useTheme()
  const axis = dark ? '#a1a1aa' : '#71717a'
  const grid = dark ? '#27272a' : '#e4e4e7'

  const data = []
  for (let g = 0; g <= 10; g++) {
    data.push({
      goals: `${g}`,
      Mandante: +(result.homeDist[g] * 100).toFixed(4),
      Visitante: +(result.awayDist[g] * 100).toFixed(4),
    })
  }

  return (
    <section>
      <SectionHeading
        icon={BarChart3}
        title="Distribuição de gols"
        subtitle="Probabilidade de cada equipe marcar 0, 1, 2... gols (distribuição de Poisson)"
      />
      <Card className="p-5">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis dataKey="goals" tick={{ fill: axis, fontSize: 12 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: axis, fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                content={<ChartTooltip formatter={(v) => `${formatDecimal(v, 2)}%`} labelFormatter={(l) => `${l} gol${l === '1' ? '' : 's'}`} />}
                cursor={{ fill: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="Mandante" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={42} />
              <Bar dataKey="Visitante" fill="#0ea5e9" radius={[4, 4, 0, 0]} maxBarSize={42} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-4 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-5 py-3 font-semibold">Gols</th>
                <th className="px-5 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  {match.homeName} (Mandante)
                </th>
                <th className="px-5 py-3 text-right font-semibold text-sky-600 dark:text-sky-400">
                  {match.awayName} (Visitante)
                </th>
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr
                  key={row.goals}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-5 py-2 font-semibold text-zinc-900 dark:text-zinc-100">
                    {row.goals}
                  </td>
                  <td className="px-5 py-2 text-right font-tabular font-medium text-zinc-700 dark:text-zinc-200">
                    {formatPercent(result.homeDist[row.goals])}
                  </td>
                  <td className="px-5 py-2 text-right font-tabular font-medium text-zinc-700 dark:text-zinc-200">
                    {formatPercent(result.awayDist[row.goals])}
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
