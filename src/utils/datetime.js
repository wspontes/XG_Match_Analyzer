function toLocalDate(iso) {
  const d = iso ? new Date(iso) : new Date()
  return Number.isNaN(d.getTime()) ? null : d
}

export function matchDayKey(iso) {
  const d = toLocalDate(iso)
  if (!d) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function matchTime(iso) {
  const d = toLocalDate(iso)
  if (!d) return ''
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export function matchDayLabel(iso) {
  const d = toLocalDate(iso)
  if (!d) return ''
  const s = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function matchDate(iso) {
  const d = toLocalDate(iso)
  if (!d) return ''
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}