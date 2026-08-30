import { useMemo, useState } from 'react'
import { BadgeDollarSign, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'
import { Card, SectionHeading, Badge } from './ui'
import { formatPercent, formatOdd, formatEV } from '../utils/formatters'
import { expectedValue, kellyFraction } from '../utils/value'

function cdf(dist, k) {
  let sum = 0
  for (let i = 0; i <= k; i++) sum += dist[i] || 0
  return sum
}

export default function ValueBets({ result, marketOdds }) {
  const [sort, setSort] = useState({ key: 'ev', dir: 'desc' })

  const toggleSort = (key) => {
    setSort((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' }
        : { key, dir: 'desc' },
    )
  }

  const SortIndicator = ({ active }) =>
    active ? (
      sort.dir === 'desc' ? (
        <ArrowDown className="ml-1 inline h-3 w-3" />
      ) : (
        <ArrowUp className="ml-1 inline h-3 w-3" />
      )
    ) : null

  const bets = useMemo(() => {
    if (!result || !marketOdds?.max) return []
    const m = marketOdds.max
    const candidates = []

    const add = (market, pick, prob, odd) => {
      if (!Number.isFinite(prob) || !Number.isFinite(odd) || odd <= 1) return
      candidates.push({ market, pick, prob, odd })
    }

    const out = (obj, key) => (obj && obj[key] !== undefined ? Number(obj[key]) : null)

    add('1X2', 'Vitória do mandante', result.prob.home, out(m.r, '1'))
    add('1X2', 'Empate', result.prob.draw, out(m.r, 'x'))
    add('1X2', 'Vitória do visitante', result.prob.away, out(m.r, '2'))

    add('Dupla chance', 'Dupla chance 1X', result.doubleChance['1X'], out(m.dc, '1x'))
    add('Dupla chance', 'Dupla chance X2', result.doubleChance.X2, out(m.dc, 'x2'))
    add('Dupla chance', 'Dupla chance 12', result.doubleChance['12'], out(m.dc, '12'))

    add('BTTS', 'BTTS — Sim', result.btts.yes, out(m.bts, 'yes'))
    add('BTTS', 'BTTS — Não', result.btts.no, out(m.bts, 'no'))

    for (const ou of result.overUnder) {
      const key = String(ou.line)
      add('Total de gols', `Over ${ou.line.toFixed(1)}`, ou.over, out(m.tm, key))
      add('Total de gols', `Under ${ou.line.toFixed(1)}`, ou.under, out(m.tl, key))
    }

    const teamLines = [
      { line: 0.5, overIdx: 0 },
      { line: 1.5, overIdx: 1 },
      { line: 2.5, overIdx: 2 },
      { line: 3.5, overIdx: 3 },
    ]
    for (const { line, overIdx } of teamLines) {
      const key = String(line)
      const homeOver = 1 - cdf(result.homeDist, overIdx)
      const homeUnder = cdf(result.homeDist, overIdx)
      const awayOver = 1 - cdf(result.awayDist, overIdx)
      const awayUnder = cdf(result.awayDist, overIdx)
      add('Gols do mandante', `Mandante ${line.toFixed(1)} gols+`, homeOver, out(m.itm1, key))
      add('Gols do mandante', `Mandante ${line.toFixed(1)} gols-`, homeUnder, out(m.itl1, key))
      add('Gols do visitante', `Visitante ${line.toFixed(1)} gols+`, awayOver, out(m.itm2, key))
      add('Gols do visitante', `Visitante ${line.toFixed(1)} gols-`, awayUnder, out(m.itl2, key))
    }

    for (const h of result.handicaps) {
      if (!(h.line % 1)) continue
      const key = String(h.line)
      const real = h.side === 'home' ? out(m.h1, key) : out(m.h2, key)
      add('Handicap asiático', h.label, h.win, real)
    }

    for (const s of result.topScores.slice(0, 5)) {
      const key = `${s.home}-${s.away}`
      add('Placar exato', `${s.home} x ${s.away}`, s.prob, out(m.cs, key))
    }

    return candidates
      .map((c) => {
        const ev = expectedValue(c.prob, c.odd)
        const kelly = kellyFraction(c.prob, c.odd)
        return { ...c, ev, kelly }
      })
      .filter((c) => c.ev !== null && c.ev > 0.005)
      .sort((a, b) => b.ev - a.ev)
  }, [result, marketOdds])

  const sortedBets = useMemo(() => {
    if (sort.key === 'ev') return bets
    const dir = sort.dir === 'asc' ? 1 : -1
    return [...bets].sort((a, b) => (a[sort.key] - b[sort.key]) * dir)
  }, [bets, sort])

  const bestEV = bets.length ? Math.max(...bets.map((b) => b.ev)) : null

  if (!marketOdds?.max) {
    return (
      <section>
        <SectionHeading
          icon={BadgeDollarSign}
          title="Apostas de valor (EV)"
          subtitle="Comparação automática entre as probabilidades do modelo e as odds reais do mercado"
        />
        <Card className="p-5">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Selecione um jogo na busca do xgscore acima para comparar os mercados automaticamente.
          </p>
        </Card>
      </section>
    )
  }

  return (
    <section>
      <SectionHeading
        icon={BadgeDollarSign}
        title="Apostas de valor (EV)"
        subtitle="Mercados com expectativa de valor positivo usando as melhores odds (MAX) do xgscore"
      />
      <Card className="overflow-hidden">
        {bets.length === 0 ? (
          <p className="px-5 py-6 text-sm text-zinc-500 dark:text-zinc-400">
            Nenhum mercado com valor positivo encontrado com as odds atuais.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="px-5 py-3 font-semibold">Mercado</th>
                  <th className="px-5 py-3 font-semibold">Seleção</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    <button
                      onClick={() => toggleSort('prob')}
                      title="Ordenar por probabilidade"
                      className={`inline-flex items-center gap-0.5 uppercase transition-colors ${
                        sort.key === 'prob'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      Prob. modelo
                      <SortIndicator active={sort.key === 'prob'} />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">Odd justa</th>
                  <th className="px-5 py-3 text-right font-semibold">Odd real</th>
                  <th className="px-5 py-3 text-right font-semibold">
                    <button
                      onClick={() => toggleSort('ev')}
                      title="Ordenar por EV"
                      className={`inline-flex items-center gap-0.5 uppercase transition-colors ${
                        sort.key === 'ev'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'hover:text-zinc-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      EV
                      <SortIndicator active={sort.key === 'ev'} />
                    </button>
                  </th>
                  <th className="px-5 py-3 text-right font-semibold">Stake (meio Kelly)</th>
                </tr>
              </thead>
              <tbody>
                {sortedBets.map((b) => (
                  <tr
                    key={`${b.market}-${b.pick}`}
                    className={`border-b border-zinc-100 transition-colors hover:bg-zinc-50 dark:border-zinc-800/60 dark:hover:bg-zinc-800/40 ${
                      b.ev === bestEV ? 'bg-emerald-500/5' : ''
                    }`}
                  >
                    <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">{b.market}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{b.pick}</span>
                        {b.ev === bestEV && <Badge color="emerald">Melhor EV</Badge>}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-tabular font-semibold text-zinc-800 dark:text-zinc-200">
                      {formatPercent(b.prob)}
                    </td>
                    <td className="px-5 py-3 text-right font-tabular text-zinc-500 dark:text-zinc-400">
                      {formatOdd(1 / b.prob)}
                    </td>
                    <td className="px-5 py-3 text-right font-tabular font-bold text-zinc-900 dark:text-white">
                      {formatOdd(b.odd)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="inline-flex items-center gap-1 font-tabular font-bold text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="h-3.5 w-3.5" />
                        {formatEV(b.ev)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-tabular font-semibold text-zinc-700 dark:text-zinc-200">
                      {b.kelly !== null ? `${((b.kelly / 2) * 100).toFixed(1)}%` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {bets.length > 0 && (
          <p className="border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
            <b className="text-zinc-700 dark:text-zinc-300">EV</b> = probabilidade do modelo × odd real − 1.
            O sugerido é <b className="text-zinc-700 dark:text-zinc-300">meio Kelly</b> (percentual da banca):
            Kelly cheio = (b·p − q) / b, com b = odd − 1. Use com critério; o modelo é estimativa.
          </p>
        )}
      </Card>
    </section>
  )
}