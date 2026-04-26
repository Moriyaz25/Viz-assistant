import { createContext, useContext } from 'react'

const ThemeContext = createContext({ theme: 'dark', toggleTheme: () => {} })

export const ThemeProvider = ({ children }) => {
    if (typeof document !== 'undefined') {
        document.documentElement.classList.add('dark')
    }
    return (
        <ThemeContext.Provider value={{ theme: 'dark', toggleTheme: () => {} }}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)