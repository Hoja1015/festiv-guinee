import { useEffect, useRef, useState } from 'react'
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

// Le tableau de bord ne doit être actif que sur sa propre page ; les autres
// restent actifs sur leurs sous-pages (ex. /organisateur/evenements/12).
function isActive(pathname: string, to: string) {
  if (to === '/organisateur') return pathname === to
  return pathname === to || pathname.startsWith(`${to}/`)
}

function NavLinks({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Espace organisateur">
      {NAV_ITEMS.map((item) =>
        item.enabled ? (
          <Link
            key={item.label}
            to={item.to}
            aria-current={isActive(pathname, item.to) ? 'page' : undefined}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
              isActive(pathname, item.to)
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
  )
}

export function OrganizerLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: user } = useCurrentUser()
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => navigate('/login', { replace: true }) })
  }

  // Le menu se ferme dès qu'on change de page.
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  // Menu ouvert : Échap le ferme, la page derrière ne défile plus,
  // et le focus passe au bouton de fermeture (puis revient au burger).
  useEffect(() => {
    if (!menuOpen) return
    const burger = burgerRef.current
    closeRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
      burger?.focus()
    }
  }, [menuOpen])

  const initials = user?.fullName ? user.fullName.slice(0, 2).toUpperCase() : '··'

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Barre mobile avec bouton menu */}
      <div className="sticky top-0 z-20 flex flex-shrink-0 items-center justify-between gap-3 bg-ink-950 px-4 py-3 md:hidden">
        <button
          ref={burgerRef}
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="Ouvrir le menu"
          aria-expanded={menuOpen}
          aria-controls="organizer-menu"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <div className="min-w-0 truncate text-base font-extrabold text-white">
          Festiv<span className="text-accent-400">'</span>Guinée{' '}
          <span className="ml-1 text-sm font-semibold text-ink-300">· Organisateur</span>
        </div>

        <div
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white"
          aria-hidden="true"
        >
          {initials}
        </div>
      </div>

      {/* Menu mobile : tiroir à gauche */}
      <div className="md:hidden">
        <div
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
          className={`fixed inset-0 z-30 bg-black/50 transition-opacity duration-200 motion-reduce:transition-none ${
            menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        />
        <aside
          id="organizer-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu organisateur"
          className={`fixed inset-y-0 left-0 z-40 flex w-72 max-w-[85vw] flex-col bg-ink-950 p-4 transition-[transform,visibility] duration-200 motion-reduce:transition-none ${
            menuOpen ? 'translate-x-0' : '-translate-x-full invisible'
          }`}
        >
          <div className="flex items-center justify-between px-2 pb-6">
            <div className="text-lg font-extrabold text-white">
              Festiv<span className="text-accent-400">'</span>Guinée
            </div>
            <button
              ref={closeRef}
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Fermer le menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-ink-300 transition hover:bg-white/10 hover:text-white"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <NavLinks pathname={location.pathname} />
          </div>

          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-white">Organisateur</div>
                <div className="truncate text-[11px] text-ink-300">{user?.fullName ?? ''}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={logout.isPending}
              className="mt-3 w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-ink-300 transition hover:text-white disabled:opacity-50"
            >
              Déconnexion
            </button>
          </div>
        </aside>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden w-60 flex-shrink-0 flex-col bg-ink-950 p-4 md:flex">
        <div className="px-2 pb-7 text-lg font-extrabold text-white">
          Festiv<span className="text-accent-400">'</span>Guinée
        </div>

        <NavLinks pathname={location.pathname} />

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-white">Organisateur</div>
              <div className="truncate text-[11px] text-ink-300">{user?.fullName ?? ''}</div>
            </div>
          </div>

          <button
            type="button"
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