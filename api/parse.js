const API_BASE = 'https://api.xgscore.io'
const UA =
  'Mozilla/5.0 (compatible; XGMatchAnalyzer/1.0; +https://github.com/wspontes/XG_Match_Analyzer)'

async function apiFetch(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'user-agent': UA },
    signal: AbortSignal.timeout(15000),
  })
  if (!res.ok) {
    throw new Error(`api.xgscore.io respondeu HTTP ${res.status}`)
  }
  return res.json()
}

function formatDateTime(iso) {
  if (!iso) return ''
  const m = String(iso).match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!m) return ''
  return `${m[3]}/${m[2]} ${m[4]}:${m[5]}`
}

function parseOddsRow(str) {
  try {
    const arr = JSON.parse(str)
    if (!Array.isArray(arr)) return null
    return Object.fromEntries(arr.map(([k, v]) => [String(k), v]))
  } catch {
    return null
  }
}

/**
 * Busca a lista de partidas com previsões públicas da API do xgscore.io.
 * Cada item retornado pela API é a previsão (value bet) de um jogo e já
 * embute o forecastScore (xG esperado) de cada time com 2 casas decimais.
 */
export async function fetchXGScore() {
  const items = await apiFetch('/forecasts/coming/public')

  const matches = []
  const seen = new Set()

  for (const item of items) {
    const game = item?.game
    if (!game || !game.teams || !game.tournament) continue
    const gameId = item.gameId || game.id
    if (!gameId || seen.has(gameId)) continue
    seen.add(gameId)

    const homeXG = game.forecastScore?.h
    const awayXG = game.forecastScore?.a
    if (typeof homeXG !== 'number' || typeof awayXG !== 'number') continue

    const homeTeam = game.teams.h?.name
    const awayTeam = game.teams.a?.name
    if (!homeTeam || !awayTeam) continue

    matches.push({
      gameId,
      league: game.tournament.name || '',
      leagueSlug: game.tournament.slug || '',
      dateTime: formatDateTime(game.datetime),
      homeTeam,
      homeXG,
      awayXG,
      awayTeam,
      homeLogo: game.teams.h?.logoUrl || null,
      awayLogo: game.teams.a?.logoUrl || null,
      link: `/${game.tournament.slug}/${game.slug}/xgscore`,
      odd: typeof item.startCf === 'number' ? item.startCf : null,
      tip: item.text || null,
      valueBet: typeof item.valueBet === 'number' ? item.valueBet : null,
    })
  }

  return { fetchedAt: new Date().toISOString(), matches }
}

const oddsCache = new Map()
const ODDS_TTL_MS = 5 * 60 * 1000

/**
 * Busca as odds reais (1X2, dupla chance e BTTS) de um jogo.
 * Retorna a média global (AVG) e a melhor odd disponível (MAX).
 */
export async function fetchOdds(gameId) {
  const now = Date.now()
  const cached = oddsCache.get(gameId)
  if (cached && now - cached.at < ODDS_TTL_MS) {
    return cached.data
  }

  const rows = await apiFetch(`/odds/game/${gameId}`)
  const avg = rows.find((r) => r.type === 'AVG')
  const max = rows.find((r) => r.type === 'MAX')

  const pick = (row) => ({
    r: row?.r ? parseOddsRow(row.r) : null,
    dc: row?.dc ? parseOddsRow(row.dc) : null,
    bts: row?.bts ? parseOddsRow(row.bts) : null,
    tm: row?.tm ? parseOddsRow(row.tm) : null,
    tl: row?.tl ? parseOddsRow(row.tl) : null,
    itm1: row?.itm1 ? parseOddsRow(row.itm1) : null,
    itl1: row?.itl1 ? parseOddsRow(row.itl1) : null,
    itm2: row?.itm2 ? parseOddsRow(row.itm2) : null,
    itl2: row?.itl2 ? parseOddsRow(row.itl2) : null,
    h1: row?.h1 ? parseOddsRow(row.h1) : null,
    h2: row?.h2 ? parseOddsRow(row.h2) : null,
    cs: row?.cs ? parseOddsRow(row.cs) : null,
  })

  const data = {
    gameId,
    fetchedAt: new Date().toISOString(),
    avg: avg ? pick(avg) : null,
    max: max ? pick(max) : null,
  }

  oddsCache.set(gameId, { at: Date.now(), data })
  return data
}