import { useState } from 'react'
import { Link2, Share2, Check } from 'lucide-react'
import { Card } from './ui'

export default function ShareAnalysis({ match }) {
  const [copied, setCopied] = useState(false)

  if (!match) return null

  const buildUrl = () => {
    const params = new URLSearchParams({
      home: match.homeName,
      away: match.awayName,
      hxg: String(match.homeXG).replace('.', ','),
      axg: String(match.awayXG).replace('.', ','),
    })
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`
  }

  const handleCopy = async () => {
    const url = buildUrl()
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Análise XG', text: 'Análise de probabilidades', url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      try {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch {
        prompt('Copie o link da análise:', url)
      }
    }
  }

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-zinc-400" />
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Compartilhe esta análise com o link direto:
          <span className="ml-1 hidden font-mono text-xs text-zinc-400 sm:inline">
            ?home={encodeURIComponent(match.homeName)}&hxg={String(match.homeXG).replace('.', ',')}&amp;…
          </span>
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-500/25 transition-colors hover:bg-emerald-600"
      >
        {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
        {copied ? 'Copiado!' : 'Compartilhar'}
      </button>
    </Card>
  )
}