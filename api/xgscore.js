import { fetchXGScore, fetchOdds } from './parse.js'

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://localhost')
    const gameId = url.searchParams.get('gameId')

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')

    if (gameId) {
      const odds = await fetchOdds(gameId)
      return res.status(200).json(odds)
    }

    const data = await fetchXGScore()
    return res.status(200).json(data)
  } catch (err) {
    res.status(502).json({ error: true, message: err.message || 'Falha ao buscar dados do xgscore.io' })
  }
}