import { useState, type FormEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { useLogin, useRegister, type AuthUser } from '../hooks/useAuth'
import { ApiError } from '../lib/api'

type Mode = 'login' | 'register'

// Où envoyer l'utilisateur une fois connecté : priorité à la page qu'il
// essayait d'atteindre (ex. /paiement), sinon un accueil selon son rôle —
// un organisateur n'a rien à faire sur la page d'accueil client.
function destinationFor(user: AuthUser, explicitFrom?: string): string {
  if (explicitFrom) return explicitFrom
  if (user.role === 'ORGANIZER') return '/organisateur'
  if (user.role === 'STAFF') return '/agent'
  return '/'
}

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const navigate = useNavigate()
  const location = useLocation()
  const explicitFrom = (location.state as { from?: Location })?.from?.pathname

  const login = useLogin()
  const register = useRegister()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const pending = mode === 'login' ? login.isPending : register.isPending

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    setFieldErrors({})

    const onError = (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.details) {
          const flat: Record<string, string> = {}
          for (const [field, messages] of Object.entries(err.details)) {
            if (messages?.[0]) flat[field] = messages[0]
          }
          setFieldErrors(flat)
        }
        setFormError(err.message)
      } else {
        setFormError("Une erreur est survenue. Réessaie dans un instant.")
      }
    }

    if (mode === 'login') {
      login.mutate(
        { email, password },
        {
          onSuccess: (data) => navigate(destinationFor(data.user, explicitFrom), { replace: true }),
          onError,
        }
      )
    } else {
      register.mutate(
        { email, password, fullName, phone: phone || undefined },
        {
          onSuccess: (data) => navigate(destinationFor(data.user, explicitFrom), { replace: true }),
          onError,
        }
      )
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-10 md:max-w-sm">
      <div className="mb-8 flex justify-center">
        <Logo variant="dark" />
      </div>

      <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setMode('login')}
          className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
            mode === 'login' ? 'bg-white text-ink-950 shadow-sm' : 'text-gray-400'
          }`}
        >
          Connexion
        </button>
        <button
          onClick={() => setMode('register')}
          className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
            mode === 'register' ? 'bg-white text-ink-950 shadow-sm' : 'text-gray-400'
          }`}
        >
          Inscription
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {mode === 'register' && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Nom complet
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-600 focus:outline-none"
            />
            {fieldErrors.fullName && (
              <p className="mt-1 text-xs text-red-500">{fieldErrors.fullName}</p>
            )}
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-500">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-600 focus:outline-none"
          />
          {fieldErrors.email && <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-gray-500">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-600 focus:outline-none"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-xs text-red-500">{fieldErrors.password}</p>
          )}
          {mode === 'register' && !fieldErrors.password && (
            <p className="mt-1 text-xs text-gray-400">
              Au moins 8 caractères, une majuscule et un chiffre.
            </p>
          )}
        </div>

        {mode === 'register' && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-500">
              Téléphone (optionnel)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-primary-600 focus:outline-none"
            />
          </div>
        )}

        {formError && (
          <p className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{formError}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-2 rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
        >
          {pending ? 'Un instant...' : mode === 'login' ? 'Se connecter' : "S'inscrire"}
        </button>
      </form>
    </div>
  )
}