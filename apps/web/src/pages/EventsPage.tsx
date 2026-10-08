import { useState } from 'react'
import { SearchIcon } from '../components/icons'
import { EventCard } from '../components/EventCard'
import { usePublishedEvents } from '../hooks/useEvents'
import { useDebouncedValue } from '../hooks/useDebouncedValue'

const PAGE_SIZE = 12

export function EventsPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('Tous')
  const [page, setPage] = useState(1)

  // La recherche part vers l'API une fois la frappe terminée.
  const debouncedSearch = useDebouncedValue(search.trim())

  const { data, isLoading, isError, isPlaceholderData } = usePublishedEvents({
    page,
    pageSize: PAGE_SIZE,
    q: debouncedSearch || undefined,
    category: category === 'Tous' ? undefined : category,
  })

  const events = data?.events ?? []
  const pagination = data?.pagination
  const categories = ['Tous', ...(data?.categories ?? [])]
  const hasFilters = category !== 'Tous' || debouncedSearch !== ''

  function changeSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  function changeCategory(value: string) {
    setCategory(value)
    setPage(1)
  }

  function goToPage(next: number) {
    setPage(next)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="mx-auto max-w-6xl px-5 pb-8 pt-5 md:px-10 md:pt-10">
      <h1 className="hidden text-2xl font-extrabold text-ink-950 md:block">Tous les événements</h1>
      <p className="mt-1 hidden text-sm text-gray-600 md:block">
        Découvrez les festivals à venir partout en Guinée.
      </p>

      <div className="mt-0 md:mt-6">
        <div className="flex items-center gap-2.5 rounded-2xl bg-gray-100 px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-primary-600/30 md:max-w-sm">
          <SearchIcon className="h-4 w-4 flex-shrink-0 text-gray-500" strokeWidth={2.2} />
          <input
            type="search"
            value={search}
            onChange={(e) => changeSearch(e.target.value)}
            placeholder="Rechercher un festival..."
            aria-label="Rechercher un festival"
            className="w-full bg-transparent text-sm text-ink-950 placeholder:text-gray-500 focus:outline-none"
          />
        </div>
      </div>

      {categories.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={category === cat}
              onClick={() => changeCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div
        className={`mt-5 grid grid-cols-1 gap-4 transition-opacity sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 ${
          isPlaceholderData ? 'opacity-60' : ''
        }`}
      >
        {isLoading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-shimmer rounded-2xl" />
          ))}

        {isError && (
          <p className="col-span-full py-10 text-center text-sm text-gray-600">
            Impossible de charger les événements pour le moment. Vérifie que le serveur tourne.
          </p>
        )}

        {!isLoading && !isError && events.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-gray-600">
            {hasFilters
              ? 'Aucun événement ne correspond à ta recherche.'
              : 'Aucun événement publié pour le moment.'}
          </p>
        )}

        {!isLoading &&
          events.map((event, i) => <EventCard key={event.id} event={event} delay={i * 60} />)}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <nav
          aria-label="Pagination des événements"
          className="mt-8 flex items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={() => goToPage(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Précédent
          </button>
          <span className="text-sm font-semibold text-gray-600">
            Page {pagination.page} sur {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => goToPage(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suivant
          </button>
        </nav>
      )}
    </div>
  )
}