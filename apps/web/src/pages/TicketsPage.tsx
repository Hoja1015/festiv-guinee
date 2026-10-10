import { Link } from 'react-router-dom'
import { useMyTickets, type MyTicket } from '../hooks/useTickets'
import { useCurrentUser } from '../hooks/useAuth'
import { getTicketQrCodeUrl } from '../lib/api'
import { ticketTypeLabel } from '../lib/ticketType'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const STATUS_STYLE: Record<MyTicket['status'], { label: string; dot: string; text: string; bg: string; border: string }> = {
  VALID: { label: 'VALIDE', dot: '#3DDC97', text: '#3DDC97', bg: 'rgba(19,155,96,0.18)', border: '#139B60' },
  USED: { label: 'UTILISÉ', dot: '#D1D5DB', text: '#D1D5DB', bg: 'rgba(156,163,175,0.16)', border: '#6B7280' },
  CANCELLED: { label: 'ANNULÉ', dot: '#FCA5A5', text: '#FCA5A5', bg: 'rgba(220,38,38,0.18)', border: '#DC2626' },
}

function TicketCardSkeleton() {
  return (
    <div className="animate-shimmer overflow-hidden rounded-[22px] bg-gray-100" style={{ aspectRatio: '390/720' }} />
  )
}

function TicketCard({ ticket, holderName, delay }: { ticket: MyTicket; holderName: string; delay: number }) {
  const status = STATUS_STYLE[ticket.status]
  const { event, orderItem } = ticket

  return (
    <div
      className="animate-fade-in-up relative overflow-hidden rounded-[22px] bg-ink-950"
      style={{ animationDelay: `${delay}ms` }}
    >
      {event.imageUrl ? (
        <img src={event.imageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-primary-700 to-primary-600" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,6,24,0.55), rgba(10,6,24,0.75) 45%, #0A0618 92%)',
        }}
      />

      <div className="relative p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-extrabold tracking-[1.5px] text-ink-300">BILLET ÉLECTRONIQUE</span>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold"
            style={{ background: status.bg, border: `1px solid ${status.border}`, color: status.text }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: status.dot }} />
            {status.label}
          </span>
        </div>

        <h2 className="mt-2.5 text-xl font-extrabold leading-tight text-white md:text-[22px]">{event.title}</h2>
        <p className="mt-1 text-[13px] text-ink-300">{event.category}</p>

        <div className="mt-4 flex items-center justify-center rounded-2xl bg-white p-5">
          <img
            src={getTicketQrCodeUrl(ticket.id)}
            alt={`QR code du billet #${ticket.id}`}
            width={160}
            height={160}
            className="h-40 w-40"
          />
        </div>

        <div className="mt-4 border-t border-white/10 pt-1 text-sm text-white">
          <div className="flex gap-2.5 py-2">
            <span className="w-[72px] flex-shrink-0 text-ink-300">Nom</span>
            <span className="min-w-0 break-words font-bold">{holderName}</span>
          </div>
          <div className="flex gap-2.5 py-2">
            <span className="w-[72px] flex-shrink-0 text-ink-300">Type</span>
            <span className="font-bold text-primary-400">{ticketTypeLabel(orderItem.ticketType.name)}</span>
          </div>
          <div className="flex gap-2.5 py-2">
            <span className="w-[72px] flex-shrink-0 text-ink-300">Date</span>
            <span className="font-bold text-primary-400">{dateFormatter.format(new Date(event.date))}</span>
          </div>
          <div className="flex gap-2.5 py-2">
            <span className="w-[72px] flex-shrink-0 text-ink-300">Lieu</span>
            <span className="min-w-0 break-words font-bold">
              {event.venue}, {event.city}
            </span>
          </div>
          <div className="flex gap-2.5 py-2">
            <span className="w-[72px] flex-shrink-0 text-ink-300">N° billet</span>
            <span className="font-bold text-ink-300">#{ticket.id}</span>
          </div>
        </div>

        {/* Pas d'intégration Apple/Google Wallet côté backend pour l'instant —
            bouton visible mais désactivé plutôt qu'un bouton qui ne ferait rien. */}
        <button
          disabled
          className="mt-4 w-full cursor-not-allowed rounded-2xl bg-gray-500/40 py-3 text-sm font-bold text-white/70"
        >
          Ajouter à Wallet — bientôt disponible
        </button>
      </div>
    </div>
  )
}

export function TicketsPage() {
  const { data: tickets, isLoading, isError } = useMyTickets()
  const { data: user } = useCurrentUser()

  return (
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-5 md:px-16 md:pt-10">
      <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Mes billets</h1>
      <p className="mt-1.5 text-sm text-gray-500">
        {isLoading ? 'Chargement...' : `${tickets?.length ?? 0} billet${(tickets?.length ?? 0) > 1 ? 's' : ''} trouvé${(tickets?.length ?? 0) > 1 ? 's' : ''}`}
      </p>

      {isError && (
        <p className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Impossible de charger tes billets pour le moment.
        </p>
      )}

      {isLoading && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <TicketCardSkeleton />
          <TicketCardSkeleton />
        </div>
      )}

      {!isLoading && !isError && tickets?.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-500">Tu n'as pas encore de billet.</p>
          <Link
            to="/evenements"
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            Parcourir les événements
          </Link>
        </div>
      )}

      {!isLoading && !isError && tickets && tickets.length > 0 && (
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          {tickets.map((ticket, i) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              holderName={user?.fullName ?? ''}
              delay={i * 80}
            />
          ))}
        </div>
      )}
    </div>
  )
}