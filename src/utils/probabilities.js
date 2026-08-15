import { poissonDistribution, MAX_GOALS } from './poisson.js'

/**
 * Gera a matriz de placares P(mandante = h, visitante = a).
 * A matriz é normalizada para que a soma seja exatamente 1,
 * eliminando qualquer resíduo da cauda da distribuição.
 */
export function generateScoreMatrix(homeXG, awayXG, maxGoals = MAX_GOALS) {
  const homeDist = poissonDistribution(homeXG, maxGoals)
  const awayDist = poissonDistribution(awayXG, maxGoals)
  const matrix = []
  let total = 0
  for (let h = 0; h <= maxGoals; h++) {
    const row = []
    for (let a = 0; a <= maxGoals; a++) {
      const p = homeDist[h] * awayDist[a]
      row.push(p)
      total += p
    }
    matrix.push(row)
  }
  for (let h = 0; h <= maxGoals; h++) {
    for (let a = 0; a <= maxGoals; a++) {
      matrix[h][a] /= total
    }
  }
  return { matrix, homeDist, awayDist, maxGoals }
}

/**
 * Probabilidades 1X2 a partir da matriz de placares.
 */
export function calculate1X2(matrix) {
  let home = 0
  let draw = 0
  let away = 0
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      const p = matrix[h][a]
      if (h > a) home += p
      else if (h === a) draw += p
      else away += p
    }
  }
  return { home, draw, away }
}

/**
 * Odd justa (fair odd) sem margem da casa: 1 / probabilidade.
 */
export function calculateFairOdds(probability) {
  if (!Number.isFinite(probability) || probability <= 0) return null
  return 1 / probability
}

/**
 * Over/Under a partir da matriz de placares (soma dos gols).
 * Under X.5 = P(total <= X), Over X.5 = 1 - Under.
 */
export function calculateOverUnder(matrix, line) {
  const intPart = Math.floor(line)
  let under = 0
  for (let h = 0; h < matrix.length; h++) {
    for (let a = 0; a < matrix[h].length; a++) {
      if (h + a <= intPart) under += matrix[h][a]
    }
  }
  return { over: 1 - under, under }
}

/**
 * BTTS (ambas marcam).
 * P(Sim) = P(mandante >= 1) * P(visitante >= 1), por independência.
 */
export function calculateBTTS(homeDist, awayDist) {
  const homeAny = 1 - homeDist[0]
  const awayAny = 1 - awayDist[0]
  const yes = homeAny * awayAny
  return { yes, no: 1 - yes }
}

/**
 * Dupla chance: 1X, X2, 12.
 */
export function calculateDoubleChance({ home, draw, away }) {
  return {
    '1X': home + draw,
    X2: draw + away,
    12: home + away,
  }
}

/**
 * Handicaps asiáticos calculados a partir da matriz de placares.
 * Para linhas inteiras (ex.: -1.0) existe probabilidade de push (devolução).
 */
export function calculateHandicapMatrix(matrix) {
  const lines = [
    { side: 'home', label: 'Mandante -0.5', line: -0.5 },
    { side: 'home', label: 'Mandante -1.0', line: -1.0 },
    { side: 'home', label: 'Mandante -1.5', line: -1.5 },
    { side: 'away', label: 'Visitante +0.5', line: 0.5 },
    { side: 'away', label: 'Visitante +1.0', line: 1.0 },
    { side: 'away', label: 'Visitante +1.5', line: 1.5 },
  ]
  return lines.map(({ side, label, line }) => {
    let win = 0
    let push = 0
    let loss = 0
    for (let h = 0; h < matrix.length; h++) {
      for (let a = 0; a < matrix[h].length; a++) {
        const margin = side === 'home' ? h - a : a - h
        const adjusted = margin + line
        const p = matrix[h][a]
        if (adjusted > 0) win += p
        else if (adjusted === 0) push += p
        else loss += p
      }
    }
    return { side, label, line, win, push, loss }
  })
}
