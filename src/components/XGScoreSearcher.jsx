import { useState } from 'react'
import { Search, RefreshCw, Loader2, ArrowRight, CalendarDays, ExternalLink } from 'lucide-react'
import { Card, SectionHeading } from './ui'
import { formatDecimal } from '../utils/formatters'

export default function XGScoreSearcher({ onUse }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  const [used, setUsed] = useState(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/xgscore')
      const json = await res.json()
      if (!res.ok || json.error) {
        throw new Error(json.message || 'Não foi possível carregar as partidas.')
      }
      setData(json)
    } catch (e) {
      setError(e.message || 'Falha ao buscar partidas do xgscore.io.')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  const useMatch = (m) => {
    setUsed(m.link)
    onUse({
      homeName: m.homeTeam,
      awayName: m.awayTeam,
      homeXG: m.homeXG,
      awayXG: m.awayXG,
      gameId: m.gameId,
      odd: m.odd,
      tip: m.tip,
      valueBet: m.valueBet,
    })
  }

  const groups = data
    ? data.matches.reduce((acc, m) => {
        const key = m.league || 'Outros'
        if (!acc[key]) acc[key] = []
        acc[key].push(m)
        return acc
      }, {})
    : {}

  return (
    <section>
      <SectionHeading
        icon={Search}
        title="Buscar xG no xGscore"
        subtitle="Carregue as previsões de xG das partidas e use uma delas para preencher a análise"
        action={
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition-all hover:from-sky-600 hover:to-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {data ? 'Atualizar partidas' : 'Carregar partidas'}
          </button>
        }
      />

      <Card className="p-5">
        {!data && !loading && !error && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Clique em <b className="text-zinc-700 dark:text-zinc-200">Carregar partidas</b> para
            buscar as previsões de xG do xgscore.io. Toque em <b>Usar</b> em uma partida para
            preencher o formulário e calcular a análise.
          </p>
        )}

        {loading && (
          <div className="flex items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
            Buscando previsões no xgscore.io...
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-700 dark:text-red-400">
            {error}
            <p className="mt-1 text-xs text-red-600/70 dark:text-red-400/70">
              Verifique sua conexão ou tente novamente em alguns instantes. Você ainda pode informar
              os xG manualmente no formulário acima.
            </p>
          </div>
        )}

        {data && (
          <div className="max-h-[480px] space-y-5 overflow-y-auto pr-1">
            {Object.keys(groups).length === 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Nenhuma partida encontrada no momento.
              </p>
            )}
            {Object.entries(groups).map(([league, list]) => (
              <div key={league}>
                <h4 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {league}
                </h4>
                <div className="divide-y divide-zinc-100 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-700">
                  {list.map((m) => (
                    <div
                      key={m.link}
                      className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/40"
                    >
                      <span className="w-24 shrink-0 text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                        {m.dateTime}
                      </span>
                      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {m.homeTeam}
                        </span>
                        <span className="rounded-md bg-emerald-500/10 px-1.5 py-0.5 font-tabular text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {formatDecimal(m.homeXG, 2)}
                        </span>
                        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">×</span>
                        <span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 font-tabular text-xs font-bold text-sky-600 dark:text-sky-400">
                          {formatDecimal(m.awayXG, 2)}
                        </span>
                        <span className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                          {m.awayTeam}
                        </span>
                        {m.tip && m.odd && (
                          <span className="hidden items-center gap-1 rounded-md bg-zinc-500/10 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500 sm:inline-flex dark:text-zinc-400">
                            {m.tip} @ {formatDecimal(m.odd, 2)}
                          </span>
                        )}
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <a
                          href={`https://xgscore.io${m.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Abrir no xgscore"
                          className="rounded-lg border border-zinc-200 p-2 text-zinc-500 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => useMatch(m)}
                          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                            used === m.link
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                              : 'bg-emerald-500 text-white hover:bg-emerald-600'
                          }`}
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                          {used === m.link ? 'Usado' : 'Usar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {data && (
          <p className="mt-4 border-t border-zinc-100 pt-3 text-[11px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500">
            Fonte: xgscore.io (previsões de xG de terceiros). Verifique os termos de uso do site de
            origem. A análise probabilística continua sendo calculada localmente pelo modelo.
          </p>
        )}
      </Card>
    </section>
  )
}
