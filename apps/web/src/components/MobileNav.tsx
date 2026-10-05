import { Link, useLocation } from 'react-router-dom'
import { HomeIcon, CalendarIcon, TicketIcon, UserIcon } from './icons'
import { CartIcon } from './FeedIcons'
import { useCartCount } from '../hooks/useCart'

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', Icon: HomeIcon },
  { to: '/evenements', label: 'Événements', Icon: CalendarIcon },
  { to: '/panier', label: 'Panier', Icon: CartIcon },
  { to: '/billets', label: 'Billets', Icon: TicketIcon },
  { to: '/compte', label: 'Compte', Icon: UserIcon },
]

export function MobileNav() {
  const { pathname } = useLocation()
  const cartCount = useCartCount()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-100 bg-white px-2 py-2 md:hidden">
      <ul className="flex items-center justify-between">
        {NAV_ITEMS.map(({ to, label, Icon }) => {
          const active = pathname === to
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className={`flex flex-col items-center gap-1 py-1 text-xs font-medium transition-colors ${
                  active ? 'text-primary-600' : 'text-gray-400'
                }`}
              >
                <span className="relative">
                  <Icon className="h-6 w-6" strokeWidth={active ? 2.2 : 1.8} />
                  {to === '/panier' && cartCount > 0 && (
                    <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-extrabold text-white">
                      {cartCount}
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}