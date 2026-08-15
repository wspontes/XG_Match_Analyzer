/**
 * Converte uma string numérica aceitando vírgula ou ponto decimal.
 * Retorna número finito ou null.
 */
export function parseDecimal(value) {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  const cleaned = String(value).trim().replace(',', '.')
  if (cleaned === '') return null
  const num = Number(cleaned)
  return Number.isFinite(num) ? num : null
}

/**
 * Formata decimal no padrão brasileiro: 1,60
 */
export function formatDecimal(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })
}

/**
 * Formata porcentagem no padrão brasileiro: 45,12%
 */
export function formatPercent(value, digits = 2) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return `${formatDecimal(value * 100, digits)}%`
}

/**
 * Formata número inteiro com ponto de milhar: 100.000
 */
export function formatNumber(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  return Math.round(value).toLocaleString('pt-BR')
}

/**
 * Formata odd justa: 2,22
 */
export function formatOdd(value) {
  return formatDecimal(value, 2)
}

/**
 * Formata EV como porcentagem com sinal: +8,00% / -3,50%
 */
export function formatEV(value) {
  if (value === null || value === undefined || !Number.isFinite(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${formatDecimal(value * 100, 2)}%`
}
