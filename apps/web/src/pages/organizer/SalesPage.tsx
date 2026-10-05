import { Link } from 'react-router-dom'
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout'
import { useMySales } from '../../hooks/useSales'
import { ticketTypeLabel } from '../../lib/ticketType'

const numberFormatter = new Intl.NumberFormat('fr-FR')
const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})
const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="text-[13px] font-semibold text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-extrabold text-ink-950">{value}</div>
    </div>
  )
}

export function SalesPage() {
  const { data, isLoading, isError } = useMySales()

  return (
    <OrganizerLayout>
      <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Ventes</h1>
      <p className="mt-1.5 text-sm text-gray-500">
        Calculées à partir des commandes payées uniquement.
      </p>

      {isLoading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}

      {isError && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Impossible de charger les ventes pour le moment.
        </p>
      )}

      {data && (
        <>
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <Stat label="Revenus" value={`${numberFormatter.format(data.totals.revenueGNF)} GNF`} />
            <Stat label="Billets vendus" value={numberFormatter.format(data.totals.ticketsSold)} />
            <Stat label="Commandes payées" value={numberFormatter.format(data.totals.ordersCount)} />
          </div>

          {data.events.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-gray-500">Tu n'as pas encore créé d'événement.</p>
              <Link
                to="/organisateur/evenements/nouveau"
                className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
              >
                Créer un événement
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mt-8 text-base font-extrabold text-ink-950">Par événement</h2>
              <div className="mt-3 space-y-4">
                {data.events.map((event) => (
                  <div key={event.eventId} className="rounded-2xl border border-gray-100 bg-white p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="text-[15px] font-extrabold text-ink-950">{event.title}</div>
                        <div className="text-xs text-gray-400">{dateFormatter.format(new Date(event.date))}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-extrabold text-ink-950">
                          {numberFormatter.format(event.revenueGNF)} GNF
                        </div>
                        <div className="text-xs text-gray-400">
                          {numberFormatter.format(event.ticketsSold)} billet{event.ticketsSold > 1 ? 's' : ''} ·{' '}
                          {numberFormatter.format(event.ordersCount)} commande{event.ordersCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {event.byType.length === 0 ? (
                      <p className="mt-3 text-sm text-gray-400">Aucune vente pour le moment.</p>
                    ) : (
                      <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
                        {event.byType.map((t) => (
                          <div key={t.name} className="flex items-center justify-between py-2.5 text-sm">
                            <span className="font-semibold text-ink-950">{ticketTypeLabel(t.name)}</span>
                            <span className="text-gray-500">
                              {numberFormatter.format(t.sold)} × · {numberFormatter.format(t.revenueGNF)} GNF
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <h2 className="mt-8 text-base font-extrabold text-ink-950">Dernières commandes payées</h2>
              {data.recentOrders.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">Aucune commande payée pour le moment.</p>
              ) : (
                <div className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
                  {data.recentOrders.map((order) => (
                    <div key={order.orderId} className="flex items-center justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-ink-950">{order.customerName}</div>
                        <div className="truncate text-xs text-gray-400">
                          CMD-{order.orderId} · {order.eventTitle} ·{' '}
                          {dateTimeFormatter.format(new Date(order.createdAt))}
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <div className="text-sm font-extrabold text-ink-950">
                          {numberFormatter.format(order.totalGNF)} GNF
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.tickets} billet{order.tickets > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </OrganizerLayout>
  )
}