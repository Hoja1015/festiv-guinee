import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCurrentUser, useLogout } from '../../hooks/useAuth'

interface NavItem {
  label: string
  to: string
  enabled: boolean
}

// Les écrans listés ici existent tous ; on en ajoute au fur et à mesure
const NAV_ITEMS: NavItem[] = [
  { label: 'Tableau de bord', to: '/organisateur', enabled: true },
  { label: 'Événements', to: '/organisateur/evenements', enabled: true },
  { label: 'Équipe', to: '/organisateur/equipe', enabled: true },
  { label: 'Ventes', to: '/organisateur/ventes', enabled: true },
  { label: 'Participants', to: '/organisateur/participants', enabled: true },
  { label: 'Publications', to: '/organisateur/publications', enabled: true },
  { label: 'Scans', to: '/organisateur/scans', enabled: true },
]

export function OrganizerLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const logout = useLogout()

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Barre mobile : la sidebar complète ne tient pas sur petit écran */}
      <div className="flex flex-shrink-0 items-center justify-between gap-3 bg-ink-950 px-5 py-4 md:hidden">
        <div className="text-base font-extrabold text-white">
          Festiv<span className="text-accent-400">'</span>Guinée{' '}
          <span className="ml-1 text-sm font-semibold text-ink-300">· Organisateur</span>
        </div>
        <button
          onClick={handleLogout}
          disabled={logout.isPending}
          className="flex-shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-ink-300 transition hover:text-white disabled:opacity-50"
        >
          Déconnexion
        </button>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden w-60 flex-shrink-0 flex-col bg-ink-950 p-4 md:flex">
        <div className="px-2 pb-7 text-lg font-extrabold text-white">
          Festiv<span className="text-accent-400">'</span>Guinée
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) =>
            item.enabled ? (
              <Link
                key={item.label}
                to={item.to}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  location.pathname === item.to
                    ? 'bg-primary-600 text-white'
                    : 'text-ink-300 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={item.label}
                className="cursor-not-allowed rounded-xl px-4 py-2.5 text-sm font-semibold text-ink-300 opacity-40"
              >
                {item.label} · bientôt
              </span>
            )
          )}
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : '··'}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-white">Organisateur</div>
              <div className="truncate text-[11px] text-ink-300">{user?.fullName ?? ''}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={logout.isPending}
            className="mt-3 w-full rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold text-ink-300 transition hover:text-white disabled:opacity-50"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="min-w-0 flex-1 bg-[#F6F7FB] px-5 py-6 md:px-10 md:py-8">{children}</div>
    </div>
  )
}