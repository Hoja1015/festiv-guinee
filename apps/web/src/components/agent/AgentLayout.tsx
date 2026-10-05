import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCurrentUser, useLogout } from '../../hooks/useAuth'

// Layout de l'espace agent : plein écran sombre, pensé pour un téléphone tenu
// d'une main à l'entrée d'un événement.
export function AgentLayout({ children, backTo }: { children: ReactNode; backTo?: string }) {
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })
  }

  return (
    <div className="flex min-h-screen flex-col bg-ink-950 text-white">
      <header className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="min-w-0">
          {backTo ? (
            <Link to={backTo} className="text-sm font-bold text-ink-300 transition hover:text-white">
              ← Événements
            </Link>
          ) : (
            <span className="text-base font-extrabold">
              Festiv<span className="text-accent-400">'</span>Guinée{' '}
              <span className="ml-1 text-sm font-semibold text-ink-300">· Agent</span>
            </span>
          )}
        </div>

        <div className="flex min-w-0 items-center gap-3">
          <span className="hidden truncate text-xs text-ink-300 sm:inline">{user?.fullName ?? ''}</span>
          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="flex-shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-ink-300 transition hover:text-white disabled:opacity-50"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col px-5 pb-8">{children}</main>
    </div>
  )
}