import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { usePayOrder } from '../hooks/usePayment'
import { ThemeToggle } from '../components/ThemeToggle'

// Type sorti en dehors du composant — corrige une erreur de parsing du
// type union directement inline dans useState<...>(...).
type PaymentOutcome =
  | { status: 'PAID'; tickets: Record<string, string[]> }
  | { status: 'CANCELLED'; reason?: string }

export function OrderPage() {
  const { id } = useParams<{ id: string }>()
  const orderId = Number(id)
  const payOrder = usePayOrder()
  const [result, setResult] = useState<PaymentOutcome | null>(null)

  async function handlePay() {
    const response = await payOrder.mutateAsync(orderId)
    if (response.payment.status === 'PAID') {
      setResult({ status: 'PAID', tickets: response.payment.tickets ?? {} })
    } else {
      setResult({ status: 'CANCELLED', reason: response.payment.reason })
    }
  }

  const allTicketIds = result?.status === 'PAID' ? Object.keys(result.tickets) : []

  return (
    <div className="min-h-screen bg-bg">
      <header className="p-4 flex justify-between items-center border-b border-ink/10">
        <Link to="/" className="font-display text-xl font-semibold text-ink">
          Festiv'Guinée 🎟️
        </Link>
        <ThemeToggle />
      </header>

      <main className="max-w-lg mx-auto px-6 py-16">
        {!result && (
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold text-ink mb-3">
              Finaliser votre commande
            </h1>
            <p className="text-muted mb-10">
              Commande n°{orderId} — paiement simulé pour ce prototype.
            </p>
            <button
              onClick={handlePay}
              disabled={payOrder.isPending}
              className="w-full py-3.5 rounded-lg gradient-brand text-white font-medium
                         hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {payOrder.isPending ? 'Paiement en cours…' : 'Payer maintenant'}
            </button>
          </div>
        )}

        {result?.status === 'CANCELLED' && (
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold text-accent-2 mb-3">
              Paiement échoué
            </h1>
            <p className="text-muted">{result.reason ?? 'Une erreur est survenue.'}</p>
            <Link to="/" className="inline-block mt-8 text-accent underline">
              Retour aux événements
            </Link>
          </div>
        )}

        {result?.status === 'PAID' && (
          <div>
            <div className="text-center mb-10">
              <p className="inline-block px-3 py-1 rounded-full bg-success/10 text-success text-sm font-medium mb-4">
                Paiement confirmé
              </p>
              <h1 className="font-display text-3xl font-semibold text-ink">Vos billets sont prêts</h1>
            </div>

            <div className="space-y-6">
              {allTicketIds.map((orderItemId) =>
                result.tickets[orderItemId].map((_token, i) => (
                  <div
                    key={`${orderItemId}-${i}`}
                    className="rounded-xl border border-ink/10 bg-surface p-6 text-center"
                  >
                    <p className="text-sm text-muted mb-4">Billet {i + 1}</p>
                    <p className="text-xs text-muted">
                      Retrouvez ce billet avec son QR code dans "Mes billets".
                    </p>
                  </div>
                ))
              )}
            </div>

            <Link
              to="/tickets"
              className="block text-center mt-8 py-3 rounded-lg bg-ink text-bg font-medium hover:opacity-90"
            >
              Voir mes billets
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}