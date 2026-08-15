import { useState } from 'react'
import { Wallet, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react'
import { Card, SectionHeading, Badge } from './ui'
import { formatPercent, formatOdd, formatEV, parseDecimal } from '../utils/formatters'

const rows = [
  {
    key: 'home',
    label: 'Mandante',
    color: 'text-emerald-600 dark:text-emerald-400',
    chip: 'bg-emerald-500/10',
  },
  {
    key: 'draw',
    label: 'Empate',
    color: 'text-amber-600 dark:text-amber-400',
    chip: 'bg-amber-500/10',
  },
  {
    key: 'away',
    label: 'Visitante',
    color: 'text-sky-600 dark:text-sky-400',
    chip: 'bg-sky-500/10',
  },
]

const inputBase =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

export default function OddsCalculator({ result }) {
  const [odds, setOdds] = useState({ home: '', draw: '', away: '' })

  const setOdd = (key, value) => setOdds((o) => ({ ...o, [key]: value }))

  const rowsData = rows.map((r) => {
    const modelProb = result.prob[r.key]
    const odd = parseDecimal(odds[r.key])
    const implied = odd && odd > 0 ? 1 / odd : null
    const ev = modelProb && odd ? modelProb * odd - 1 : null
    return { ...r, modelProb, odd, implied, ev }
  })

  return (
    <section>
      <SectionHeading
        icon={Wallet}
        title="Comparar com odds do mercado"
        subtitle="Informe as odds oferecidas para calcular probabilidade implícita e valor esperado (EV)"
      />
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {rowsData.map((r) => (
            <div key={r.key} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.chip} ${r.color}`}>
                  {r.label}
                </span>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Modelo: <b className="font-tabular">{formatPercent(r.modelProb)}</b>
                </span>
              </div>
              <label className="mt-3 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Odd do mercado
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={odds[r.key]}
                onChange={(e) => setOdd(r.key, e.target.value)}
                placeholder="Ex.: 2,40"
                className={`${inputBase} mt-1`}
              />
              <div className="mt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Prob. implícita</span>
                  <span className="font-tabular font-semibold text-zinc-800 dark:text-zinc-200">
                    {r.implied !== null ? formatPercent(r.implied) : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Odd justa do modelo</span>
                  <span className="font-tabular font-semibold text-zinc-800 dark:text-zinc-200">
                    {formatOdd(result.fairOdds[r.key])}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-100 pt-1.5 dark:border-zinc-800">
                  <span className="text-zinc-500 dark:text-zinc-400">Valor esperado (EV)</span>
                  {r.ev === null ? (
                    <span className="text-zinc-400 dark:text-zinc-500">—</span>
                  ) : r.ev > 0 ? (
                    <span className="flex items-center gap-1 font-tabular font-bold text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {formatEV(r.ev)}
                      <Badge color="emerald">EV positivo</Badge>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-tabular font-bold text-red-600 dark:text-red-400">
                      <ArrowDownRight className="h-3.5 w-3.5" />
                      {formatEV(r.ev)}
                      <Badge color="red">EV negativo</Badge>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <div className="flex items-start gap-2.5">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs leading-relaxed text-zinc-600 dark:text-zinc-300">
              EV = (probabilidade do modelo × odd do mercado) − 1. Exemplo: modelo 45% e odd 2,40 →
              EV = (0,45 × 2,40) − 1 = +0,08 = <b>+8%</b>. O EV é um indicador matemático: o modelo é
              apenas uma estimativa e não garante o resultado real da partida.
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
