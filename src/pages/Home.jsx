import { useMemo, useRef, useState } from 'react'
import { Calculator } from 'lucide-react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import MatchForm from '../components/MatchForm'
import XGScoreSearcher from '../components/XGScoreSearcher'
import ShareAnalysis from '../components/ShareAnalysis'
import HistoryTracker from '../components/HistoryTracker'
import MatchSummary from '../components/MatchSummary'
import ProbabilityCards from '../components/ProbabilityCards'
import KeyMetrics from '../components/KeyMetrics'
import FairOdds from '../components/FairOdds'
import PoissonDistribution from '../components/PoissonDistribution'
import CumulativeTable from '../components/CumulativeTable'
import ScoreMatrix from '../components/ScoreMatrix'
import TopScores from '../components/TopScores'
import OverUnder from '../components/OverUnder'
import BTTS from '../components/BTTS'
import DoubleChance from '../components/DoubleChance'
import HandicapMarkets from '../components/HandicapMarkets'
import XgTotal from '../components/XgTotal'
import TeamGoals from '../components/TeamGoals'
import MostLikelyMarkets from '../components/MostLikelyMarkets'
import OddsCalculator from '../components/OddsCalculator'
import ValueBets from '../components/ValueBets'
import SheetExport from '../components/SheetExport'
import MonteCarlo from '../components/MonteCarlo'
import ConvergenceChart from '../components/ConvergenceChart'
import Methodology from '../components/Methodology'
import Footer from '../components/Footer'
import { buildAnalysis } from '../utils/analysis'
import { TABS } from '../constants'

const DEFAULT_MATCH = { homeName: 'Brasil', awayName: 'Noruega', homeXG: 1.6, awayXG: 1.3 }

function getInitialMatch() {
  const params = new URLSearchParams(window.location.search)
  const home = params.get('home')
  const away = params.get('away')
  const homeXG = parseFloat((params.get('hxg') || '').replace(',', '.'))
  const awayXG = parseFloat((params.get('axg') || '').replace(',', '.'))
  if (home && away && Number.isFinite(homeXG) && Number.isFinite(awayXG)) {
    return { homeName: home, awayName: away, homeXG, awayXG }
  }
  return DEFAULT_MATCH
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-zinc-300 bg-white py-16 text-center dark:border-zinc-700 dark:bg-zinc-900/50">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <Calculator className="h-7 w-7" />
      </span>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Preencha os dados da partida acima e clique em{' '}
        <b className="text-zinc-700 dark:text-zinc-200">Calcular análise</b> para gerar todas as
        probabilidades.
      </p>
    </div>
  )
}

export default function Home() {
  const [match, setMatch] = useState(getInitialMatch)
  const [tab, setTab] = useState('analise')
  const [mcResult, setMcResult] = useState(null)
  const [autofill, setAutofill] = useState(null)
  const [marketOdds, setMarketOdds] = useState(null)
  const resultRef = useRef(null)

  const analysis = useMemo(() => {
    if (!match) return null
    if (typeof match.homeXG !== 'number' || typeof match.awayXG !== 'number') return null
    return buildAnalysis(match.homeXG, match.awayXG)
  }, [match])

  const scrollToResults = () => {
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleCalculate = (data) => {
    setMatch(data)
    setMcResult(null)
    setMarketOdds(null)
    setTab('analise')
    scrollToResults()
  }

  const handleClear = () => {
    setMatch(null)
    setMcResult(null)
    setMarketOdds(null)
  }

  const handleUseFromXgscore = (data) => {
    setAutofill({ id: Date.now(), data })
    setMatch(data)
    setMcResult(null)
    setMarketOdds(null)
    setTab('analise')
    scrollToResults()
    if (data.gameId) {
      fetch(`/api/xgscore?gameId=${data.gameId}`)
        .then((res) => res.json())
        .then((json) => {
          if (!json.error && json.max) {
            setMarketOdds({
              max: json.max,
              avg: json.avg,
              source: 'xgscore',
              gameId: data.gameId,
            })
          }
        })
        .catch(() => {})
    }
  }

  const handleNavigate = (id) => {
    setTab(id)
    scrollToResults()
  }

  const renderTab = () => {
    if (!analysis) return <EmptyState />
    switch (tab) {
      case 'probabilidades':
        return (
          <div className="space-y-8">
            <FairOdds result={analysis} />
            <PoissonDistribution result={analysis} match={match} />
            <CumulativeTable result={analysis} match={match} />
          </div>
        )
      case 'placares':
        return (
          <div className="space-y-8">
            <ScoreMatrix result={analysis} />
            <TopScores result={analysis} />
          </div>
        )
      case 'mercados':
        return (
          <div className="space-y-8">
            <OverUnder result={analysis} />
            <BTTS result={analysis} match={match} />
            <DoubleChance result={analysis} />
            <HandicapMarkets result={analysis} />
            <XgTotal result={analysis} />
            <TeamGoals result={analysis} match={match} />
            <MostLikelyMarkets result={analysis} />
            <ValueBets result={analysis} marketOdds={marketOdds} />
            <OddsCalculator
              result={analysis}
              initialOdds={
                marketOdds?.max?.r
                  ? {
                      home: marketOdds.max.r['1'],
                      draw: marketOdds.max.r['x'],
                      away: marketOdds.max.r['2'],
                      source: 'xgscore',
                    }
                  : null
              }
            />
          </div>
        )
      case 'simulacao':
        return (
          <div className="space-y-8">
            <MonteCarlo
              result={analysis}
              match={match}
              mcResult={mcResult}
              onComplete={setMcResult}
            />
            <ConvergenceChart result={analysis} mcResult={mcResult} />
          </div>
        )
      case 'historico':
        return <HistoryTracker match={match} result={analysis} />
      case 'metodologia':
        return <Methodology />
      case 'analise':
      default:
        return (
          <div className="space-y-8">
            <ShareAnalysis match={match} />
            <MatchSummary match={match} result={analysis} />
            <ProbabilityCards result={analysis} />
            <KeyMetrics result={analysis} match={match} />
            <SheetExport match={match} result={analysis} />
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen">
      <Header activeTab={tab} onNavigate={handleNavigate} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6">
        <Hero />
        <section id="formulario" className="pb-4">
          <MatchForm
            initial={DEFAULT_MATCH}
            autofill={autofill}
            onCalculate={handleCalculate}
            onClear={handleClear}
          />
        </section>

        <section className="pb-4">
          <XGScoreSearcher onUse={handleUseFromXgscore} />
        </section>

        <div ref={resultRef} className="scroll-mt-20 pt-8">
          <div className="mb-6 flex gap-1.5 overflow-x-auto rounded-2xl border border-zinc-200 bg-white p-1.5 dark:border-zinc-800 dark:bg-zinc-900">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleNavigate(t.id)}
                className={`flex-1 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                  tab === t.id
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          {renderTab()}
        </div>
      </main>

      <Footer />
    </div>
  )
}
