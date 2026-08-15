import { TrendingUp, Sigma, Dices } from 'lucide-react'

const features = [
  { icon: Sigma, label: 'Distribuição de Poisson' },
  { icon: TrendingUp, label: 'xG (Expected Goals)' },
  { icon: Dices, label: 'Simulação Monte Carlo' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%)]"
        aria-hidden
      />
      <div className="relative mx-auto max-w-7xl px-4 pb-6 pt-14 text-center sm:px-6 sm:pt-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          Análise 100% no navegador — sem backend
        </span>
        <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-white sm:text-5xl">
          Transforme dois números de{' '}
          <span className="bg-gradient-to-r from-emerald-500 to-sky-500 bg-clip-text text-transparent">
            xG em uma análise completa
          </span>{' '}
          da partida
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400 sm:text-base">
          Informe o nome dos times e o xG de cada equipe. O modelo calcula probabilidades 1X2,
          placares, Over/Under, BTTS, handicaps e valida os resultados com simulação Monte Carlo —
          tudo derivado matematicamente dos dados informados.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {features.map((f) => (
            <span
              key={f.label}
              className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-medium text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            >
              <f.icon className="h-3.5 w-3.5 text-emerald-500" />
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
