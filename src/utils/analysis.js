import {
  generateScoreMatrix,
  calculate1X2,
  calculateFairOdds,
  calculateOverUnder,
  calculateBTTS,
  calculateDoubleChance,
  calculateHandicapMatrix,
} from './probabilities.js'
import { poissonCDFDistribution } from './poisson.js'

const OVER_UNDER_LINES = [0.5, 1.5, 2.5, 3.5, 4.5]

function classifyTotal(total) {
  if (total < 2.2) return { label: 'Baixo', range: 'xG total < 2,2' }
  if (total <= 3.2) return { label: 'Médio', range: '2,2 ≤ xG total ≤ 3,2' }
  return { label: 'Alto', range: 'xG total > 3,2' }
}

function computeTeamGoals(dist) {
  const exact = dist.slice(0, 11)
  const atLeast = []
  for (let k = 1; k <= 4; k++) {
    let sum = 0
    for (let i = k; i < dist.length; i++) sum += dist[i]
    atLeast.push(sum)
  }
  return { exact, atLeast }
}

/**
 * Constrói o objeto de análise completo a partir dos xG.
 * Todo o cálculo usa valores decimais completos — o arredondamento
 * acontece apenas na apresentação.
 */
export function buildAnalysis(homeXG, awayXG) {
  const { matrix, homeDist, awayDist } = generateScoreMatrix(homeXG, awayXG)

  const prob = calculate1X2(matrix)
  const fairOdds = {
    home: calculateFairOdds(prob.home),
    draw: calculateFairOdds(prob.draw),
    away: calculateFairOdds(prob.away),
  }

  const overUnder = OVER_UNDER_LINES.map((line) => {
    const { over, under } = calculateOverUnder(matrix, line)
    return {
      line,
      over,
      under,
      overOdd: calculateFairOdds(over),
      underOdd: calculateFairOdds(under),
    }
  })

  const btts = calculateBTTS(homeDist, awayDist)
  const bttsOdds = {
    yes: calculateFairOdds(btts.yes),
    no: calculateFairOdds(btts.no),
  }

  const doubleChance = calculateDoubleChance(prob)
  const doubleChanceOdds = {}
  for (const key of ['1X', 'X2', '12']) {
    doubleChanceOdds[key] = calculateFairOdds(doubleChance[key])
  }

  const handicaps = calculateHandicapMatrix(matrix).map((h) => ({
    ...h,
    winOdd: calculateFairOdds(h.win),
  }))

  const scores = []
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      scores.push({ home: h, away: a, prob: matrix[h][a] })
    }
  }
  scores.sort((x, y) => y.prob - x.prob)

  const mostLikely = {
    home: scores[0].home,
    away: scores[0].away,
    prob: scores[0].prob,
    odd: calculateFairOdds(scores[0].prob),
  }

  const topScores = scores.slice(0, 10).map((s) => ({
    ...s,
    odd: calculateFairOdds(s.prob),
  }))

  const totalGoals = []
  for (let t = 0; t <= matrix.length - 1; t++) {
    let p = 0
    for (let h = 0; h <= t && h < matrix.length; h++) {
      const a = t - h
      if (a < matrix[h].length) p += matrix[h][a]
    }
    totalGoals.push(p)
  }

  const homeCDF = poissonCDFDistribution(homeXG, matrix.length - 1)
  const awayCDF = poissonCDFDistribution(awayXG, matrix.length - 1)

  const totalXG = homeXG + awayXG
  const classification = classifyTotal(totalXG)

  const candidates = [
    { name: 'Vitória do mandante', prob: prob.home },
    { name: 'Empate', prob: prob.draw },
    { name: 'Vitória do visitante', prob: prob.away },
    { name: 'BTTS Sim', prob: btts.yes },
    { name: 'BTTS Não', prob: btts.no },
    { name: 'Dupla chance 1X', prob: doubleChance['1X'] },
    { name: 'Dupla chance X2', prob: doubleChance.X2 },
    { name: 'Dupla chance 12', prob: doubleChance['12'] },
    ...overUnder.flatMap((ou) => [
      { name: `Over ${ou.line.toFixed(1)}`, prob: ou.over },
      { name: `Under ${ou.line.toFixed(1)}`, prob: ou.under },
    ]),
  ]
  const marketsRanking = candidates
    .map((c) => ({ ...c, odd: calculateFairOdds(c.prob) }))
    .sort((a, b) => b.prob - a.prob)
    .slice(0, 12)

  return {
    homeXG,
    awayXG,
    totalXG,
    classification,
    homeDist,
    awayDist,
    homeCDF,
    awayCDF,
    matrix,
    prob,
    fairOdds,
    overUnder,
    btts,
    bttsOdds,
    doubleChance,
    doubleChanceOdds,
    handicaps,
    teamGoals: { home: computeTeamGoals(homeDist), away: computeTeamGoals(awayDist) },
    mostLikely,
    topScores,
    totalGoals,
    marketsRanking,
  }
}
