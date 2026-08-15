import { Activity, AlertTriangle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-sky-600 text-white">
                <Activity className="h-4 w-4" />
              </span>
              <span className="text-sm font-bold text-zinc-900 dark:text-white">
                XG Match Analyzer
              </span>
            </div>
            <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
              Ferramenta educacional de análise probabilística de partidas de futebol baseada em
              xG, distribuição de Poisson e simulação Monte Carlo.
            </p>
          </div>
          <div className="md:col-span-2">
            <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-200 sm:text-sm">
                Os resultados apresentados são estimativas matemáticas do modelo e não garantem o
                resultado real da partida. O modelo utiliza apenas os xG informados e não considera
                automaticamente escalações, lesões, forma recente, clima, motivação, cartões,
                arbitragem, desfalques ou dependência entre eventos.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 sm:flex-row">
          <span>© {new Date().getFullYear()} XG Match Analyzer — todos os cálculos no navegador.</span>
          <span>Nenhuma aposta é recomendada. Jogue com responsabilidade.</span>
        </div>
      </div>
    </footer>
  )
}
