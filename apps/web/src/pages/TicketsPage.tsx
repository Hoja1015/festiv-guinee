import { Link } from 'react-router-dom'
import { useMyTickets } from '../hooks/useTickets'
import { formatGNF, formatEventDate } from '../lib/format'
import { ThemeToggle } from '../components/ThemeToggle'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const statusLabel: Record<string, string> = {
  VALID: 'Valide',
  USED: 'Utilisé',
  CANCELLED: 'Annulé',
}

const statusColor: Record<string, string> = {
  VALID: 'text-success bg-success/10',
  USED: 'text-muted bg-ink/5',
  CANCELLED: 'text-accent-2 bg-accent-2/10',
}

export function TicketsPage() {
  const { data: tickets, isLoading } = useMyTickets()

  return (
    <div className="min-h-screen bg-bg">
      <header className="p-4 flex justify-between items-center border-b border-ink/10">
        <Link to="/" className="font-display text-xl font-semibold text-ink">
          Festiv'Guinée 🎟️
        </Link>
        <ThemeToggle />
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl font-semibold text-ink mb-10">Mes billets</h1>

        {isLoading && <p className="text-muted">Chargement…</p>}
        {tickets && tickets.length === 0 && (
          <p className="text-muted">Vous n'avez pas encore de billet.</p>
        )}

        <div className="space-y-6">
          {tickets?.map((ticket) => (
            <div
              key={ticket.id}
              className="flex flex-col sm:flex-row rounded-xl border border-ink/10 bg-surface overflow-hidden"
            >
              <div className="sm:w-40 flex items-center justify-center gradient-brand p-6 shrink-0">
                <img
                  src={`${API_URL}/tickets/${ticket.id}/qrcode`}
                  alt="QR code du billet"
                  className="w-28 h-28 rounded-lg bg-white p-1.5"
                />
              </div>

              <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-lg font-semibold text-ink">
                      {ticket.event.title}
                    </p>
                    <p className="text-sm text-muted mt-1">
                      {formatEventDate(ticket.event.date)}
                    </p>
                    <p className="text-sm text-muted">
                      {ticket.event.venue}, {ticket.event.city}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${statusColor[ticket.status]}`}>
                    {statusLabel[ticket.status]}
                  </span>
                </div>
                <p className="text-sm text-ink/80 mt-3">
                  {ticket.orderItem.ticketType.name} · {formatGNF(ticket.orderItem.ticketType.priceGNF)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}