import { useMemo } from 'react'
import { Repeat2, ArrowDownRight } from 'lucide-react'
import { Card, SectionHeading, Badge } from './ui'
import { formatPercent, formatOdd, formatEV } from '../utils/formatters'
import { buildMarketCandidates } from '../utils/markets'
import { exitOddForProfit, DEFAULT_COMMISSION, DEFAULT_TARGET_PCT } from '../utils/trade'

export default function TradeWindows({ result, marketOdds, onSelect }) {
  const rows = useMemo(() => {
    if (!result || !marketOdds?.max) return []
    return buildMarketCandidates(result, marketOdds.max)
      .map((c) => {
        const fair = 1 / c.prob
        const dev = c.prob * c.odd - 1
        const exitOdd = exitOddForProfit(c.odd, DEFAULT_TARGET_PCT, DEFAULT_COMMISSION)
        const direction = dev > 0.005 ? 'back' : dev < -0.005 ? 'lay' : 'flat'
        return { ...c, fair, dev, exitOdd, direction }
      })
      .sort((a, b) => b.dev - a.dev)
  }, [result, marketOdds])

  if (!marketOdds?.max) {
    return (
      <section>
        <SectionHeading
          icon={Repeat2}
          title="Janelas de trade"
          subtitle="Oportunidades de entrar (Back) na odds gorda e fechar (Lay) quando a odd comprimir"
        />
        <Card className="p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Selecione um jogo na busca do xgscore para calcular as janelas de trade por mercado.
          </p>
        </Card>
      </section>
    )
  }

  return (
    <section>
      <SectionHeading
        icon={Repeat2}
        title="Janelas de trade"
        subtitle="Odds atuais (MAX) × fair do modelo e a odd-alvo para travar ≥3% da stake (comissão 2% — edite na calculadora)"
      />
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-5 py-3 font-semibold">Mercado</th>
                <th className="px-5 py-3 font-semibold">Seleção</th>
                <th className="px-5 py-3 text-right font-semibold">Odd atual</th>
                <th className="px-5 py-3 text-right font-semibold">Fair (modelo)</th>
                <th className="px-5 py-3 text-right font-semibold">Desvio</th>
                <th className="px-5 py-3 text-right font-semibold">Alvo de fechamento (3%)</th>
                <th className="px-5 py-3 text-right font-semibold">Direção</th>
                <th className="px-5 py-3 text-right font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={`${r.market}-${r.pick}`}
                  className="border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40"
                >
                  <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">{r.market}</td>
                  <td className="px-5 py-3">
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">{r.pick}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-tabular font-bold text-zinc-900 dark:text-white">
                    {formatOdd(r.odd)}
                  </td>
                  <td className="px-5 py-3 text-right font-tabular text-zinc-500 dark:text-zinc-400">
                    {formatOdd(r.fair)}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span
                      className={`inline-flex items-center gap-1 font-tabular font-bold ${
                        r.direction === 'back'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : r.direction === 'lay'
                            ? 'text-sky-600 dark:text-sky-400'
                            : 'text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      {formatEV(r.dev)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right font-tabular font-semibold text-zinc-700 dark:text-zinc-200">
                    {r.exitOdd ? (
                      <span className="inline-flex items-center gap-1">
                        <ArrowDownRight className="h-3.5 w-3.5 text-sky-500" />
                        {formatOdd(r.exitOdd)} <span className="text-[10px] text-zinc-400">(lay)</span>
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    {r.direction === 'back' ? (
                      <Badge color="emerald">Back</Badge>
                    ) : r.direction === 'lay' ? (
                      <Badge color="sky">Lay</Badge>
                    ) : (
                      <Badge color="zinc">=</Badge>
                    )}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => onSelect({ label: `${r.market} · ${r.pick}`, entryOdd: r.odd })}
                      className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      Calcular
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <b className="text-zinc-700 dark:text-zinc-300">Back</b>: odd acima do fair — entrada de valor,
          feche quando a odd cair. <b className="text-zinc-700 dark:text-zinc-300">Lay</b>: odd abaixo do
          fair — entre no lay e feche quando subir. As odds exibidas são do agregador (xgscore); as da
          Betfair podem variar — use como referência e valide a liquidez.
        </p>
      </Card>
    </section>
  )
}