import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ApiError } from '../lib/api'

type Mode = 'login' | 'register'

export function AuthPage({ initialMode }: { initialMode: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, register } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      if (mode === 'login') {
        await login(email, password)
      } else {
        await register({ email, password, fullName })
      }
      navigate('/')
    } catch (err) {
      // On relaie le message du backend (ex: erreurs Zod, "Email ou mot de
      // passe incorrect") directement — il est déjà pensé pour l'utilisateur.
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Panneau de gauche — le "moment fort" de la page */}
      <div className="bg-accent md:w-2/5 flex flex-col justify-between p-10 md:p-14">
        <a href="/" className="font-display text-2xl text-ink font-semibold">
          Festiv'Guinée
        </a>
        <div>
          <h1 className="font-display text-5xl md:text-6xl leading-[1.05] text-ink font-semibold">
            {mode === 'login' ? 'Content de vous revoir.' : 'Vos billets, sans détour.'}
          </h1>
          <p className="mt-6 text-ink/80 max-w-sm text-lg">
            Billets numériques, entrée sans file d'attente, pour les festivals de Guinée.
          </p>
        </div>
        <p className="text-ink/60 text-sm">© 2026 Festiv'Guinée</p>
      </div>

      {/* Panneau de droite — le formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 bg-bg">
        <div className="w-full max-w-sm">
          <div className="flex gap-6 mb-10 border-b border-ink/10">
            <button
              onClick={() => setMode('login')}
              className={`pb-3 text-sm font-medium transition-colors ${
                mode === 'login' ? 'text-ink border-b-2 border-accent' : 'text-muted'
              }`}
            >
              Se connecter
            </button>
            <button
              onClick={() => setMode('register')}
              className={`pb-3 text-sm font-medium transition-colors ${
                mode === 'register' ? 'text-ink border-b-2 border-accent' : 'text-muted'
              }`}
            >
              Créer un compte
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-ink mb-1.5">Nom complet</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-surface text-ink
                             focus:outline-none focus:ring-2 focus:ring-accent"
                  placeholder="Amadou Diallo"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-surface text-ink
                           focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="vous@exemple.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-1.5">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-ink/15 bg-surface text-ink
                           focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-accent-2 bg-accent-2/10 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-lg bg-ink text-bg font-medium hover:opacity-90
                         transition-opacity disabled:opacity-50"
            >
              {isSubmitting ? 'Un instant…' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}