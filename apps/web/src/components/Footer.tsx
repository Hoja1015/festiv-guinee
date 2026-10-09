import type { MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

const DISCOVER_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/evenements', label: 'Événements' },
  { to: '/billets', label: 'Mes billets' },
  { to: '/panier', label: 'Panier' },
]

const PRO_LINKS = [
  { to: '/organisateur', label: 'Espace organisateur' },
  { to: '/agent', label: 'Espace agent (scan)' },
]

// Liens provisoires : remplacer "#" par les vraies adresses dès qu'elles existent.
const SOCIALS = [
  { label: 'Facebook', href: '#' },
  { label: 'Instagram', href: '#' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@mgsevents?_r=1&_t=ZG-9APK2sCLqEL' },
  { label: 'WhatsApp', href: '#' },
]

// Un lien "#" ne doit pas renvoyer en haut de la page.
function ignorePlaceholder(event: MouseEvent<HTMLAnchorElement>) {
  if (event.currentTarget.getAttribute('href') === '#') event.preventDefault()
}

const linkClass = 'font-semibold text-ink-300 transition-colors hover:text-white'

export function Footer() {
  return (
    <footer className="relative bg-ink-950 px-6 pb-28 pt-12 text-ink-300 md:px-10 md:pb-10 md:pt-16">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-600 via-primary-400 to-accent-400" />

      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed">
            La billetterie et le contrôle d'accès des festivals de Guinée. Réservez, recevez votre QR code, entrez en un scan.
          </p>
        </div>

        <nav aria-label="Explorer">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">Explorer</h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {DISCOVER_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Professionnels">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">Professionnels</h2>
          <ul className="mt-4 flex flex-col gap-2.5 text-sm">
            {PRO_LINKS.map(({ to, label }) => (
              <li key={to}>
                <Link to={to} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-white">Suivez-nous</h2>
          <ul className="mt-4 flex flex-wrap gap-2.5">
            {SOCIALS.map(({ label, href }) => (
              <li key={label}>
                <a
                  href={href}
                  onClick={ignorePlaceholder}
                  className="block rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-ink-300 transition-all duration-200 hover:border-primary-400 hover:bg-primary-600 hover:text-white"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 border-t border-white/10 pt-6 text-xs md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} Festiv'Guinée. Tous droits réservés.</span>
        <span>Conçu en Guinée pour les festivals de Guinée.</span>
      </div>
    </footer>
  )
}