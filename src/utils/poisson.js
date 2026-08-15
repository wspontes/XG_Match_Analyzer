export const MAX_GOALS = 25

/**
 * P(X = k) = e^(-λ) * λ^k / k!
 * Calculada de forma iterativa para evitar overflow de fatorial.
 */
export function poissonProbability(lambda, k) {
  if (lambda < 0 || k < 0 || !Number.isInteger(k)) return 0
  if (lambda === 0) return k === 0 ? 1 : 0
  let p = Math.exp(-lambda)
  for (let i = 1; i <= k; i++) p *= lambda / i
  return p
}

/**
 * P(X <= k) — função de distribuição acumulada.
 */
export function poissonCDF(lambda, k) {
  if (k < 0) return 0
  let sum = 0
  for (let i = 0; i <= k; i++) sum += poissonProbability(lambda, i)
  return sum
}

/**
 * Vetor de probabilidades P(X = i) para i = 0..maxGoals.
 */
export function poissonDistribution(lambda, maxGoals = MAX_GOALS) {
  const arr = []
  let p = Math.exp(-lambda)
  arr.push(p)
  for (let i = 1; i <= maxGoals; i++) {
    p *= lambda / i
    arr.push(p)
  }
  return arr
}

/**
 * Vetor de probabilidades acumuladas P(X <= i) para i = 0..maxGoals.
 */
export function poissonCDFDistribution(lambda, maxGoals = MAX_GOALS) {
  let cum = 0
  const arr = []
  for (let i = 0; i <= maxGoals; i++) {
    cum += poissonProbability(lambda, i)
    arr.push(cum)
  }
  return arr
}
