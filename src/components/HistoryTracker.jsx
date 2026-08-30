import { useEffect, useMemo, useState } from 'react'
import { History as HistoryIcon, Save, Trash2, CheckCircle2, XCircle, Plus } from 'lucide-react'
import { Card, SectionHeading, Badge } from './ui'
import { formatPercent } from '../utils/formatters'
import { loadHistory, saveHistory } from '../utils/history'

function resolveOut(prob) {
  const max = Math.max(prob.home, prob.draw, prob.away)
  if (prob.home === max) return '1'
  if (prob.draw === max) return 'X'
  return '2'
}

function actualOut(h, a) {
  if (h > a) return '1'
  if (h === a) return 'X'
  return '2'
}

function Stat({ label, value }) {
  return (
    <Card className="p-4">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="mt-1 text-2xl font-extrabold font-tabular text-zinc-900 dark:text-white">
        {value}
      </div>
    </Card>
  )
}

function HitRow({ label, hit }) {
  if (hit === undefined) return null
  return (
    <div className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-2 py-1 text-xs dark:bg-zinc-800/60">
      <span className="text-zinc-500 dark:text-zinc-400">{label}</span>
      {hit ? (
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> Acertou
        </span>
      ) : (
        <span className="inline-flex items-center gap-1 font-semibold text-red-600 dark:text-red-400">
          <XCircle className="h-3.5 w-3.5" /> Errou
        </span>
      )}
    </div>
  )
}

