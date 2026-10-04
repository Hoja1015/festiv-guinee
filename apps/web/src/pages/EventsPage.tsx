import { useMemo, useState } from 'react'
import { SearchIcon } from '../components/icons'
import { EventCard } from '../components/EventCard'
import { usePublishedEvents } from '../hooks/useEvents'

export function EventsPage() {
  const { data: events, isLoading, isError } = usePublishedEvents()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('Tous')

  const categories = useMemo(() => {
    if (!events) return ['Tous']
    const unique = Array.from(new Set(events.map((e) => e.category)))
    return ['Tous', ...unique]
  }, [events])

  const filtered = useMemo(() => {
    if (!events) return []
    return events.filter((event) => {
      const matchesCategory = category === 'Tous' || event.category === category
      const matchesSearch = event.title.toLowerCase().includes(search.trim().toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [events, search, category])

  return (
    <div className="mx-auto max-w-6xl px-5 pb-8 pt-5 md:px-10 md:pt-10">
      <h1 className="hidden text-2xl font-extrabold text-ink-950 md:block">Tous les événements</h1>
      <p className="mt-1 hidden text-sm text-gray-500 md:block">
        Découvrez les festivals à venir partout en Guinée.
      </p>

      <div className="mt-0 md:mt-6">
        <div className="flex items-center gap-2.5 rounded-2xl bg-gray-100 px-4 py-3 transition-shadow focus-within:ring-2 focus-within:ring-primary-600/30 md:max-w-sm">
          <SearchIcon className="h-4 w-4 flex-shrink-0 text-gray-400" strokeWidth={2.2} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un festival..."
            className="w-full bg-transparent text-sm text-ink-950 placeholder:text-gray-400 focus:outline-none"
          />
        </div>
      </div>

      {categories.length > 1 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex-shrink-0 rounded-full px-4.5 py-2 text-[13px] font-bold transition-all duration-200 ${
                category === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {isLoading &&
          [0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-shimmer rounded-2xl" />
          ))}

        {isError && (
          <p className="col-span-full py-10 text-center text-sm text-gray-400">
            Impossible de charger les événements pour le moment. Vérifie que le serveur tourne.
          </p>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-gray-400">
            Aucun événement ne correspond à ta recherche.
          </p>
        )}

        {!isLoading &&
          filtered.map((event, i) => <EventCard key={event.id} event={event} delay={i * 60} />)}
      </div>
    </div>
  )
}