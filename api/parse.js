const HOME_URL = 'https://xgscore.io/'

function cleanText(s) {
  return (s || '').replace(/<!---->/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Extrai as previsões de xG das partidas exibidas na página inicial
 * do xgscore.io (Angular SSR). Cada partida está em um
 * <a class="xgs-panel_link xgs-fixture_link" href="..."> com dois <mark>
 * contendo o xG previsto (bg-primary = mandante, bg-secondary = visitante).
 */
export function parseXGScore(html) {
  const leagues = []
  const leagueRe = /<xgs-tournament-label[\s\S]*?<span class="bold-text">\s*([\s\S]*?)\s*<\/span>/g
  let lm
  while ((lm = leagueRe.exec(html)) !== null) {
    const name = cleanText(lm[1])
    if (name) leagues.push({ pos: lm.index, name })
  }

  const leagueFor = (pos) => {
    let best = null
    for (const l of leagues) {
      if (l.pos <= pos) best = l
      else break
    }
    return best?.name || ''
  }

  const fixtureRe =
    /<a class="xgs-panel_link xgs-fixture_link[^"]*"\s+href="([^"]+)"\s*>([\s\S]*?)<\/a>/g

  const teamRe = /<span class="xgs-fixture_team[^>]*>([\s\S]*?)<\/span>/g
  const xgMarkRe =
    /class="xgs-mark (bg-primary|bg-secondary)[^"]*"[^>]*>\s*<strong[^>]*>\s*([\d.]+)\s*<\/strong>/g

  const matches = []
  const seen = new Set()

  for (const fm of html.matchAll(fixtureRe)) {
    const block = fm[2]
    if (!block.includes('xgs-public-forecast-fixture-score')) continue

    const link = fm[1]
    if (seen.has(link)) continue
    seen.add(link)

    const teamSpans = []
    let tm
    teamRe.lastIndex = 0
    while ((tm = teamRe.exec(block)) !== null) teamSpans.push(tm[1])
    const teamName = (i) => cleanText((teamSpans[i] || '').replace(/<img[\s\S]*?>/g, ''))

    const marks = []
    let xm
    xgMarkRe.lastIndex = 0
    while ((xm = xgMarkRe.exec(block)) !== null) marks.push(xm)

    const primary = marks.find((x) => x[1] === 'bg-primary')
    const secondary = marks.find((x) => x[1] === 'bg-secondary')

    const homeTeam = teamName(0)
    const awayTeam = teamName(1)
    if (!homeTeam || !awayTeam) continue

    const homeXG = primary ? parseFloat(primary[2]) : null
    const awayXG = secondary ? parseFloat(secondary[2]) : null
    if (homeXG === null || awayXG === null) continue

    const dt = block.match(
      /<span class="text-muted ng-star-inserted">\s*([^<]+?)\s*<\/span>(?:<!---->)?\s*<span class="text-muted">\s*([^<]+?)\s*<\/span>/,
    )
    const dateTime = dt ? cleanText(`${dt[1]} ${dt[2]}`) : ''

    const oddM = block.match(/class="[^"]*bg-success[^"]*"[^>]*>\s*<strong[^>]*>\s*([\d.]+)\s*<\/strong>/)
    const odd = oddM ? parseFloat(oddM[1]) : null

    matches.push({
      league: leagueFor(fm.index),
      dateTime,
      homeTeam,
      homeXG,
      awayXG,
      awayTeam,
      link,
      odd,
    })
  }

  return matches
}

let cache = { at: 0, data: null }
const CACHE_TTL_MS = 5 * 60 * 1000

/**
 * Busca e analisa a página do xgscore.io, com cache curto
 * para evitar requisições excessivas ao site de origem.
 */
export async function fetchXGScore() {
  const now = Date.now()
  if (cache.data && now - cache.at < CACHE_TTL_MS) {
    return cache.data
  }

  const res = await fetch(HOME_URL, {
    headers: {
      'user-agent': 'Mozilla/5.0 (compatible; XGMatchAnalyzer/1.0; +https://github.com/wspontes/XG_Match_Analyzer)',
    },
    signal: AbortSignal.timeout(15000),
  })

  if (!res.ok) {
    throw new Error(`xgscore.io respondeu HTTP ${res.status}`)
  }

  const html = await res.text()
  const data = { fetchedAt: new Date().toISOString(), matches: parseXGScore(html) }

  cache = { at: Date.now(), data }
  return data
}
