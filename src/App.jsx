import { useEffect, useState } from 'react'
import Home from './pages/Home'
import { ThemeContext } from './context/ThemeContext'

export default function App() {
  const [dark, setDark] = useState(true)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const toggleDark = () => setDark((d) => !d)

  return (
    <ThemeContext.Provider value={{ dark, toggleDark }}>
      <Home />
    </ThemeContext.Provider>
  )
}
