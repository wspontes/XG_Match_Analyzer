import { BookOpen, ListChecks, FunctionSquare, AlertTriangle } from 'lucide-react'
import { Card, SectionHeading } from './ui'

const steps = [
  {
    title: '1. Informe o xG de cada equipe',
    desc: 'O xG (Expected Goals) estima quantos gols, em média, cada equipe deve marcar na partida, considerando a qualidade das chances criadas.',
  },
  {
    title: '2. O xG vira uma distribuição de Poisson',
    desc: 'O sistema usa o xG como parâmetro λ da distribuição de Poisson, que estima a probabilidade de a equipe marcar 0, 1, 2, 3... gols.',
  },
  {
    title: '3. Distribuições são combinadas',
    desc: 'As distribuições das duas equipes são combinadas (multiplicadas célula a célula) para calcular a probabilidade de cada placar possível.',
  },
  {
    title: '4. Placar gera os mercados',
    desc: 'A partir da matriz de placares são calculados 1X2, Over/Under, BTTS, dupla chance, handicaps asiáticos e todas as demais probabilidades.',
  },
  {
    title: '5. Precisão em todos os passos',
    desc: 'Todos os cálculos usam valores decimais completos internamente. O arredondamento acontece apenas na apresentação dos resultados.',
  },
  {
    title: '6. Monte Carlo valida o modelo',
    desc: 'A simulação Monte Carlo gera milhares de partidas aleatórias seguindo as mesmas distribuições e compara os resultados com a probabilidade teórica.',
  },
]

const limitations = [
  'Escalações e desfalques',
  'Lesões',
  'Mando de campo além do xG informado',
  'Forma recente das equipes',
  'Clima',
  'Motivação',
  'Cartões e arbitragem',
  'Dependência entre eventos',
]

export default function Methodology() {
  return (
    <section>
      <SectionHeading
        icon={BookOpen}
        title="Como funciona?"
        subtitle="A metodologia do modelo em passos simples"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((s) => (
          <Card key={s.title} className="p-5">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">{s.desc}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-4 p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <FunctionSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-zinc-900 dark:text-white">A fórmula de Poisson</h3>
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
          Para cada equipe, a probabilidade de marcar exatamente k gols é:
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-zinc-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-950">
          <span className="text-lg font-semibold text-zinc-900 dark:text-white sm:text-xl">
            P(X = k) = e<sup>-λ</sup> · λ<sup>k</sup> / k!
          </span>
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800/60">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              λ (lambda)
            </div>
            <div className="mt-1 text-zinc-800 dark:text-zinc-200">o xG da equipe (gols esperados)</div>
          </div>
          <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800/60">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              k
            </div>
            <div className="mt-1 text-zinc-800 dark:text-zinc-200">a quantidade de gols analisada (0, 1, 2, 3...)</div>
          </div>
          <div className="rounded-xl bg-zinc-100 p-4 dark:bg-zinc-800/60">
            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              e
            </div>
            <div className="mt-1 text-zinc-800 dark:text-zinc-200">constante de Euler (≈ 2,71828)</div>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
          Como o total de gols é a soma de duas variáveis de Poisson independentes, ele também segue
          uma distribuição de Poisson com{' '}
          <b className="text-zinc-900 dark:text-white">λ = xG_mandante + xG_visitante</b> — isso é o que
          sustenta os mercados de Over/Under.
        </p>
      </Card>

      <Card className="mt-4 p-5 sm:p-6">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <h3 className="flex items-center gap-2 text-base font-bold text-zinc-900 dark:text-white">
              <ListChecks className="h-5 w-5 text-amber-500" />
              Limitações do modelo
            </h3>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
              O modelo básico utiliza apenas os xG informados e{' '}
              <b>não considera automaticamente</b>:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {limitations.map((lim) => (
                <span
                  key={lim}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-300"
                >
                  {lim}
                </span>
              ))}
            </div>
            <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
              Os resultados não garantem o resultado real da partida. Use a análise como uma
              estimativa matemática e não como previsão garantida.
            </p>
          </div>
        </div>
      </Card>
    </section>
  )
}