export default function HistoryTracker({ match, result }) {
  const [list, setList] = useState(() => loadHistory())
  const [inputs, setInputs] = useState({})

  useEffect(() => {
    saveHistory(list)
  }, [list])

  const handleSaveCurrent = () => {
    if (!match || !result) return
    const record = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      homeName: match.homeName,
      awayName: match.awayName,
      homeXG: match.homeXG,
      awayXG: match.awayXG,
      snapshot: {
        prob: result.prob,
        mostLikely: result.mostLikely,
        topScores: result.topScores.slice(0, 3),
        btts: result.btts,
        ou25: result.overUnder.find((o) => o.line === 2.5),
        marketsRanking: result.marketsRanking.slice(0, 3).map((m) => m.name),
      },
      actual: null,
      updatedAt: null,
    }
    setList((prev) => [record, ...prev])
  }

  const handleInput = (id, field, value) => {
    setInputs((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const handleRegister = (id) => {
    const input = inputs[id] || {}
    const h = Number(input.homeGoals)
    const a = Number(input.awayGoals)
    if (!Number.isInteger(h) || !Number.isInteger(a) || h < 0 || a < 0) return
    setList((prev) =>
      prev.map((rec) =>
        rec.id === id
          ? { ...rec, actual: { homeGoals: h, awayGoals: a }, updatedAt: new Date().toISOString() }
          : rec,
      ),
    )
  }

  const handleDelete = (id) => {
    setList((prev) => prev.filter((rec) => rec.id !== id))
  }

  const stats = useMemo(() => {
    const resolved = list.filter((r) => r.actual)
    const acc = { total: resolved.length, out: 0, top1: 0, top3: 0, btts: 0, ou: 0 }
    for (const r of resolved) {
      const { homeGoals: h, awayGoals: a } = r.actual
      const modeled = resolveOut(r.snapshot.prob)
      if (modeled === actualOut(h, a)) acc.out++
      if (h === r.snapshot.mostLikely.home && a === r.snapshot.mostLikely.away) acc.top1++
      if (r.snapshot.topScores.some((s) => s.home === h && s.away === a)) acc.top3++
      const bttsHit = h > 0 && a > 0
      if ((r.snapshot.btts.yes > 0.5 ? true : false) === bttsHit) acc.btts++
      if (r.snapshot.ou25) {
        const over = h + a > 2.5
        if ((r.snapshot.ou25.over > 0.5 ? true : false) === over) acc.ou++
      }
    }
    return acc
  }, [list])

  const rate = (n) => (stats.total ? Math.round((n / stats.total) * 1000) / 10 : '—')

  return (
    <section className="space-y-6">
      <SectionHeading
        icon={HistoryIcon}
        title="Histórico e backtest"
        subtitle="Salve análises localmente, registre o resultado real e meça a acurácia do modelo ao longo do tempo"
      />

      {match && result && (
        <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="text-sm text-zinc-600 dark:text-zinc-300">
            Salvar a análise atual:{' '}
            <b className="text-zinc-900 dark:text-white">
              {match.homeName} {match.homeXG.toFixed(2)} x {match.awayXG.toFixed(2)} {match.awayName}
            </b>
          </div>
          <button
            onClick={handleSaveCurrent}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-colors hover:bg-emerald-600"
          >
            <Save className="h-4 w-4" /> Salvar no histórico
          </button>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Stat label="Analisadas" value={list.length} />
        <Stat label="Resolvidas" value={stats.total} />
        <Stat label="1X2" value={`${rate(stats.out)}%`} />
        <Stat label="Placar exato" value={`${rate(stats.top1)}%`} />
        <Stat label="Top 3 placares" value={`${rate(stats.top3)}%`} />
        <Stat label="BTTS + O/U 2.5" value={`${rate(stats.btts)}% / ${rate(stats.ou)}%`} />
      </div>

      {list.length === 0 ? (
        <Card className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
          Nenhum registro ainda. Calcule uma análise e salve para começar o backtest local.
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((rec) => {
            const resolved = !!rec.actual
            const input = inputs[rec.id] || {}
            const hits = resolved
              ? {
                  out: resolveOut(rec.snapshot.prob) === actualOut(rec.actual.homeGoals, rec.actual.awayGoals),
                  top1:
                    rec.actual.homeGoals === rec.snapshot.mostLikely.home &&
                    rec.actual.awayGoals === rec.snapshot.mostLikely.away,
                  top3: rec.snapshot.topScores.some(
                    (s) => s.home === rec.actual.homeGoals && s.away === rec.actual.awayGoals,
                  ),
                  btts: (rec.snapshot.btts.yes > 0.5) === (rec.actual.homeGoals > 0 && rec.actual.awayGoals > 0),
                  ou:
                    rec.snapshot.ou25 &&
                    (rec.snapshot.ou25.over > 0.5) === (rec.actual.homeGoals + rec.actual.awayGoals > 2.5),
                }
              : null
            return (
              <Card key={rec.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {rec.homeName} x {rec.awayName}
                      </h3>
                      {resolved ? (
                        <Badge color="sky">
                          Resultado: {rec.actual.homeGoals} x {rec.actual.awayGoals}
                        </Badge>
                      ) : (
                        <Badge color="amber">Aguardando resultado</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {formatPercent(rec.snapshot.prob.home)} / {formatPercent(rec.snapshot.prob.draw)} /{' '}
                      {formatPercent(rec.snapshot.prob.away)} · placar mais provável{' '}
                      <b className="text-zinc-700 dark:text-zinc-200">
                        {rec.snapshot.mostLikely.home} x {rec.snapshot.mostLikely.away}
                      </b>{' '}
                      · top mercados:{' '}
                      {rec.snapshot.marketsRanking.join(' · ') || ''}
                    </p>
                    <p className="mt-0.5 text-[11px] text-zinc-400 dark:text-zinc-600">
                      {new Date(rec.savedAt).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(rec.id)}
                    className="rounded-lg p-2 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
                    aria-label="Excluir registro"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {resolved ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                    <HitRow label="1X2" hit={hits.out} />
                    <HitRow label="Placar exato" hit={hits.top1} />
                    <HitRow label="Top 3 placares" hit={hits.top3} />
                    <HitRow label="BTTS" hit={hits.btts} />
                    <HitRow label="O/U 2.5" hit={hits.ou} />
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">Registrar resultado real:</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Gols casa"
                      value={input.homeGoals ?? ''}
                      onChange={(e) => handleInput(rec.id, 'homeGoals', e.target.value)}
                      className="w-24 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <span className="text-xs text-zinc-400">x</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Gols fora"
                      value={input.awayGoals ?? ''}
                      onChange={(e) => handleInput(rec.id, 'awayGoals', e.target.value)}
                      className="w-24 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm text-zinc-900 outline-none focus:border-emerald-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                    />
                    <button
                      onClick={() => handleRegister(rec.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
                    >
                      <Plus className="h-3.5 w-3.5" /> Registrar
                    </button>
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
      <p className="text-xs text-zinc-400 dark:text-zinc-600">
        O histórico é salvo apenas neste navegador (localStorage) e os índices medem a acurácia do modelo
        contra os resultados reais que você registrar.
      </p>
    </section>
  )
}