import { useState } from 'react'
import { Dices, Play, Timer, Cpu } from 'lucide-react'
import { Card, SectionHeading, Badge, ProgressBar } from './ui'
import { formatPercent, formatNumber, formatDecimal } from '../utils/formatters'
import { SIMULATION_OPTIONS } from '../constants'
import { simulateMatch, computeCheckpoints } from '../utils/simulation'

function Comparison({ label, model, mc, color }) {
  const diff = mc - model
  return (
    <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Modelo: <b className={`font-tabular ${color}`}>{formatPercent(model)}</b>
        </span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          MC: <b className={`font-tabular ${color}`}>{formatPercent(mc)}</b>
        </span>
      </div>
      <div className={`mt-1 text-xs font-tabular font-semibold ${Math.abs(diff) < 0.005 ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
        Diferença: {diff >= 0 ? '+' : ''}
        {formatDecimal(diff * 100, 2)} pp
      </div>
    </div>
  )
}

export default function MonteCarlo({ result, match, onComplete, mcResult }) {
  const [simCount, setSimCount] = useState(100000)
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsed, setElapsed] = useState(null)

  const run = async () => {
    setRunning(true)
    setProgress(0)
    setElapsed(null)
    const start = performance.now()
    const checkpoints = computeCheckpoints(simCount)
    const res = await simulateMatch(
      result.homeXG,
      result.awayXG,
      simCount,
      (done, total) => setProgress(Math.round((done / total) * 100)),
      checkpoints,
    )
    res.elapsedMs = performance.now() - start
    setElapsed(res.elapsedMs)
    onComplete(res)
    setRunning(false)
  }

  const sim = mcResult
  const totals = sim
    ? {
        home: sim.counts.home / sim.total,
        draw: sim.counts.draw / sim.total,
        away: sim.counts.away / sim.total,
        over25: sim.counts.over25 / sim.total,
        under25: sim.counts.under25 / sim.total,
        bttsYes: sim.counts.bttsYes / sim.total,
        bttsNo: sim.counts.bttsNo / sim.total,
      }
    : null

  const ou25Model = result.overUnder.find((o) => o.line === 2.5)

  return (
    <section>
      <SectionHeading
        icon={Dices}
        title="Simulação Monte Carlo"
        subtitle="Validação estatística do modelo via números aleatórios com distribuição de Poisson"
        action={
          <span className="hidden items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 sm:flex">
            <Cpu className="h-3.5 w-3.5" />
            Executada no navegador
          </span>
        }
      />

      <Card className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Número de simulações
            </label>
            <div className="flex flex-wrap gap-2">
              {SIMULATION_OPTIONS.map((n) => (
                <button
                  key={n}
                  onClick={() => setSimCount(n)}
                  disabled={running}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold font-tabular transition-colors disabled:opacity-50 ${
                    simCount === n
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                      : 'border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800'
                  }`}
                >
                  {formatNumber(n)}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={run}
            disabled={running}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:from-violet-600 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-4 w-4" />
            {running ? 'Simulando...' : 'Executar simulação'}
          </button>
        </div>

        {running && (
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Gerando {formatNumber(simCount)} partidas com Poisson...</span>
              <span className="font-tabular font-bold">{progress}%</span>
            </div>
            <ProgressBar value={progress} color="bg-gradient-to-r from-violet-500 to-purple-500" />
          </div>
        )}

        {!running && !sim && (
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            A simulação Monte Carlo gera os gols de cada equipe seguindo Poisson(xG) e registra os
            resultados. Cada execução pode apresentar pequenas variações por ser aleatória.
          </p>
        )}

        {!running && sim && (
          <div className="mt-5">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge color="violet" className="!text-violet-600 dark:!text-violet-400">
                <Timer className="h-3 w-3" />
                {formatNumber(sim.total)} simulações
              </Badge>
              <Badge color="zinc">
                <Timer className="h-3 w-3" />
                {formatDecimal(elapsed / 1000, 2)}s de processamento
              </Badge>
            </div>

            <div className="grid gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    MODELO MATEMÁTICO × MONTE CARLO — 1X2
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Comparison
                    label="Vitória mandante"
                    model={result.prob.home}
                    mc={totals.home}
                    color="text-emerald-600 dark:text-emerald-400"
                  />
                  <Comparison
                    label="Empate"
                    model={result.prob.draw}
                    mc={totals.draw}
                    color="text-amber-600 dark:text-amber-400"
                  />
                  <Comparison
                    label="Vitória visitante"
                    model={result.prob.away}
                    mc={totals.away}
                    color="text-sky-600 dark:text-sky-400"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Comparison
                  label="Over 2.5"
                  model={ou25Model.over}
                  mc={totals.over25}
                  color="text-emerald-600 dark:text-emerald-400"
                />
                <Comparison
                  label="Under 2.5"
                  model={ou25Model.under}
                  mc={totals.under25}
                  color="text-sky-600 dark:text-sky-400"
                />
                <Comparison
                  label="BTTS Sim"
                  model={result.btts.yes}
                  mc={totals.bttsYes}
                  color="text-violet-600 dark:text-violet-400"
                />
              </div>

              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Quanto maior o número de simulações, mais próximo da probabilidade teórica o
                resultado tende a ficar (Lei dos Grandes Números). A simulação é uma validação
                estatística — não uma previsão garantida do resultado real.
              </p>
            </div>
          </div>
        )}
      </Card>
    </section>
  )
}
