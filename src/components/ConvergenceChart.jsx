import { useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { LineChart as LineChartIcon } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { ChartTooltip } from './ChartTooltip'
import { formatNumber, formatPercent, formatDecimal } from '../utils/formatters'
import { useTheme } from '../context/ThemeContext'

const outcomes = [
  { key: 'home', label: 'Vitória mandante', color: '#10b981' },
  { key: 'draw', label: 'Empate', color: '#f59e0b' },
  { key: 'away', label: 'Vitória visitante', color: '#0ea5e9' },
]

export default function ConvergenceChart({ result, mcResult }) {
  const { dark } = useTheme()
  const [outcome, setOutcome] = useState('home')

  const axis = dark ? '#a1a1aa' : '#71717a'
  const grid = dark ? '#27272a' : '#e4e4e7'

  const active = outcomes.find((o) => o.key === outcome)
  const theoretical = result.prob[outcome]

  const data = (mcResult?.checkpointData ?? []).map((c) => ({
    sims: c.simulations,
    'Modelo teórico': theoretical * 100,
    'Monte Carlo': c[outcome] * 100,
  }))

  return (
    <section>
      <SectionHeading
        icon={LineChartIcon}
        title="Convergência da simulação"
        subtitle="Aproximação do resultado Monte Carlo à probabilidade teórica conforme o número de simulações aumenta"
        action={
          <div className="flex flex-wrap gap-2">
            {outcomes.map((o) => (
              <button
                key={o.key}
                onClick={() => setOutcome(o.key)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                  outcome === o.key
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        }
      />
      <Card className="p-5">
        {data.length < 2 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
            <LineChartIcon className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Execute a simulação Monte Carlo para visualizar o gráfico de convergência.
            </p>
          </div>
        ) : (
          <>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
                  <XAxis
                    dataKey="sims"
                    tick={{ fill: axis, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `${v / 1000} mil` : v)}
                    type="category"
                  />
                  <YAxis
                    tick={{ fill: axis, fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${formatDecimal(v, 1)}%`}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    content={
                      <ChartTooltip
                        formatter={(v) => `${formatDecimal(v, 2)}%`}
                        labelFormatter={(l) => `${formatNumber(l)} simulações`}
                      />
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Line
                    type="monotone"
                    dataKey="Modelo teórico"
                    stroke={dark ? '#a1a1aa' : '#71717a'}
                    strokeDasharray="6 4"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Monte Carlo"
                    stroke={active.color}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 0, fill: active.color }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
              <span>
                <span className="mr-1 inline-block h-2.5 w-2.5 rounded-full" style={{ background: active.color }} />
                Linha contínua: Monte Carlo ({active.label})
              </span>
              <span>
                <span className="mr-1 inline-block h-0.5 w-4 rounded bg-zinc-400 align-middle" />
                Linha tracejada: Modelo teórico ({formatPercent(theoretical)})
              </span>
            </div>
          </>
        )}
      </Card>
    </section>
  )
}
