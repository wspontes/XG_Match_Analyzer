/**
 * Gera um número aleatório de Poisson (algoritmo de Knuth).
 * Adequado para lambdas pequenos e médios, como xG de futebol.
 */
function poissonRandom(lambda) {
  if (lambda <= 0) return 0
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= Math.random()
  } while (p > L)
  return k - 1
}

/**
 * Pontos de checagem para o gráfico de convergência,
 * sempre menores ou iguais ao número total de simulações.
 */
export function computeCheckpoints(n) {
  const set = new Set()
  for (const m of [1000, 5000, 10000, 50000, 100000, 250000, 500000, 1000000]) {
    if (m <= n) set.add(m)
  }
  for (const f of [0.005, 0.01, 0.05, 0.1, 0.25, 0.5]) {
    const v = Math.floor(n * f)
    if (v > 0 && v < n) set.add(v)
  }
  set.add(n)
  return Array.from(set).sort((a, b) => a - b)
}

/**
 * Executa a simulação Monte Carlo de forma assíncrona e em lotes,
 * mantendo a interface responsiva. Retorna contagens acumuladas e
 * a evolução (para o gráfico de convergência).
 */
export async function simulateMatch(
  homeXG,
  awayXG,
  simulations,
  onProgress,
  checkpoints = [],
) {
  const counts = {
    home: 0,
    draw: 0,
    away: 0,
    over25: 0,
    under25: 0,
    bttsYes: 0,
    bttsNo: 0,
  }
  const checkpointData = []
  const checkpointSet = new Set(checkpoints)
  const batch = Math.max(5000, Math.ceil(simulations / 100))
  let done = 0

  for (let start = 0; start < simulations; start += batch) {
    const end = Math.min(simulations, start + batch)
    for (let i = start; i < end; i++) {
      const h = poissonRandom(homeXG)
      const a = poissonRandom(awayXG)
      if (h > a) counts.home++
      else if (h === a) counts.draw++
      else counts.away++
      const total = h + a
      if (total > 2) counts.over25++
      if (total <= 2) counts.under25++
      if (h >= 1 && a >= 1) counts.bttsYes++
      else counts.bttsNo++
      done++
    }
    if (onProgress) onProgress(done, simulations)
    if (checkpointSet.has(done)) {
      checkpointData.push({
        simulations: done,
        home: counts.home / done,
        draw: counts.draw / done,
        away: counts.away / done,
      })
    }
    if (end < simulations) await new Promise((r) => setTimeout(r, 0))
  }

  return {
    counts,
    checkpointData,
    total: simulations,
  }
}
