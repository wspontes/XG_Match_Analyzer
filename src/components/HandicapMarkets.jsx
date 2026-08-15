import { GitCompareArrows } from 'lucide-react'
import { Card, SectionHeading, Badge } from './ui'
import { formatPercent, formatOdd } from '../utils/formatters'

export default function HandicapMarkets({ result }) {
  return (
    <section>
      <SectionHeading
        icon={GitCompareArrows}
        title="Handicap asiático"
        subtitle="Probabilidades de vitória, empate (push/devolução) e derrota para cada linha — calculadas pela matriz de placares"
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-5 py-3 font-semibold">Mercado</th>
                <th className="px-5 py-3 text-right font-semibold">Vitória</th>
                <th className="px-5 py-3 text-right font-semibold">Empate / Push</th>
                <th className="px-5 py-3 text-right font-semibold">Derrota</th>
                <th className="px-5 py-3 text-right font-semibold">Odd justa (vitória)</th>
              </tr>
            </thead>
            <tbody>
              {result.handicaps.map((h) => (
                <tr
                  key={h.label}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{h.label}</span>
                      {h.push > 0.0001 && (
                        <Badge color="amber">Linha com push</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right font-tabular font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatPercent(h.win)}
                  </td>
                  <td className="px-5 py-3 text-right font-tabular font-medium text-zinc-700 dark:text-zinc-200">
                    {formatPercent(h.push)}
                  </td>
                  <td className="px-5 py-3 text-right font-tabular font-medium text-red-600 dark:text-red-400">
                    {formatPercent(h.loss)}
                  </td>
                  <td className="px-5 py-3 text-right font-tabular font-medium text-zinc-700 dark:text-zinc-200">
                    {formatOdd(h.winOdd)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Em linhas asiáticas inteiras (ex.: -1,0 / +1,0), quando o resultado ajustado for exatamente
          zero a aposta é devolvida (push). Linhas terminadas em 0,5 nunca geram devolução.
        </p>
      </Card>
    </section>
  )
}
