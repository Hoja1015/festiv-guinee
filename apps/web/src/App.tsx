import { Routes, Route } from 'react-router-dom'
import { ThemeToggle } from './components/ThemeToggle'
import { AuthPage } from './pages/AuthPage'
import { useAuth } from './contexts/AuthContext'

function HomePage() {
  const { user, isLoading, logout } = useAuth()

  return (
    <div className="min-h-screen bg-bg transition-colors">
      <header className="p-4 flex justify-between items-center border-b border-ink/10">
        <h1 className="font-display text-xl font-semibold text-ink">Festiv'Guinée 🎟️</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {user && (
            <button onClick={() => logout()} className="text-sm text-muted hover:text-ink">
              Déconnexion
            </button>
          )}
        </div>
      </header>

      <main className="p-8">
        {isLoading ? (
          <p className="text-muted">Chargement...</p>
        ) : user ? (
          <p className="text-ink">Connecté en tant que {user.fullName} ({user.role})</p>
        ) : (
          <div className="space-x-4">
            <a href="/login" className="text-accent underline">Se connecter</a>
            <a href="/register" className="text-accent underline">Créer un compte</a>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage initialMode="login" />} />
      <Route path="/register" element={<AuthPage initialMode="register" />} />
    </Routes>
  )
}

export default App
