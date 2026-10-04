import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'

const NAV_ITEMS = [
  { to: '/', label: 'Accueil' },
  { to: '/evenements', label: 'Événements' },
  { to: '/billets', label: 'Billets' },
  { to: '/compte', label: 'Compte' },
]

export function TopNav() {
  const { pathname } = useLocation()

  return (
    <header className="hidden border-b border-gray-100 bg-white px-10 py-4 md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo variant="dark" />
        <nav className="flex gap-8">
          {NAV_ITEMS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-semibold transition-colors ${
                pathname === to ? 'text-primary-600' : 'text-gray-500 hover:text-ink-950'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}