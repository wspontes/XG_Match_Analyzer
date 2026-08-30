export function expectedValue(prob, odd) {
  if (!Number.isFinite(prob) || !Number.isFinite(odd) || prob <= 0 || odd <= 1) return null
  return prob * odd - 1
}

export function kellyFraction(prob, odd) {
  if (!Number.isFinite(prob) || !Number.isFinite(odd) || odd <= 1 || prob <= 0 || prob >= 1) return null
  const b = odd - 1
  const q = 1 - prob
  const f = (b * prob - q) / b
  if (!Number.isFinite(f)) return null
  return Math.max(0, Math.min(f, 0.25))
}