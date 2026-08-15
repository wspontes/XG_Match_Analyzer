import { Grid3x3 } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatDecimal } from '../utils/formatters'

const SIZE = 6

export default function ScoreMatrix({ result }) {
  let maxProb = 0
  for (let h = 0; h <= SIZE; h++) {
    for (let a = 0; a <= SIZE; a++) {
      if (result.matrix[h][a] > maxProb) maxProb = result.matrix[h][a]
    }
  }

  const isMostLikely = (h, a) =>
    result.mostLikely.home === h && result.mostLikely.away === a

  return (
    <section>
      <SectionHeading
        icon={Grid3x3}
        title="Matriz de placares"
        subtitle="P(mandante marcar X) × P(visitante marcar Y) — células mais prováveis em destaque"
      />
      <Card className="overflow-hidden p-5">
        <div className="overflow-x-auto">
          <table className="mx-auto border-separate border-spacing-1">
            <thead>
              <tr>
                <th className="px-2 pb-2 text-right text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                  Mandante \ Visitante
                </th>
                {Array.from({ length: SIZE + 1 }, (_, i) => (
                  <th key={i} className="w-12 pb-2 text-center text-xs font-bold text-sky-600 dark:text-sky-400">
                    {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: SIZE + 1 }, (_, h) => (
                <tr key={h}>
                  <td className="pr-2 text-right text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    {h}
                  </td>
                  {Array.from({ length: SIZE + 1 }, (_, a) => {
                    const p = result.matrix[h][a]
                    const intensity = maxProb > 0 ? p / maxProb : 0
                    const isMax = isMostLikely(h, a)
                    return (
                      <td key={a}>
                        <div
                          title={`${h} x ${a}`}
                          className={`relative flex h-12 w-12 flex-col items-center justify-center rounded-lg text-[11px] font-semibold font-tabular transition-transform hover:scale-105 ${
                            isMax
                              ? 'ring-2 ring-emerald-500 ring-offset-1 ring-offset-white dark:ring-offset-zinc-900'
                              : ''
                          }`}
                          style={{
                            background: `rgba(16, 185, 129, ${0.03 + intensity * 0.45})`,
                            color: intensity > 0.5 ? '#022c22' : '#065f46',
                          }}
                        >
                          <span>{formatDecimal(p * 100, 1)}%</span>
                          {isMax && (
                            <span className="text-[8px] font-bold uppercase tracking-wide text-emerald-800">
                              mais provável
                            </span>
                          )}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{ background: 'rgba(16,185,129,0.06)' }} />
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Menos provável</span>
            <span className="h-3 w-3 rounded-sm" style={{ background: 'rgba(16,185,129,0.48)' }} />
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Mais provável</span>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-center dark:border-emerald-500/40">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
              Placar mais provável
            </div>
            <div className="text-lg font-extrabold font-tabular text-zinc-900 dark:text-white">
              {result.mostLikely.home} x {result.mostLikely.away}{' '}
              <span className="text-emerald-600 dark:text-emerald-400">
                {formatDecimal(result.mostLikely.prob * 100, 2)}%
              </span>
            </div>
          </div>
        </div>
      </Card>
    </section>
  )
}
