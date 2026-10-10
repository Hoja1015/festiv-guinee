import { Link } from 'react-router-dom'
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout'
import { useMyEvents, computeEventStats, type OrganizerEvent } from '../../hooks/useOrganizerEvents'
import { usePublishEvent } from '../../hooks/useEventMutations'
import { useMySales } from '../../hooks/useSales'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })
const numberFormatter = new Intl.NumberFormat('fr-FR')

const STATUS_STYLE: Record<OrganizerEvent['status'], { label: string; color: string }> = {
  DRAFT: { label: 'Brouillon', color: '#9CA3AF' },
  PUBLISHED: { label: 'Publié', color: '#139B60' },
  ONGOING: { label: 'En cours', color: '#4F3DE8' },
  COMPLETED: { label: 'Terminé', color: '#6B7280' },
  CANCELLED: { label: 'Annulé', color: '#DC2626' },
}

export function OrganizerEventsPage() {
  const { data: events, isLoading, isError } = useMyEvents()
  const publish = usePublishEvent()
  // Billets vendus = commandes payées, comme la page Ventes et le tableau de bord.
  const { data: sales } = useMySales()

  return (
    <OrganizerLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Mes événements</h1>
        <Link
          to="/organisateur/evenements/nouveau"
          className="flex items-center justify-center rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
        >
          + Nouvel événement
        </Link>
      </div>

      {isLoading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}

      {isError && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Impossible de charger tes événements pour le moment.
        </p>
      )}

      {publish.isError && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          La publication a échoué. Réessaie dans un instant.
        </p>
      )}

      {!isLoading && !isError && events && events.length === 0 && (
        <p className="mt-8 text-sm text-gray-500">Tu n'as pas encore créé d'événement.</p>
      )}

      {events && events.length > 0 && (
        <ul className="mt-6 flex flex-col gap-4">
          {events.map((event) => {
            const status = STATUS_STYLE[event.status]
            const stats = computeEventStats(
              event,
              sales?.events.find((e) => e.eventId === event.id),
            )
            const isPublishing = publish.isPending && publish.variables === event.id

            return (
              <li
                key={event.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 md:flex-row md:items-center md:justify-between md:p-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <h2 className="break-words text-base font-extrabold text-ink-950">{event.title}</h2>
                    <span className="text-xs font-bold" style={{ color: status.color }}>
                      ● {status.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {dateFormatter.format(new Date(event.date))} · {event.venue}, {event.city}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    {numberFormatter.format(stats.sold)} / {numberFormatter.format(stats.totalCapacity)} billets vendus
                  </p>
                </div>

                {event.status === 'DRAFT' && (
                  <div className="flex w-full flex-shrink-0 gap-3 md:w-auto">
                    <Link
                      to={`/organisateur/evenements/${event.id}/modifier`}
                      className="flex-1 rounded-xl border border-gray-200 px-5 py-3 text-center text-sm font-bold text-ink-950 transition hover:bg-gray-50 md:flex-none md:py-2.5"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => publish.mutate(event.id)}
                      disabled={publish.isPending}
                      className="flex-1 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50 md:flex-none md:py-2.5"
                    >
                      {isPublishing ? 'Publication...' : 'Publier'}
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </OrganizerLayout>
  )
}