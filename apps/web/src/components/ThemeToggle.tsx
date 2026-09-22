import { useTheme } from '../hooks/useTheme'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="rounded-lg border border-gray-300 dark:border-gray-600 px-3 py-1.5 text-sm
                 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100
                 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      aria-label="Basculer le thème clair/sombre"
    >
      {theme === 'dark' ? '☀️ Clair' : '🌙 Sombre'}
    </button>
  )
}