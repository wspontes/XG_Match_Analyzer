import { useEffect, useState } from 'react'
import {
  FileSpreadsheet,
  Send,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Settings2,
  Trash2,
} from 'lucide-react'
import { Card, SectionHeading, Badge } from './ui'
import { formatDecimal } from '../utils/formatters'

const STORAGE_KEY = 'xg-sheet-config-v1'
const ENTRY_FIELDS = [
  ['jogo', 'Jogo da partida'],
  ['tipo', 'Tipo de previsão'],
  ['previsao', 'Previsão (mercado ou placar)'],
  ['prob', 'Probabilidade (%)'],
  ['odd', 'Odd justa'],
]
const TOP_MERCADOS = 5
const TOP_PLACARES = 3

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Extrai a URL do formulário e os IDs dos campos (entry.NNNNNN)
 * a partir de um "link pré-preenchido" copiado do Google Forms.
 * Os campos são mapeados pela ordem em que aparecem no link.
 */
function parsePrefilledLink(link) {
  const trimmed = (link || '').trim()
  if (!trimmed) throw new Error('Cole o link pré-preenchido do formulário.')
  if (!trimmed.includes('docs.google.com/forms')) {
    throw new Error('O link não parece ser de um Google Forms.')
  }

  const viewMatch = trimmed.match(
    /https:\/\/docs\.google\.com\/forms\/d\/e\/([^/]+)\/(viewform|formResponse)/,
  )
  if (!viewMatch) {
    throw new Error('Não foi possível identificar o ID do formulário no link.')
  }

  const entries = [...trimmed.matchAll(/([a-zA-Z_]+\.?\d+)=[^&]*/g)]
    .map((m) => m[1])
    .filter((name) => /^entry\.\d+$/.test(name))

  const unique = [...new Set(entries)]
  if (unique.length < ENTRY_FIELDS.length) {
    throw new Error(
      `O link tem apenas ${unique.length} campo(s) preenchido(s). Preencha todas as ${ENTRY_FIELDS.length} perguntas antes de gerar o link.`,
    )
  }

  const cfg = { url: `https://docs.google.com/forms/d/e/${viewMatch[1]}/formResponse` }
  ENTRY_FIELDS.forEach(([key], i) => {
    cfg[key] = unique[i]
  })
  return cfg
}

