import { Link } from 'react-router-dom'
import { Logo } from '../components/Logo'
import { Feed } from '../components/posts/Feed'
import { usePastHighlights } from '../hooks/useEvents'
import type { PastHighlightEvent } from '../lib/api'

const HERO_BASE = 'https://images.unsplash.com/photo-1768053921689-1bc09db904c9?fm=jpg&q=70&auto=format&fit=crop'
const HERO_IMAGE_URL = `${HERO_BASE}&w=1200`
// Plusieurs tailles : un téléphone ne télécharge pas l'image 1600 px.
const HERO_SRCSET = `${HERO_BASE}&w=640 640w, ${HERO_BASE}&w=1200 1200w, ${HERO_BASE}&w=1800 1800w`

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const numberFormatter = new Intl.NumberFormat('fr-FR')

export function HomePage() {
  return (
    <div>
      <div className="relative">
        <img
          src={HERO_IMAGE_URL}
          srcSet={HERO_SRCSET}
          sizes="100vw"
          fetchPriority="high"
          decoding="async"
          alt="Foule lors d'un festival avec éclairage de scène"
          className="h-56 w-full object-cover sm:h-72 md:h-[420px]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/50 via-ink-950/10 to-ink-950 md:bg-gradient-to-t md:from-ink-950/80 md:via-ink-950/30 md:to-transparent" />
        <header className="absolute inset-x-0 top-0 flex items-center gap-2 px-6 py-4 md:hidden">
          <Logo />
        </header>
      </div>

      <div className="bg-ink-950 px-6 pb-8 pt-6 md:bg-transparent md:px-10 md:pb-16 md:pt-10">
        <div className="mx-auto max-w-3xl animate-fade-in-up md:max-w-none">
          <h1 className="text-3xl font-extrabold leading-tight text-white md:max-w-xl md:text-5xl">
            Les meilleurs festivals de Guinée à portée de main
          </h1>
          <p className="mt-4 text-base text-ink-300 md:max-w-md md:text-lg">
            Achetez vos billets en ligne et vivez des expériences inoubliables !
          </p>

          <Link
            to="/evenements"
            className="mt-8 block rounded-2xl bg-primary-600 px-6 py-4 text-center text-base font-bold text-white shadow-lg shadow-primary-600/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/40 active:scale-[0.98] md:inline-block md:px-10"
          >
            Explorer les festivals
          </Link>
        </div>
      </div>

      <PastHighlightsSection />
      <Feed />
    </div>
  )
}

function PastHighlightsSection() {
  const { data: events, isLoading, isError } = usePastHighlights(8)

  if (!isLoading && !isError && (!events || events.length === 0)) {
    return null
  }

  return (
    <div className="mx-auto max-w-6xl px-6 pb-10 pt-7 md:px-10 md:pb-16 md:pt-4">
      <h2 className="text-lg font-extrabold text-ink-950 md:text-2xl">Nos festivals passés</h2>
      <p className="mt-1.5 text-sm text-gray-500 md:text-base">
        Revivez les moments forts de nos précédentes éditions.
      </p>

      {isError && (
        <p className="mt-4 text-sm text-gray-400">
          Impossible de charger les festivals passés pour le moment.
        </p>
      )}

      {isLoading && (
        <div className="mt-4 flex gap-3.5 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="w-[170px] flex-none overflow-hidden rounded-2xl border border-gray-100 md:w-full">
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
        <div className="mt-4 flex gap-3.5 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:gap-6 md:overflow-visible">
          {events.map((event, i) => (
            <PastHighlightCard key={event.id} event={event} delay={i * 70} />
          ))}
        </div>
      )}
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