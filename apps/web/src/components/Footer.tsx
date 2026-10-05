import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/evenements', label: 'Événements' },
  { to: '/billets', label: 'Mes billets' },
  { to: '/panier', label: 'Panier' },
]

// Footer du site public. Pas de coordonnées de contact ni de réseaux sociaux
// tant que les vraies informations ne sont pas fournies.
export function Footer() {
  return (
    <footer className="bg-ink-950 px-6 pb-28 pt-10 text-ink-300 md:px-10 md:pb-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-3 text-sm">
            La billetterie et le contrôle d'accès des festivals de Guinée.
          </p>
        </div>

        <nav className="flex flex-col gap-2.5 text-sm md:items-end">
          {LINKS.map(({ to, label }) => (
            <Link key={to} to={to} className="font-semibold transition-colors hover:text-white">
              {label}
            </Link>
          ))}
          <Link to="/organisateur" className="font-semibold transition-colors hover:text-white">
            Espace organisateur
          </Link>
        </nav>
      </div>

      <div className="mx-auto mt-8 max-w-6xl border-t border-white/10 pt-5 text-xs">
        © {new Date().getFullYear()} Festiv'Guinée. Tous droits réservés.
      </div>
    </footer>
  )
}