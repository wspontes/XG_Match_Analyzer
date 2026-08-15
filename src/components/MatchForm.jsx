import { useState } from 'react'
import { Calculator, Eraser, AlertCircle, Info, Target } from 'lucide-react'
import { Card } from './ui'
import { parseDecimal } from '../utils/formatters'
import { MAX_XG } from '../constants'

const inputBase =
  'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-zinc-900 outline-none transition-all placeholder-zinc-400 focus:ring-2 dark:bg-zinc-950 dark:text-zinc-100'
const inputNormal =
  'border-zinc-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-zinc-700 dark:focus:border-emerald-400 dark:focus:ring-emerald-400/20'
const inputError =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500 dark:focus:border-red-400 dark:focus:ring-red-400/20'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

export default function MatchForm({ initial, onCalculate, onClear }) {
  const [form, setForm] = useState({
    homeName: initial?.homeName ?? '',
    awayName: initial?.awayName ?? '',
    homeXG: initial ? String(initial.homeXG).replace('.', ',') : '',
    awayXG: initial ? String(initial.awayXG).replace('.', ',') : '',
  })
  const [errors, setErrors] = useState({})

  const setField = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const validate = (f) => {
    const errs = {}
    if (!f.homeName.trim()) errs.homeName = 'Informe o nome do time mandante.'
    if (!f.awayName.trim()) errs.awayName = 'Informe o nome do time visitante.'

    const homeXG = parseDecimal(f.homeXG)
    if (homeXG === null) errs.homeXG = 'Informe o xG do mandante.'
    else if (homeXG < 0) errs.homeXG = 'O xG deve ser maior ou igual a 0.'
    else if (homeXG > MAX_XG) errs.homeXG = `O xG não pode ser maior que ${MAX_XG}.`

    const awayXG = parseDecimal(f.awayXG)
    if (awayXG === null) errs.awayXG = 'Informe o xG do visitante.'
    else if (awayXG < 0) errs.awayXG = 'O xG deve ser maior ou igual a 0.'
    else if (awayXG > MAX_XG) errs.awayXG = `O xG não pode ser maior que ${MAX_XG}.`

    return { errs, homeXG, awayXG }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const { errs, homeXG, awayXG } = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length > 0) return
    onCalculate({
      homeName: form.homeName.trim(),
      awayName: form.awayName.trim(),
      homeXG,
      awayXG,
    })
  }

  const handleClear = () => {
    setForm({ homeName: '', awayName: '', homeXG: '', awayXG: '' })
    setErrors({})
    onClear()
  }

  return (
    <Card className="p-5 sm:p-6">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-white sm:text-lg">
              Dados da partida
            </h3>
            <p className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <Info className="h-3.5 w-3.5" />
              O xG aceita vírgula ou ponto. Ex.: 1,60 — os dados abaixo são apenas exemplo.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Mandante — nome do time" error={errors.homeName}>
            <input
              type="text"
              value={form.homeName}
              onChange={(e) => setField('homeName', e.target.value)}
              placeholder="Ex.: Brasil"
              className={`${inputBase} ${errors.homeName ? inputError : inputNormal}`}
            />
          </Field>
          <Field label="Visitante — nome do time" error={errors.awayName}>
            <input
              type="text"
              value={form.awayName}
              onChange={(e) => setField('awayName', e.target.value)}
              placeholder="Ex.: Noruega"
              className={`${inputBase} ${errors.awayName ? inputError : inputNormal}`}
            />
          </Field>
          <Field label="xG do mandante" error={errors.homeXG}>
            <div className="relative">
              <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                inputMode="decimal"
                value={form.homeXG}
                onChange={(e) => setField('homeXG', e.target.value)}
                placeholder="1,60"
                className={`${inputBase} ${errors.homeXG ? inputError : inputNormal} pl-9`}
              />
            </div>
          </Field>
          <Field label="xG do visitante" error={errors.awayXG}>
            <div className="relative">
              <Target className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                inputMode="decimal"
                value={form.awayXG}
                onChange={(e) => setField('awayXG', e.target.value)}
                placeholder="1,30"
                className={`${inputBase} ${errors.awayXG ? inputError : inputNormal} pl-9`}
              />
            </div>
          </Field>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 sm:flex-none sm:px-8"
          >
            <Calculator className="h-4 w-4" />
            CALCULAR ANÁLISE
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Eraser className="h-4 w-4" />
            Limpar
          </button>
        </div>
      </form>
    </Card>
  )
}
