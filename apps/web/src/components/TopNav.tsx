import { Link, useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { CartIcon } from './FeedIcons'
import { useCartCount } from '../hooks/useCart'

const NAV_ITEMS = [
  { to: '/', label: 'Accueil' },
  { to: '/evenements', label: 'Événements' },
  { to: '/billets', label: 'Billets' },
  { to: '/compte', label: 'Compte' },
]

export function TopNav() {
  const { pathname } = useLocation()
  const cartCount = useCartCount()

  return (
    <header className="hidden border-b border-gray-100 bg-white px-10 py-4 md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo variant="dark" />
        <div className="flex items-center gap-8">
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

          <Link
            to="/panier"
            aria-label={cartCount > 0 ? `Panier, ${cartCount} billet${cartCount > 1 ? 's' : ''}` : 'Panier'}
            className={`relative transition-colors ${
              pathname === '/panier' ? 'text-primary-600' : 'text-gray-500 hover:text-ink-950'
            }`}
          >
            <CartIcon className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-extrabold text-white">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}