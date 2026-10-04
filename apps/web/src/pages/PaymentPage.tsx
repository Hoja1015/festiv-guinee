import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCreateOrder, usePayOrder } from '../hooks/useOrders'
import { ticketTypeLabel } from '../lib/ticketType'
import { ApiError } from '../lib/api'

interface CartLine {
  ticketTypeId: number
  name: 'STANDARD' | 'VIP' | 'VVIP'
  priceGNF: number
  quantity: number
}

interface PaymentLocationState {
  eventId: number
  eventTitle: string
  lines: CartLine[]
  total: number
}

type Phase = 'idle' | 'creating' | 'paying'

const priceFormatter = new Intl.NumberFormat('fr-FR')

const PAYMENT_METHODS = [
  { id: 'MOCK', label: 'Paiement simulé (demo)', available: true },
  { id: 'ORANGE_MONEY', label: 'Orange Money', available: false },
  { id: 'MTN_MOMO', label: 'MTN Mobile Money', available: false },
  { id: 'CARD', label: 'Carte bancaire', available: false },
] as const

export function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as PaymentLocationState | null

  const [phase, setPhase] = useState<Phase>('idle')
  const [orderId, setOrderId] = useState<number | null>(null)
  const [simulateFailure, setSimulateFailure] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createOrder = useCreateOrder()
  const payOrder = usePayOrder()

  if (!state || state.lines.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-gray-500">Aucun billet à payer pour le moment.</p>
        <Link
          to="/evenements"
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
        >
          Parcourir les événements
        </Link>
      </div>
    )
  }

  async function handlePay() {
    setError(null)
    try {
      let currentOrderId = orderId

      // On ne recrée pas la commande si elle existe déjà (ex: l'utilisateur
      // relance le paiement après un échec réseau sur l'étape précédente) —
      // sinon on décrémenterait le stock deux fois pour rien.
      if (!currentOrderId) {
        setPhase('creating')
        const items = state!.lines.map((line) => ({
          ticketTypeId: line.ticketTypeId,
          quantity: line.quantity,
        }))
        const { order } = await createOrder.mutateAsync(items)
        currentOrderId = order.id
        setOrderId(order.id)
      }

      setPhase('paying')
      const { payment } = await payOrder.mutateAsync({
        orderId: currentOrderId,
        forceFail: simulateFailure,
      })

      navigate('/confirmation', {
        state: {
          payment,
          eventId: state!.eventId,
          eventTitle: state!.eventTitle,
          lines: state!.lines,
          total: state!.total,
        },
      })
    } catch (err) {
      setPhase('idle')
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Une erreur est survenue. Réessaie dans un instant.')
      }
    }
  }

  const isProcessing = phase !== 'idle'

  return (
    <div className="mx-auto max-w-2xl animate-fade-in-up px-5 pb-10 pt-5 md:pt-10">
      <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Paiement</h1>

      <div className="mt-5 rounded-2xl border border-gray-100 p-4">
        <div className="text-sm font-bold text-ink-950">{state.eventTitle}</div>
        <div className="mt-2 space-y-1 text-xs text-gray-500">
          {state.lines.map((line) => (
            <div key={line.ticketTypeId} className="flex justify-between">
              <span>
                {line.quantity} × {ticketTypeLabel(line.name)}
              </span>
              <span>{priceFormatter.format(line.priceGNF * line.quantity)} GNF</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm font-extrabold text-ink-950">
          <span>Total</span>
          <span>{priceFormatter.format(state.total)} GNF</span>
        </div>
      </div>

      <h2 className="mt-7 text-sm font-extrabold text-ink-950">Moyen de paiement</h2>
      <div className="mt-3 flex flex-col gap-2.5">
        {PAYMENT_METHODS.map((method) => (
          <label
            key={method.id}
            className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-sm font-semibold transition ${
              method.available
                ? 'cursor-pointer border-primary-600 bg-primary-600/5 text-ink-950'
                : 'cursor-not-allowed border-gray-100 text-gray-300'
            }`}
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="payment-method"
                defaultChecked={method.available}
                disabled={!method.available}
                className="accent-primary-600"
              />
              {method.label}
            </span>
            {!method.available && (
              <span className="text-xs font-bold text-gray-300">Bientôt disponible</span>
            )}
          </label>
        ))}
      </div>

      <label className="mt-4 flex items-center gap-2.5 text-xs text-gray-400">
        <input
          type="checkbox"
          checked={simulateFailure}
          onChange={(e) => setSimulateFailure(e.target.checked)}
          className="accent-primary-600"
        />
        Simuler un paiement échoué (pour tester l'écran d'échec)
      </label>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</p>
      )}

      <button
        onClick={handlePay}
        disabled={isProcessing}
        className="mt-6 w-full rounded-2xl bg-primary-600 py-3.5 text-center text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none md:max-w-xs"
      >
        {phase === 'creating' && 'Création de la commande...'}
        {phase === 'paying' && 'Traitement du paiement...'}
        {phase === 'idle' && `Payer ${priceFormatter.format(state.total)} GNF`}
      </button>
    </div>
  )
}