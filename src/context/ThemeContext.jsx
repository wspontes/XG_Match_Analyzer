import { createContext, useContext } from 'react'

export const ThemeContext = createContext({ dark: true, toggleDark: () => {} })

export const useTheme = () => useContext(ThemeContext)
