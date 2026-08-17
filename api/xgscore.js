import { fetchXGScore } from './parse.js'

export default async function handler(_req, res) {
  try {
    const data = await fetchXGScore()
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')
    res.status(200).json(data)
  } catch (err) {
    res.status(502).json({ error: true, message: err.message || 'Falha ao buscar dados do xgscore.io' })
  }
}
