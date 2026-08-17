import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fetchXGScore } from './api/parse.js'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'xgscore-dev-api',
      configureServer(server) {
        server.middlewares.use('/api/xgscore', async (_req, res) => {
          res.setHeader('Content-Type', 'application/json')
          try {
            const data = await fetchXGScore()
            res.end(JSON.stringify(data))
          } catch (err) {
            res.statusCode = 502
            res.end(JSON.stringify({ error: true, message: err.message }))
          }
        })
      },
    },
  ],
})
