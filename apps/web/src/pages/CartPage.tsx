import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useEvent } from '../hooks/useEvents'
import { ticketTypeBadgeColor, ticketTypeLabel } from '../lib/ticketType'
import { MinusIcon, PlusIcon, TrashIcon, StarIcon } from '../components/icons'

interface CartSelectionItem {
  ticketTypeId: number
  name: 'STANDARD' | 'VIP' | 'VVIP'
  priceGNF: number
  quantity: number
}

interface CartLocationState {
  eventId: number
  eventTitle: string
  selection: CartSelectionItem[]
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const priceFormatter = new Intl.NumberFormat('fr-FR')

export function CartPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const initialState = location.state as CartLocationState | null

  const [quantities, setQuantities] = useState<Record<number, number>>(() => {
    const map: Record<number, number> = {}
    initialState?.selection.forEach((item) => {
      map[item.ticketTypeId] = item.quantity
    })
    return map
  })

  const { data: event, isLoading } = useEvent(
    initialState ? String(initialState.eventId) : undefined
  )

  const lines = useMemo(() => {
    if (!event) return []
    return event.ticketTypes
      .filter((tt) => (quantities[tt.id] ?? 0) > 0)
      .map((tt) => ({
        ticketTypeId: tt.id,
        name: tt.name,
        priceGNF: tt.priceGNF,
        remainingQuantity: tt.remainingQuantity,
        quantity: quantities[tt.id],
      }))
  }, [event, quantities])

  const total = lines.reduce((sum, line) => sum + line.priceGNF * line.quantity, 0)

  function updateQuantity(ticketTypeId: number, delta: number, max: number) {
    setQuantities((prev) => {
      const current = prev[ticketTypeId] ?? 0
      const next = Math.min(Math.max(current + delta, 0), max)
      return { ...prev, [ticketTypeId]: next }
    })
  }

  function removeLine(ticketTypeId: number) {
    setQuantities((prev) => ({ ...prev, [ticketTypeId]: 0 }))
  }

  function handleContinue() {
    if (!event || lines.length === 0) return
    navigate('/paiement', {
      state: {
        eventId: event.id,
        eventTitle: event.title,
        lines,
        total,
      },
    })
  }

  if (!initialState) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-gray-500">Ton panier est vide pour l'instant.</p>
        <Link
          to="/evenements"
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
        >
          Parcourir les événements
        </Link>
      </div>
    )
  }

  if (isLoading || !event) {
    return (
      <div className="mx-auto max-w-2xl p-5">
        <div className="h-20 animate-shimmer rounded-2xl" />
        <div className="mt-4 h-16 animate-shimmer rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up px-5 pb-36 pt-5 md:pb-16">
      <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Mon panier</h1>

      <div className="mt-5 flex items-center gap-3 border-b border-gray-100 pb-5">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="h-14 w-14 flex-shrink-0 rounded-xl object-cover" />
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-accent-400" />
        )}
        <div>
          <div className="text-sm font-bold text-ink-950">{event.title}</div>
          <div className="text-xs text-gray-400">
            {dateFormatter.format(new Date(event.date))} · {event.city}
          </div>
        </div>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-14 text-center">
          <p className="text-sm text-gray-400">Tu as retiré tous tes billets du panier.</p>
          <Link
            to={`/events/${event.id}`}
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            Retourner à l'événement
          </Link>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {lines.map((line) => (
              <div key={line.ticketTypeId} className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-white ${ticketTypeBadgeColor(line.name)}`}
                  >
                    <StarIcon className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-ink-950">{ticketTypeLabel(line.name)}</div>
                    <div className="text-xs text-gray-400">
                      {priceFormatter.format(line.priceGNF)} GNF
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => updateQuantity(line.ticketTypeId, -1, line.remainingQuantity)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
                  >
                    <MinusIcon />
                  </button>
                  <span className="w-4 text-center text-sm font-bold text-ink-950">{line.quantity}</span>
                  <button
                    onClick={() => updateQuantity(line.ticketTypeId, 1, line.remainingQuantity)}
                    disabled={line.quantity >= line.remainingQuantity}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 disabled:opacity-40"
                  >
                    <PlusIcon />
                  </button>
                  <button
                    onClick={() => removeLine(line.ticketTypeId)}
                    aria-label="Retirer"
                    className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-gray-300 transition hover:bg-red-50 hover:text-red-500"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-2 space-y-2 border-t border-gray-100 pt-4">
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Sous-total</span>
              <span>{priceFormatter.format(total)} GNF</span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-100 pt-3 text-base font-extrabold text-ink-950">
              <span>Total</span>
              <span>{priceFormatter.format(total)} GNF</span>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="mt-6 hidden w-full max-w-xs rounded-2xl bg-primary-600 py-3.5 text-center text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:block"
          >
            Continuer
          </button>
        </>
      )}

      {lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-[70px] z-20 border-t border-gray-100 bg-white px-5 py-4 md:hidden">
          <button
            onClick={handleContinue}
            className="block w-full rounded-2xl bg-primary-600 py-3.5 text-center text-sm font-bold text-white transition"
          >
            Continuer
          </button>
        </div>
      )}
    </div>
  )
}