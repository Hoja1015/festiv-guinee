import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ticketTypeLabel } from '../lib/ticketType'
import type { PaymentResult } from '../hooks/useOrders'

interface CartLine {
  ticketTypeId: number
  name: 'STANDARD' | 'VIP' | 'VVIP'
  priceGNF: number
  quantity: number
}

interface ConfirmationLocationState {
  payment: PaymentResult
  eventId: number
  eventTitle: string
  lines: CartLine[]
  total: number
}

const priceFormatter = new Intl.NumberFormat('fr-FR')
const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as ConfirmationLocationState | null

  // Cet écran n'a de sens qu'en sortie du tunnel de paiement — pas d'accès direct.
  if (!state) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-sm text-gray-500">Aucune confirmation à afficher.</p>
        <Link
          to="/evenements"
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
        >
          Parcourir les événements
        </Link>
      </div>
    )
  }

  const { payment, eventTitle, lines, total } = state

  if (payment.success) {
    return (
      <div className="mx-auto max-w-xl animate-fade-in-up px-6 pb-16 pt-9 text-center md:pt-16">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-[#139B60]">
          <svg
            width="44"
            height="44"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 text-2xl font-extrabold md:text-[28px]">
          <span className="text-ink-950">Paiement</span> <span className="text-[#139B60]">réussi !</span>
        </h1>
        <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-[#5B7088]">
          Votre billet a été confirmé. Vous allez recevoir un email et un SMS avec votre billet.
        </p>

        <div className="mt-7 flex flex-col items-center gap-3 md:flex-row md:justify-center">
          <button
            onClick={() =>
              navigate('/billets', { state: { tickets: payment.tickets, orderId: payment.orderId } })
            }
            className="w-full rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:w-auto md:px-8"
          >
            Voir mon billet
          </button>
          <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-gray-700">
            Retour à l'accueil
          </Link>
        </div>

        <h2 className="mt-10 text-left text-base font-extrabold text-ink-950">Détails de la commande</h2>
        <div className="mt-3 rounded-2xl bg-[#F4F6FD] p-5 text-left">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#4F3DE8"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9Z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-sm font-extrabold text-ink-950">{eventTitle}</div>
              <div className="mt-2 space-y-1">
                {lines.map((line) => (
                  <div key={line.ticketTypeId} className="flex justify-between text-sm">
                    <span className="font-semibold text-ink-950">
                      {line.quantity} × {ticketTypeLabel(line.name)}
                    </span>
                    <span className="text-[#5B7088]">
                      {priceFormatter.format(line.priceGNF * line.quantity)} GNF
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 space-y-1.5 border-t border-[#E5E9F7] pt-4 text-xs text-gray-500">
            <div>N° commande : CMD-{payment.orderId}</div>
            {/* Le backend ne renvoie pas d'horodatage sur la réponse de paiement :
                on affiche l'heure réelle de cette confirmation, pas une valeur inventée. */}
            <div>Date : {dateFormatter.format(new Date())}</div>
            <div className="pt-1 text-sm font-extrabold text-ink-950">
              Total : {priceFormatter.format(total)} GNF
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl animate-fade-in-up px-6 pb-16 pt-9 text-center md:pt-16">
      <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-red-600">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ffffff"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </div>

      <h1 className="mt-6 text-2xl font-extrabold md:text-[28px]">
        <span className="text-ink-950">Paiement</span> <span className="text-red-600">échoué</span>
      </h1>
      <p className="mx-auto mt-2.5 max-w-sm text-sm leading-relaxed text-[#5B7088]">
        {payment.reason ?? "Le paiement a été refusé. Aucun montant n'a été débité."}
      </p>

      <div className="mt-7 flex flex-col items-center gap-3 md:flex-row md:justify-center">
        <button
          onClick={() =>
            navigate('/paiement', { state: { eventId: state.eventId, eventTitle, lines, total } })
          }
          className="w-full rounded-2xl bg-primary-600 py-3.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg md:w-auto md:px-8"
        >
          Réessayer le paiement
        </button>
        <Link to="/" className="text-sm font-semibold text-gray-500 hover:text-gray-700">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}