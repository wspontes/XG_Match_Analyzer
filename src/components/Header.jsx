import { useState } from 'react'
import { Menu, X, Sun, Moon, Activity } from 'lucide-react'
import { TABS } from '../constants'
import { useTheme } from '../context/ThemeContext'

export default function Header({ activeTab, onNavigate }) {
  const [open, setOpen] = useState(false)
  const { dark, toggleDark } = useTheme()

  const go = (id) => {
    setOpen(false)
    onNavigate(id)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/85 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-sky-600 text-white shadow-lg shadow-emerald-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
              XG Match Analyzer
            </div>
            <div className="hidden text-[11px] text-zinc-500 dark:text-zinc-400 sm:block">
              Análise probabilística de partidas de futebol
            </div>
          </div>
        </div>

        <nav className="hidden items-center gap-1 lg:flex">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                activeTab === t.id
                  ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDark}
            aria-label="Alternar tema claro/escuro"
            className="rounded-lg border border-zinc-200 p-2 text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setOpen(!open)}
            aria-label="Abrir menu"
            className="rounded-lg border border-zinc-200 p-2 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300 lg:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950 lg:hidden">
          <div className="grid grid-cols-2 gap-2">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium ${
                  activeTab === t.id
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                    : 'text-zinc-700 dark:text-zinc-300'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
