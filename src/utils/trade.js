export const DEFAULT_COMMISSION = 0.02
export const DEFAULT_TARGET_PCT = 0.03

export function tickSize(odd) {
  if (odd < 2) return 0.01
  if (odd < 3) return 0.02
  if (odd < 4) return 0.05
  if (odd < 6) return 0.1
  if (odd < 10) return 0.2
  if (odd < 20) return 0.5
  if (odd < 30) return 1
  if (odd < 50) return 2
  if (odd < 100) return 5
  return 10
}

export function roundDownToTick(value) {
  if (value <= 1) return null
  const t = tickSize(Math.max(1.02, value))
  const rounded = Math.floor(value / t) * t
  return rounded <= 1 ? null : rounded
}

export function ticksBetween(entry, exit) {
  if (entry <= 1 || exit <= 1 || exit >= entry) return 0
  const grid = tickSize(entry)
  return Math.max(1, Math.round((entry - exit) / grid))
}

export function liability(stake, odd) {
  return stake * (odd - 1)
}

export function profitSimple(entryOdd, exitOdd, stake) {
  return stake * (entryOdd - exitOdd)
}

export function profitGreen(stake, exitOdd, entryOdd) {
  return stake * ((entryOdd - exitOdd) / exitOdd)
}

export function layStakeGreen(stake, exitOdd, entryOdd) {
  return stake * (entryOdd / exitOdd)
}

export function exitOddForProfit(entryOdd, profitFraction, commission = DEFAULT_COMMISSION) {
  const net = 1 - commission
  return roundDownToTick(entryOdd - profitFraction / net)
}

export function exitOddGreen(entryOdd, profitFraction, commission = DEFAULT_COMMISSION) {
  return roundDownToTick((entryOdd * (1 - commission)) / (1 - commission + profitFraction))
}