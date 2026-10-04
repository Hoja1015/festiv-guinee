import { useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEvent } from '../hooks/useEvents'
import { ticketTypeBadgeColor, ticketTypeLabel } from '../lib/ticketType'
import {
  ChevronLeftIcon,
  ShareIcon,
  TagIcon,
  CalendarIcon,
  PinIcon,
  MinusIcon,
  PlusIcon,
  StarIcon,
} from '../components/icons'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const priceFormatter = new Intl.NumberFormat('fr-FR')

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: event, isLoading, isError } = useEvent(id)
  const [quantities, setQuantities] = useState<Record<number, number>>({})

  const totalSelected = useMemo(
    () => Object.values(quantities).reduce((sum, qty) => sum + qty, 0),
    [quantities]
  )

  function setQuantity(ticketTypeId: number, delta: number, max: number) {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] ?? 0
      const next = Math.min(Math.max(current + delta, 0), max)
      return { ...prev, [ticketTypeId]: next }
    })
  }

  function handleChooseTicket() {
    if (!event) return
    navigate('/panier', {
      state: {
        eventId: event.id,
        eventTitle: event.title,
        selection: event.ticketTypes
          .filter((tt) => (quantities[tt.id] ?? 0) > 0)
          .map((tt) => ({
            ticketTypeId: tt.id,
            name: tt.name,
            priceGNF: tt.priceGNF,
            quantity: quantities[tt.id],
          })),
      },
    })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl p-5">
        <div className="h-64 animate-shimmer rounded-2xl" />
        <div className="mt-4 h-6 w-2/3 animate-shimmer rounded" />
      </div>
    )
  }

  if (isError || !event) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <p className="text-sm text-gray-500">Cet événement est introuvable ou n'est plus disponible.</p>
        <button
          onClick={() => navigate('/evenements')}
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white"
        >
          Retour aux événements
        </button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in-up pb-36 md:pb-16">
      <div className="relative">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-72 w-full object-cover md:h-96 md:rounded-2xl"
          />
        ) : (
          <div className="flex h-72 w-full items-center justify-center bg-gradient-to-br from-primary-600 via-primary-400 to-accent-400 md:h-96 md:rounded-2xl" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950/85 via-ink-950/10 to-transparent md:rounded-2xl" />

        <button
          onClick={() => navigate(-1)}
          aria-label="Retour"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur md:left-6 md:top-6"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <button
          aria-label="Partager"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur md:right-6 md:top-6"
        >
          <ShareIcon className="h-4.5 w-4.5" />
        </button>

        <h1 className="absolute inset-x-5 bottom-4 text-2xl font-extrabold leading-tight text-white md:inset-x-8 md:bottom-6 md:text-4xl">
          {event.title}
        </h1>
      </div>

      <div className="px-5 pt-5 md:px-2">
        <div className="space-y-2.5 text-sm text-gray-600 md:flex md:gap-8 md:space-y-0">
          <div className="flex items-center gap-2.5">
            <TagIcon className="h-4 w-4 flex-shrink-0 text-primary-600" />
            {event.category}
          </div>
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="h-4 w-4 flex-shrink-0 text-primary-600" strokeWidth={2} />
            {dateFormatter.format(new Date(event.date))}
          </div>
          <div className="flex items-center gap-2.5">
            <PinIcon className="h-4 w-4 flex-shrink-0 text-primary-600" strokeWidth={2} />
            {event.venue}, {event.city}
          </div>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-gray-500 md:max-w-2xl md:text-base">
          {event.description}
        </p>

        <h2 className="mt-7 text-base font-extrabold text-ink-950 md:text-lg">Types de billets</h2>

        {event.ticketTypes.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">
            Aucun type de billet n'a encore été configuré pour cet événement.
          </p>
        ) : (
          <div className="mt-3 flex flex-col gap-2.5 md:max-w-xl">
            {event.ticketTypes.map((ticketType) => {
              const qty = quantities[ticketType.id] ?? 0
              const soldOut = ticketType.remainingQuantity === 0
              return (
                <div
                  key={ticketType.id}
                  className="flex items-center justify-between rounded-2xl border border-gray-100 px-4 py-3.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${ticketTypeBadgeColor(ticketType.name)}`}
                    >
                      <StarIcon className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-ink-950">
                        {ticketTypeLabel(ticketType.name)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {soldOut
                          ? 'Épuisé'
                          : `${priceFormatter.format(ticketType.priceGNF)} GNF`}
                      </div>
                    </div>
                  </div>

                  {!soldOut && (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(ticketType.id, -1, ticketType.remainingQuantity)}
                        disabled={qty === 0}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition disabled:opacity-40"
                      >
                        <MinusIcon />
                      </button>
                      <span className="w-4 text-center text-sm font-bold text-ink-950">{qty}</span>
                      <button
                        onClick={() => setQuantity(ticketType.id, 1, ticketType.remainingQuantity)}
                        disabled={qty >= ticketType.remainingQuantity}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition disabled:opacity-40"
                      >
                        <PlusIcon />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <button
          onClick={handleChooseTicket}
          disabled={totalSelected === 0}
          className="mt-6 hidden w-full max-w-xs rounded-2xl bg-primary-600 py-3.5 text-center text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400 disabled:hover:translate-y-0 disabled:hover:shadow-none md:block"
        >
          Choisir un billet
        </button>
      </div>

      <div className="fixed inset-x-0 bottom-[70px] z-20 border-t border-gray-100 bg-white px-5 py-4 md:hidden">
        <button
          onClick={handleChooseTicket}
          disabled={totalSelected === 0}
          className="block w-full rounded-2xl bg-primary-600 py-3.5 text-center text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
        >
          Choisir un billet
        </button>
      </div>
    </div>
  )
}