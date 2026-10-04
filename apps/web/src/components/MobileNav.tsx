import { Link, useLocation } from 'react-router-dom'
import { HomeIcon, CalendarIcon, TicketIcon, UserIcon } from './icons'

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', Icon: HomeIcon },
  { to: '/evenements', label: 'Événements', Icon: CalendarIcon },
  { to: '/billets', label: 'Billets', Icon: TicketIcon },
  { to: '/compte', label: 'Compte', Icon: UserIcon },
]

export function MobileNav() {
  const { pathname } = useLocation()

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
                <Icon className="h-6 w-6" strokeWidth={active ? 2.2 : 1.8} />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}