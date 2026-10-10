import { useState } from 'react'
import { Link } from 'react-router-dom'
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout'
import { useMySales, useMyPaidOrders } from '../../hooks/useSales'
import { ticketTypeLabel } from '../../lib/ticketType'

const EVENTS_STEP = 10

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

function Stat({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`rounded-2xl border border-gray-100 bg-white p-4 md:p-5 ${className}`}>
      <div className="text-[13px] font-semibold text-gray-600">{label}</div>
      <div className="mt-1 break-words text-xl font-extrabold text-ink-950 md:text-2xl">{value}</div>
    </div>
  )
}

// Historique des commandes payées, paginé côté API.
function PaidOrders() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isError, isPlaceholderData } = useMyPaidOrders(page)

  return (
    <>
      <h2 className="mt-8 text-base font-extrabold text-ink-950">Commandes payées</h2>

      {isLoading && <p className="mt-3 text-sm text-gray-600">Chargement...</p>}

      {isError && (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Impossible de charger les commandes.
        </p>
      )}

      {data && data.orders.length === 0 && (
        <p className="mt-3 text-sm text-gray-600">Aucune commande payée pour le moment.</p>
      )}

      {data && data.orders.length > 0 && (
        <>
          <div
            className={`mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white transition-opacity ${
              isPlaceholderData ? 'opacity-60' : ''
            }`}
          >
            {data.orders.map((order) => (
              <div key={order.orderId} className="flex items-center justify-between gap-3 px-4 py-3.5 md:px-5">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-ink-950">{order.customerName}</div>
                  <div className="truncate text-xs text-gray-600">{order.eventTitle}</div>
                  <div className="text-xs text-gray-600">
                    CMD-{order.orderId} · {dateTimeFormatter.format(new Date(order.createdAt))}
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-extrabold text-ink-950">
                    {numberFormatter.format(order.totalGNF)} GNF
                  </div>
                  <div className="text-xs text-gray-600">
                    {order.tickets} billet{order.tickets > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.pagination.totalPages > 1 && (
            <nav
              aria-label="Pagination des commandes"
              className="mt-5 flex items-center justify-center gap-4"
            >
              <button
                type="button"
                onClick={() => setPage(data.pagination.page - 1)}
                disabled={data.pagination.page <= 1}
                className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Précédent
              </button>
              <span className="text-sm font-semibold text-gray-600">
                Page {data.pagination.page} sur {data.pagination.totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(data.pagination.page + 1)}
                disabled={data.pagination.page >= data.pagination.totalPages}
                className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Suivant
              </button>
            </nav>
          )}
        </>
      )}
    </>
  )
}

export function SalesPage() {
  const { data, isLoading, isError } = useMySales()
  const [visibleEvents, setVisibleEvents] = useState(EVENTS_STEP)

  return (
    <OrganizerLayout>
      <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Ventes</h1>
      <p className="mt-1.5 text-sm text-gray-600">
        Calculées à partir des commandes payées uniquement.
      </p>

      {isLoading && <p className="mt-6 text-sm text-gray-600">Chargement...</p>}

      {isError && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Impossible de charger les ventes pour le moment.
        </p>
      )}

      {data && (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            <Stat
              label="Revenus"
              value={`${numberFormatter.format(data.totals.revenueGNF)} GNF`}
              className="col-span-2 md:col-span-1"
            />
            <Stat label="Billets vendus" value={numberFormatter.format(data.totals.ticketsSold)} />
            <Stat label="Commandes payées" value={numberFormatter.format(data.totals.ordersCount)} />
          </div>

          {data.events.length === 0 ? (
            <div className="mt-10 flex flex-col items-center gap-4 text-center">
              <p className="text-sm text-gray-600">Tu n'as pas encore créé d'événement.</p>
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
                {data.events.slice(0, visibleEvents).map((event) => (
                  <div key={event.eventId} className="rounded-2xl border border-gray-100 bg-white p-4 md:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="break-words text-[15px] font-extrabold text-ink-950">{event.title}</div>
                        <div className="text-xs text-gray-600">{dateFormatter.format(new Date(event.date))}</div>
                      </div>
                      <div className="w-full text-left sm:w-auto sm:text-right">
                        <div className="text-lg font-extrabold text-ink-950">
                          {numberFormatter.format(event.revenueGNF)} GNF
                        </div>
                        <div className="text-xs text-gray-600">
                          {numberFormatter.format(event.ticketsSold)} billet{event.ticketsSold > 1 ? 's' : ''} ·{' '}
                          {numberFormatter.format(event.ordersCount)} commande{event.ordersCount > 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    {event.byType.length === 0 ? (
                      <p className="mt-3 text-sm text-gray-600">Aucune vente pour le moment.</p>
                    ) : (
                      <div className="mt-4 divide-y divide-gray-100 border-t border-gray-100">
                        {event.byType.map((t) => (
                          <div key={t.name} className="flex items-center justify-between py-2.5 text-sm">
                            <span className="font-semibold text-ink-950">{ticketTypeLabel(t.name)}</span>
                            <span className="text-gray-600">
                              {numberFormatter.format(t.sold)} × · {numberFormatter.format(t.revenueGNF)} GNF
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {visibleEvents < data.events.length && (
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleEvents((n) => n + EVENTS_STEP)}
                    className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-gray-200"
                  >
                    Voir plus d'événements ({data.events.length - visibleEvents} restants)
                  </button>
                </div>
              )}

              <PaidOrders />
            </>
          )}
        </>
      )}
    </OrganizerLayout>
  )
}