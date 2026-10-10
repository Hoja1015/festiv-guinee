import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { EventCard } from '../components/EventCard'
import { Feed } from '../components/posts/Feed'
import { CalendarIcon, TicketIcon } from '../components/icons'
import { usePastHighlights, usePublishedEvents } from '../hooks/useEvents'
import type { PastHighlightEvent } from '../lib/api'

// Photos libres de droits (licence Unsplash). L'hébergeur ajuste le format
// (WebP/AVIF) et la taille : un téléphone ne télécharge pas l'image 1800 px.
const HERO_ID = 'photo-1760539619529-cfd85a2a9cfd'
const CROWD_ID = 'photo-1506157786151-b8491531f063'

function unsplash(id: string, width: number) {
  return `https://images.unsplash.com/${id}?q=70&auto=format&fit=crop&w=${width}`
}

function srcSet(id: string, widths: number[]) {
  return widths.map((w) => `${unsplash(id, w)} ${w}w`).join(', ')
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('fr-FR')

const STEPS = [
  {
    title: 'Choisissez votre festival',
    text: 'Parcourez les événements, comparez les catégories de billets et ajoutez ceux qui vous plaisent au panier.',
    Icon: CalendarIcon,
  },
  {
    title: 'Réservez en quelques clics',
    text: 'Créez votre compte, validez votre commande et retrouvez vos billets à tout moment dans votre espace.',
    Icon: TicketIcon,
  },
  {
    title: 'Entrez avec votre QR code',
    text: "À l'entrée, un simple scan suffit. Chaque billet est unique et ne peut être utilisé qu'une seule fois.",
    Icon: QrIcon,
  },
]

const TRUST_POINTS = ['Billets QR uniques', 'Contrôle à l’entrée en temps réel', 'Achat 100 % en ligne']

export function HomePage() {
  return (
    <div>
      <Hero />
      <UpcomingSection />
      <HowItWorks />
      <PastHighlightsSection />
      <OrganizerBanner />
      <Feed />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-ink-950">
      <img
        src={unsplash(HERO_ID, 1200)}
        srcSet={srcSet(HERO_ID, [640, 1200, 1800])}
        sizes="100vw"
        fetchPriority="high"
        decoding="async"
        alt="Foule devant une scène de festival éclairée de lasers"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/60 to-ink-950/30 md:bg-gradient-to-r md:from-ink-950/90 md:via-ink-950/55 md:to-primary-700/20" />

      <header className="flex items-center px-6 pt-5 md:hidden">
        <Logo />
      </header>

      <div className="mx-auto flex min-h-[500px] max-w-6xl flex-col justify-end px-6 pb-10 pt-24 md:min-h-[560px] md:justify-center md:px-10 md:pb-16 md:pt-20">
        <div className="animate-fade-in-up md:max-w-2xl">

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] text-white md:text-6xl">
            Vivez les plus belles <span className="text-accent-400">nuits</span> de Guinée
          </h1>
          <p className="mt-4 text-base text-ink-300 md:text-xl md:text-white/80">
            Réservez vos billets en ligne, retrouvez-les sur votre téléphone et entrez en un scan.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/evenements"
              className="rounded-2xl bg-accent-400 px-8 py-4 text-center text-base font-extrabold text-ink-950 shadow-lg shadow-accent-400/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 active:scale-[0.98]"
            >
              Explorer les festivals
            </Link>
            <Link
              to="/billets"
              className="rounded-2xl border border-white/25 bg-white/10 px-8 py-4 text-center text-base font-bold text-white backdrop-blur transition-all duration-200 hover:bg-white/20 active:scale-[0.98]"
            >
              Mes billets
            </Link>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/85">
            {TRUST_POINTS.map((point) => (
              <li key={point} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-white">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function UpcomingSection() {
  const { data, isLoading, isError } = usePublishedEvents({ pageSize: 4 })
  const events = data?.events ?? []

  if (!isLoading && !isError && events.length === 0) return null

  return (
    <section className="mx-auto max-w-6xl px-6 pb-4 pt-12 md:px-10 md:pt-16">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-ink-950 md:text-3xl">À l'affiche</h2>
          <p className="mt-1.5 text-sm text-gray-500 md:text-base">
            Les prochains festivals ouverts à la réservation.
          </p>
        </div>
        <Link
          to="/evenements"
          className="flex-shrink-0 text-sm font-bold text-primary-600 transition-colors hover:text-primary-700"
        >
          Tout voir →
        </Link>
      </div>

      {isError && (
        <p className="mt-5 text-sm text-gray-400">Impossible de charger les événements pour le moment.</p>
      )}

      {isLoading && (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-[260px] flex-none overflow-hidden rounded-2xl border border-gray-100 md:w-full">
              <div className="h-36 animate-shimmer" />
              <div className="space-y-2.5 p-4">
                <div className="h-4 w-3/4 animate-shimmer rounded" />
                <div className="h-3 w-1/2 animate-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && events.length > 0 && (
        <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 md:grid md:grid-cols-2 md:overflow-visible lg:grid-cols-4">
          {events.slice(0, 4).map((event, i) => (
            <div key={event.id} className="w-[270px] flex-none snap-start md:w-full">
              <EventCard event={event} delay={i * 70} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 md:px-10 md:py-16">
      <h2 className="text-2xl font-extrabold text-ink-950 md:text-3xl">Comment ça marche</h2>
      <p className="mt-1.5 text-sm text-gray-500 md:text-base">Du choix du festival à l'entrée, en trois étapes.</p>

      <ol className="mt-8 grid gap-4 md:grid-cols-3 md:gap-6">
        {STEPS.map(({ title, text, Icon }, i) => (
          <li
            key={title}
            className="relative overflow-hidden rounded-3xl border border-gray-100 bg-gradient-to-br from-white to-primary-600/5 p-6 shadow-sm shadow-ink-950/5"
          >
            <span className="absolute right-5 top-3 text-6xl font-extrabold text-primary-600/10" aria-hidden="true">
              {i + 1}
            </span>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-md shadow-primary-600/30">
              <Icon className="h-6 w-6" strokeWidth={2} />
            </span>
            <h3 className="mt-5 text-lg font-extrabold text-ink-950">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">{text}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function OrganizerBanner() {
  return (
    <section className="px-6 pb-12 md:px-10 md:pb-16">
      <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl bg-ink-950">
        <img
          src={unsplash(CROWD_ID, 1000)}
          srcSet={srcSet(CROWD_ID, [640, 1000, 1600])}
          sizes="(min-width: 1152px) 1152px, 100vw"
          loading="lazy"
          decoding="async"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/80 to-primary-700/50" />

        <div className="px-6 py-10 md:px-14 md:py-16">
          <h2 className="max-w-xl text-2xl font-extrabold leading-tight text-white md:text-4xl">
            Vous organisez un festival ?
          </h2>
          <p className="mt-3 max-w-lg text-sm text-white/80 md:text-base">
            Publiez votre événement, vendez vos billets en ligne, suivez vos ventes en direct et contrôlez les entrées avec votre équipe.
          </p>
          <Link
            to="/organisateur"
            className="mt-7 inline-block rounded-2xl bg-white px-8 py-3.5 text-sm font-extrabold text-ink-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent-400 active:scale-[0.98]"
          >
            Accéder à l'espace organisateur
          </Link>
        </div>
      </div>
    </section>
  )
}

function QrIcon({ className, strokeWidth = 2 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3" />
    </svg>
  )
}

function PastHighlightsSection() {
  const { data: events, isLoading, isError } = usePastHighlights(8)

  if (!isLoading && !isError && (!events || events.length === 0)) {
    return null
  }

  return (
    <div className="bg-gray-50 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <h2 className="text-2xl font-extrabold text-ink-950 md:text-3xl">Nos festivals passés</h2>
        <p className="mt-1.5 text-sm text-gray-500 md:text-base">
          Revivez les moments forts de nos précédentes éditions.
        </p>

        {isError && (
          <p className="mt-4 text-sm text-gray-400">
            Impossible de charger les festivals passés pour le moment.
          </p>
        )}

        {isLoading && (
          <div className="mt-6 flex gap-3.5 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-[170px] flex-none overflow-hidden rounded-2xl border border-gray-100 bg-white md:w-full">
                <div className="h-[100px] animate-shimmer" />
                <div className="space-y-2 p-3">
                  <div className="h-3 w-3/4 animate-shimmer rounded" />
                  <div className="h-3 w-1/2 animate-shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && events && events.length > 0 && (
          <div className="mt-6 flex gap-3.5 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible">
            {events.map((event, i) => (
              <PastHighlightCard key={event.id} event={event} delay={i * 70} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function PastHighlightCard({ event, delay }: { event: PastHighlightEvent; delay: number }) {
  return (
    <div
      className="group w-[170px] flex-none animate-fade-in-up overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink-950/10 md:w-full"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            loading="lazy"
            decoding="async"
            alt=""
            className="h-[100px] w-full object-cover transition-transform duration-300 group-hover:scale-105 md:h-[140px]"
          />
        ) : (
          <div className="flex h-[100px] items-center justify-center bg-gradient-to-br from-primary-600 to-primary-400 px-2 text-center text-[11px] font-semibold text-white/85 transition-transform duration-300 group-hover:scale-105 md:h-[140px]">
            {event.title}
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="truncate text-[13px] font-bold text-ink-950">{event.title}</div>
        <div className="mt-0.5 text-[11px] text-gray-400">
          {dateFormatter.format(new Date(event.date))} · {event.city}
        </div>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600">
            <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9Z" />
          </svg>
          <span className="text-[10px] font-bold text-ink-950">
            {numberFormatter.format(event.ticketsSold)} billets vendus
          </span>
        </div>
      </div>
    </div>
  )
}