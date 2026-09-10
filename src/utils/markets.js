function cdf(dist, k) {
  let sum = 0
  for (let i = 0; i <= k; i++) sum += dist[i] || 0
  return sum
}

export function buildMarketCandidates(result, maxOdds) {
  if (!result || !maxOdds) return []
  const m = maxOdds
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
}