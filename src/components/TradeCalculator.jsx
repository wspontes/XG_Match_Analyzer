import { useEffect, useMemo, useState } from 'react'
import { Repeat2, ArrowRight, TrendingDown } from 'lucide-react'
import { Card, SectionHeading, Badge } from './ui'
import { formatDecimal } from '../utils/formatters'
import {
  exitOddForProfit,
  exitOddGreen,
  ticksBetween,
  layStakeGreen,
  liability,
  profitSimple,
  profitGreen,
  DEFAULT_COMMISSION,
  DEFAULT_TARGET_PCT,
} from '../utils/trade'

const inputClass =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">{label}</span>
      {children}
    </label>
  )
}

export default function TradeCalculator({ preset }) {
  const [entryOdd, setEntryOdd] = useState('1.80')
  const [stake, setStake] = useState('100')
  const [targetPct, setTargetPct] = useState(String(DEFAULT_TARGET_PCT * 100))
  const [commissionPct, setCommissionPct] = useState(String(DEFAULT_COMMISSION * 100))
  const [mode, setMode] = useState('simple')
  const [label, setLabel] = useState('')

  useEffect(() => {
    if (preset?.entryOdd) {
      setEntryOdd(String(preset.entryOdd))
      if (preset.label) setLabel(preset.label)
    }
  }, [preset])

  const calc = useMemo(() => {
    const E = parseFloat(entryOdd)
    const S = parseFloat(stake)
    const t = parseFloat(targetPct) / 100
    const c = parseFloat(commissionPct) / 100
    if (!Number.isFinite(E) || !Number.isFinite(S) || !Number.isFinite(t) || !Number.isFinite(c)) return null
    if (E <= 1 || S <= 0 || t <= 0 || c < 0) return null

    const L = mode === 'green' ? exitOddGreen(E, t, c) : exitOddForProfit(E, t, c)
    if (!L || L >= E) return { invalid: true, reason: 'Alvo impraticável com esta odd de entrada.' }

    const isGreen = mode === 'green'
    const layStake = isGreen ? layStakeGreen(S, L, E) : S
    const gross = isGreen ? profitGreen(S, L, E) : profitSimple(E, L, S)
    const net = gross * (1 - c)
    return {
      E,
      S,
      t,
      c,
      L,
      drop: E - L,
      ticks: ticksBetween(E, L),
      layStake,
      liability: liability(layStake, L),
      gross,
      net,
      isGreen,
    }
  }, [entryOdd, stake, targetPct, commissionPct, mode])

  return (
    <section>
      <SectionHeading
        icon={Repeat2}
        title="Calculadora Back → Lay"
        subtitle="Encontre a odd de saída (lay) para travar lucro de pelo menos X% da stake, respeitando os ticks da Betfair"
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
        <Card className="p-5">
          {label && (
            <div className="mb-3 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Mercado: {label}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Odd de entrada (Back)">
              <input
                type="number"
                step="0.01"
                min="1.01"
                value={entryOdd}
                onChange={(e) => setEntryOdd(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Stake (R$)">
              <input
                type="number"
                step="1"
                min="1"
                value={stake}
                onChange={(e) => setStake(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Lucro alvo (% da stake)">
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={targetPct}
                onChange={(e) => setTargetPct(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Comissão Betfair (%)">
              <input
                type="number"
                step="0.5"
                min="0"
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>

          <div className="mt-4">
            <span className="mb-1.5 block text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Como fechar
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode('simple')}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  mode === 'simple'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/40'
                }`}
              >
                Mesmo stake (zero loss)
              </button>
              <button
                onClick={() => setMode('green')}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
                  mode === 'green'
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/40'
                }`}
              >
                Verde balanceado
              </button>
            </div>
            <p className="mt-2 text-[11px] text-zinc-400 dark:text-zinc-600">
              <b>Mesmo stake:</b> lucro se o mercado "fechar" no seu sentido e 0 no outro.
              <br />
              <b>Verde balanceado:</b> lucro igual nos dois resultados (stake do lay ajustada). Requer queda
              maior da odd.
            </p>
          </div>
        </Card>

        <Card className="flex flex-col p-5">
          {!calc ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Preencha os campos para calcular.</p>
          ) : calc.invalid ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {calc.reason} Tente uma odd de entrada maior ou reduza o lucro alvo.
            </p>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Back
                  </div>
                  <div className="text-3xl font-extrabold font-tabular text-emerald-600 dark:text-emerald-400">
                    {formatDecimal(calc.E)}
                  </div>
                </div>
                <button
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400"
                  aria-label="Sentido do fechamento"
                >
                  <TrendingDown className="h-5 w-5" />
                </button>
                <div className="text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Alvo Lay
                  </div>
                  <div className="text-3xl font-extrabold font-tabular text-sky-600 dark:text-sky-400">
                    {formatDecimal(calc.L)}
                  </div>
                </div>
                <div className="ml-auto rounded-xl bg-zinc-100 px-3 py-2 text-center dark:bg-zinc-800">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Queda necessária
                  </div>
                  <div className="font-tabular font-bold text-zinc-900 dark:text-white">
                    −{formatDecimal(calc.drop)} · {calc.ticks} tick{calc.ticks === 1 ? '' : 's'}
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Stake do lay
                  </div>
                  <div className="mt-0.5 font-tabular font-bold text-zinc-900 dark:text-white">
                    R$ {formatDecimal(calc.layStake, 2)}
                  </div>
                </div>
                <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    Liable no lay
                  </div>
                  <div className="mt-0.5 font-tabular font-bold text-zinc-900 dark:text-white">
                    R$ {formatDecimal(calc.liability, 2)}
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-500/10 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600/70 dark:text-emerald-400/70">
                    Lucro bruto (≥{(calc.t * 100).toFixed(1)}%)
                  </div>
                  <div className="mt-0.5 font-tabular font-bold text-emerald-700 dark:text-emerald-400">
                    R$ {formatDecimal(calc.gross, 2)}
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-500/15 p-3">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Lucro líquido
                  </div>
                  <div className="mt-0.5 font-tabular font-bold text-emerald-700 dark:text-emerald-400">
                    R$ {formatDecimal(calc.net, 2)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {calc.isGreen ? (
                  <Badge color="emerald">Verde nos dois lados</Badge>
                ) : (
                  <>
                    <Badge color="emerald">Se vencer: +R$ {formatDecimal(calc.net, 2)}</Badge>
                    <Badge color="zinc">Se perder: R$ 0,00</Badge>
                  </>
                )}
                <span className="text-[11px] text-zinc-400 dark:text-zinc-600">
                  Liquidez/await: preencha o lay quando a odd chegar em {formatDecimal(calc.L)} ou menos.
                </span>
              </div>
            </div>
          )}
        </Card>
      </div>
      <p className="mt-3 flex items-start gap-1.5 text-[11px] text-zinc-400 dark:text-zinc-600">
        <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
        Odds da Betfair são discretas (ticks) e a liquidez varia — a odd de saída é arredondada para o tick
        que garante o lucro mínimo alvo. Comece com stake pequena e valide a liquidez antes de entrar.
      </p>
    </section>
  )
}