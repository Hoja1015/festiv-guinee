import { Routes, Route } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { useAuth } from './contexts/AuthContext'

function HomePage() {
  const { user, isLoading } = useAuth()

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <header className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Festiv'Guinée 🎟️</h1>
        <ThemeToggle />
      </header>

      <main className="p-8">
        {isLoading ? (
          <p className="text-gray-600 dark:text-gray-400">Chargement...</p>
        ) : user ? (
          <p className="text-gray-900 dark:text-white">Connecté en tant que {user.fullName} ({user.role})</p>
        ) : (
          <p className="text-gray-900 dark:text-white">Non connecté</p>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  )
}

export default App