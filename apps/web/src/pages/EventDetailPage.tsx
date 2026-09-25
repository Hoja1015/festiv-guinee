import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEvent } from '../hooks/useEvents'
import { useCreateOrder } from '../hooks/useOrders'
import { useAuth } from '../contexts/AuthContext'
import { formatGNF, formatEventDate } from '../lib/format'
import { ThemeToggle } from '../components/ThemeToggle'

export function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading } = useEvent(Number(id))
  const { user } = useAuth()
  const navigate = useNavigate()
  const createOrder = useCreateOrder()

  const [quantities, setQuantities] = useState<Record<number, number>>({})

  function setQuantity(ticketTypeId: number, quantity: number) {
    setQuantities((prev) => ({ ...prev, [ticketTypeId]: Math.max(0, quantity) }))
  }

  const totalSelected = Object.values(quantities).reduce((sum, q) => sum + q, 0)

  async function handleBuy() {
    if (!user) {
      navigate('/login')
      return
    }

    const items = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketTypeId, quantity]) => ({ ticketTypeId: Number(ticketTypeId), quantity }))

    const result = await createOrder.mutateAsync(items)
    navigate(`/orders/${result.order.id}`)
  }

  if (isLoading) {
    return <div className="min-h-screen bg-bg flex items-center justify-center text-muted">Chargement…</div>
  }

  if (!event) {
    return <div className="min-h-screen bg-bg flex items-center justify-center text-muted">Événement introuvable.</div>
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="p-4 flex justify-between items-center border-b border-ink/10">
        <Link to="/" className="font-display text-xl font-semibold text-ink">
          Festiv'Guinée 🎟️
        </Link>
        <ThemeToggle />
      </header>

      {/* Bannière — le "moment fort" de cette page */}
      <div className="gradient-brand relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
        <div className="max-w-3xl mx-auto px-6 py-16 relative">
          <span className="text-white/80 text-sm font-medium">{event.category}</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white mt-2">
            {event.title}
          </h1>
          <p className="text-white/85 mt-4 text-lg">
            {formatEventDate(event.date)} · {event.venue}, {event.city}
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <p className="text-ink/90 leading-relaxed mb-10 max-w-xl">{event.description}</p>

        <h2 className="font-display text-2xl font-semibold text-ink mb-5">Billets</h2>

        <div className="space-y-3 mb-8">
          {event.ticketTypes.map((tt) => (
            <div
              key={tt.id}
              className="flex items-center justify-between p-4 rounded-lg border border-ink/10 bg-surface"
            >
              <div>
                <p className="font-medium text-ink">{tt.name}</p>
                <p className="text-sm text-muted">
                  {formatGNF(tt.priceGNF)} · {tt.remainingQuantity} places restantes
                </p>
              </div>

              {tt.remainingQuantity === 0 ? (
                <span className="text-sm text-accent-2 font-medium">Épuisé</span>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(tt.id, (quantities[tt.id] ?? 0) - 1)}
                    className="w-8 h-8 rounded-full border border-ink/20 text-ink hover:border-accent"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-ink">{quantities[tt.id] ?? 0}</span>
                  <button
                    onClick={() => setQuantity(tt.id, (quantities[tt.id] ?? 0) + 1)}
                    className="w-8 h-8 rounded-full border border-ink/20 text-ink hover:border-accent"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleBuy}
          disabled={totalSelected === 0 || createOrder.isPending}
          className="w-full py-3.5 rounded-lg bg-ink text-bg font-medium hover:opacity-90
                     transition-opacity disabled:opacity-40"
        >
          {createOrder.isPending
            ? 'Un instant…'
            : totalSelected === 0
              ? 'Sélectionnez au moins un billet'
              : user
                ? `Continuer — ${totalSelected} billet${totalSelected > 1 ? 's' : ''}`
                : 'Se connecter pour acheter'}
        </button>
      </main>
    </div>
  )
}