export default function SheetExport({ match, result }) {
  const [config, setConfig] = useState(null)
  const [showConfig, setShowConfig] = useState(false)
  const [link, setLink] = useState('')
  const [sheetUrl, setSheetUrl] = useState('')
  const [manual, setManual] = useState(null)
  const [status, setStatus] = useState('idle')
  const [feedback, setFeedback] = useState(null)

  useEffect(() => {
    setConfig(loadConfig())
  }, [])

  const rows = []
  if (result && match) {
    result.marketsRanking?.slice(0, TOP_MERCADOS).forEach((m) => {
      rows.push({ tipo: 'Mercado', previsao: m.name, prob: m.prob, odd: m.odd })
    })
    result.topScores?.slice(0, TOP_PLACARES).forEach((s) => {
      rows.push({ tipo: 'Placar', previsao: `${s.home}x${s.away}`, prob: s.prob, odd: s.odd })
    })
  }
  const gameLabel = match
    ? `${match.homeName} ${formatDecimal(match.homeXG)} × ${formatDecimal(match.awayXG)} ${match.awayName}`
    : ''

  const activeConfig = manual || config

  const handleExtract = () => {
    setFeedback(null)
    try {
      const parsed = parsePrefilledLink(link)
      parsed.sheetUrl = ''
      setManual(parsed)
      setFeedback({ type: 'ok', text: 'Campos detectados! Confira abaixo e clique em Salvar.' })
    } catch (e) {
      setFeedback({ type: 'error', text: e.message })
    }
  }

  const handleSave = () => {
    setFeedback(null)
    let base = null
    try {
      base = manual || (link ? parsePrefilledLink(link) : null)
    } catch (err) {
      setFeedback({ type: 'error', text: err.message })
      return
    }
    if (!base && !config) {
      setFeedback({ type: 'error', text: 'Cole o link pré-preenchido e clique em Detectar campos.' })
      return
    }
    const source = base || config
    const cfg = { ...source, sheetUrl: sheetUrl.trim() || source.sheetUrl || '' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg))
    setConfig(cfg)
    setManual(null)
    setLink('')
    setShowConfig(false)
    setStatus('idle')
  }

  const handleDisconnect = () => {
    localStorage.removeItem(STORAGE_KEY)
    setConfig(null)
    setManual(null)
    setShowConfig(true)
    setStatus('idle')
    setFeedback(null)
  }

  const handleSend = async () => {
    if (!activeConfig || rows.length === 0) return
    setStatus('sending')
    setFeedback(null)

    try {
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i]
        const body = new URLSearchParams()
        body.append(activeConfig.jogo, gameLabel)
        body.append(activeConfig.tipo, r.tipo)
        body.append(activeConfig.previsao, r.previsao)
        body.append(activeConfig.prob, (r.prob * 100).toFixed(2).replace('.', ','))
        body.append(activeConfig.odd, r.odd.toFixed(2).replace('.', ','))

        await fetch(activeConfig.url, { method: 'POST', mode: 'no-cors', body })
        if (i < rows.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 350))
        }
      }
      setStatus('done')
      setFeedback({
        type: 'ok',
        text: `Enviado! ${rows.length} linhas registradas. Confira na planilha — a coluna "Resultado real" fica livre para você preencher após a partida.`,
      })
    } catch {
      setStatus('error')
      setFeedback({ type: 'error', text: 'Falha ao enviar. Verifique sua conexão e a configuração.' })
    }
  }

  const inputBase =
    'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100'

  return (
    <section>
      <SectionHeading
        icon={FileSpreadsheet}
        title="Registrar na planilha"
        subtitle={`Envia os ${TOP_MERCADOS} mercados mais prováveis e os ${TOP_PLACARES} placares mais prováveis para o Google Sheets`}
        action={
          config ? (
            <div className="flex items-center gap-2">
              {config.sheetUrl && (
                <a
                  href={config.sheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Abrir planilha
                </a>
              )}
              <button
                onClick={() => setShowConfig((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Settings2 className="h-3.5 w-3.5" />
                Configurar
              </button>
            </div>
          ) : null
        }
      />

      <Card className="p-5">
        {!config && !showConfig && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Integração ainda não configurada.{' '}
            <button
              onClick={() => setShowConfig(true)}
              className="font-semibold text-emerald-600 underline-offset-2 hover:underline dark:text-emerald-400"
            >
              Conectar ao Google Sheets
            </button>{' '}
            para registrar as previsões de cada partida.
          </p>
        )}

        {config && !showConfig && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Badge color="emerald">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Planilha conectada
              </Badge>
              <span>
                Serão enviadas <b>{rows.length} linhas</b> desta partida ({TOP_MERCADOS} mercados +{' '}
                {TOP_PLACARES} placares).
              </span>
            </div>

            <ul className="grid gap-x-6 gap-y-1.5 rounded-xl border border-zinc-200 p-4 text-xs sm:grid-cols-2 dark:border-zinc-700">
              {rows.map((r, i) => (
                <li key={`${r.tipo}-${r.previsao}-${i}`} className="flex items-center justify-between gap-2">
                  <span className="truncate text-zinc-600 dark:text-zinc-300">
                    <b className="text-zinc-400 dark:text-zinc-500">{r.tipo === 'Mercado' ? 'M' : 'P'}</b>{' '}
                    {r.previsao}
                  </span>
                  <span className="shrink-0 font-tabular font-semibold text-zinc-800 dark:text-zinc-100">
                    {(r.prob * 100).toFixed(2).replace('.', ',')}%
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={handleSend}
              disabled={status === 'sending' || rows.length === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar para a planilha
                </>
              )}
            </button>
          </div>
        )}

        {showConfig && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Link pré-preenchido do formulário
              </label>
              <textarea
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="Cole aqui o link gerado pelo Google Forms (⋮ → Obter link pré-preenchido)"
                rows={3}
                className={`${inputBase} resize-y font-mono text-xs`}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={handleExtract}
                  className="rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-sky-600"
                >
                  Detectar campos
                </button>
                {config && (
                  <button
                    onClick={() => setManual(config)}
                    className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Editar configuração atual
                  </button>
                )}
              </div>
            </div>

            {activeConfig && (
              <div className="space-y-3 rounded-xl border border-sky-500/30 bg-sky-500/5 p-4">
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    URL de envio (formResponse)
                  </label>
                  <input
                    type="text"
                    value={activeConfig.url}
                    onChange={(e) => setManual({ ...activeConfig, url: e.target.value.trim() })}
                    className={`${inputBase} font-mono text-xs`}
                  />
                </div>
                {ENTRY_FIELDS.map(([key, label]) => (
                  <div key={key}>
                    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      {label}
                    </label>
                    <input
                      type="text"
                      value={activeConfig[key] || ''}
                      onChange={(e) => setManual({ ...activeConfig, [key]: e.target.value.trim() })}
                      placeholder="entry.000000000"
                      className={`${inputBase} font-mono text-xs`}
                    />
                  </div>
                ))}
                <div>
                  <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                    Link da planilha de respostas (opcional, para acesso rápido)
                  </label>
                  <input
                    type="text"
                    value={sheetUrl || activeConfig.sheetUrl || ''}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/..."
                    className={`${inputBase} font-mono text-xs`}
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-600"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Salvar configuração
                  </button>
                  {config && (
                    <button
                      onClick={handleDisconnect}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Desconectar
                    </button>
                  )}
                </div>
              </div>
            )}

            <details className="rounded-xl border border-zinc-200 p-4 text-xs dark:border-zinc-700">
              <summary className="cursor-pointer font-semibold text-zinc-700 dark:text-zinc-200">
                Como criar o formulário (uma vez só)
              </summary>
              <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-zinc-600 dark:text-zinc-300">
                <li>Crie um formulário novo em forms.new.</li>
                <li>
                  Adicione as perguntas nesta ordem exata, todas como resposta curta e{' '}
                  <b>sem marcar "Obrigatória"</b>: <b>Jogo da partida</b>, <b>Tipo de previsão</b>,{' '}
                  <b>Previsão</b>, <b>Probabilidade (%)</b>, <b>Odd justa</b> — e opcionalmente{' '}
                  <b>Resultado real</b> (fica vazia para você preencher depois).
                </li>
                <li>
                  Em <b>Respostas</b>, clique no ícone verde de planilha para vincular ao Google
                  Sheets.
                </li>
                <li>
                  No menu <b>⋮ → Obter link pré-preenchido</b>, preencha qualquer valor em cada
                  pergunta e copie o link gerado.
                </li>
                <li>Cole o link acima e clique em Detectar campos.</li>
              </ol>
            </details>
          </div>
        )}

        {feedback && (
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs ${
              feedback.type === 'ok'
                ? 'border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400'
                : 'border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-400'
            }`}
          >
            {feedback.type === 'ok' ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            {feedback.text}
          </div>
        )}
      </Card>
    </section>
  )
}
