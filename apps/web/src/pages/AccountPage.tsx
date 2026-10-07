import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCurrentUser, useLogout, type AuthUser } from '../hooks/useAuth'
import { useCartCount } from '../hooks/useCart'

const ROLE_LABEL: Record<AuthUser['role'], string> = {
  CUSTOMER: 'Client',
  ORGANIZER: 'Organisateur',
  STAFF: 'Agent de contrôle',
  ADMIN: 'Administrateur',
}

export function AccountPage() {
  const { data: user, isLoading } = useCurrentUser()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()
  const cartCount = useCartCount()

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => navigate('/', { replace: true }) })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl px-6 py-10" role="status" aria-label="Chargement">
        <div className="h-24 animate-shimmer rounded-2xl" />
        <div className="mt-4 h-40 animate-shimmer rounded-2xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
        <h1 className="text-xl font-extrabold text-ink-950">Mon compte</h1>
        <p className="mt-2 text-sm text-gray-500">
          Connecte-toi pour retrouver tes billets et gérer ton compte.
        </p>
        <Link
          to="/login"
          state={{ from: location }}
          className="mt-6 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
        >
          Se connecter
        </Link>
      </div>
    )
  }

  const isBackoffice = user.role === 'ORGANIZER' || user.role === 'STAFF' || user.role === 'ADMIN'

  return (
    <div className="mx-auto max-w-xl px-6 pb-28 pt-8 md:pb-16 md:pt-12">
      <h1 className="sr-only">Mon compte</h1>

      <section className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-lg font-extrabold text-white"
          aria-hidden="true"
        >
          {user.fullName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-lg font-extrabold text-ink-950">{user.fullName}</div>
          <div className="truncate text-sm text-gray-500">{user.email}</div>
          {user.phone && <div className="truncate text-sm text-gray-500">{user.phone}</div>}
          <span className="mt-1.5 inline-block rounded-full bg-[#EDE9FE] px-2.5 py-0.5 text-[11px] font-bold text-primary-700">
            {ROLE_LABEL[user.role]}
          </span>
        </div>
      </section>

      <nav aria-label="Raccourcis" className="mt-4 overflow-hidden rounded-2xl border border-gray-100 bg-white">
        <ShortcutLink to="/billets">Mes billets</ShortcutLink>
        <ShortcutLink to="/panier" badge={cartCount > 0 ? String(cartCount) : undefined}>
          Mon panier
        </ShortcutLink>
        {user.role === 'ORGANIZER' && <ShortcutLink to="/organisateur">Espace organisateur</ShortcutLink>}
        {(user.role === 'STAFF' || user.role === 'ADMIN') && (
          <ShortcutLink to="/agent">Espace agent de contrôle</ShortcutLink>
        )}
      </nav>

      {isBackoffice && (
        <p className="mt-3 px-1 text-xs text-gray-400">
          Ton espace de travail s'ouvre séparément du site public.
        </p>
      )}

      {logout.isError && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          La déconnexion a échoué. Réessaie dans un instant.
        </p>
      )}

      <button
        type="button"
        onClick={handleLogout}
        disabled={logout.isPending}
        className="mt-6 w-full rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        {logout.isPending ? 'Déconnexion...' : 'Se déconnecter'}
      </button>
    </div>
  )
}

function ShortcutLink({ to, children, badge }: { to: string; children: ReactNode; badge?: string }) {
  return (
    <Link
      to={to}
      className="flex items-center justify-between border-b border-gray-100 px-5 py-4 text-sm font-semibold text-ink-950 transition last:border-b-0 hover:bg-gray-50"
    >
      <span>{children}</span>
      <span className="flex items-center gap-2 text-gray-400">
        {badge && (
          <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-extrabold text-white">
            {badge}
          </span>
        )}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </span>
    </Link>
  )
}