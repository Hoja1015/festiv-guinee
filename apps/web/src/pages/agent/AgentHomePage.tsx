import { Link } from 'react-router-dom'
import { AgentLayout } from '../../components/agent/AgentLayout'
import { useAgentEvents } from '../../hooks/useScan'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })

export function AgentHomePage() {
  const { data: events, isLoading, isError } = useAgentEvents()

  return (
    <AgentLayout>
      <h1 className="text-xl font-extrabold">Choisis ton événement</h1>
      <p className="mt-1.5 text-sm text-ink-300">Les événements auxquels tu es affecté.</p>

      {isLoading && <p className="mt-8 text-sm text-ink-300">Chargement...</p>}

      {isError && (
        <p className="mt-8 rounded-xl bg-red-500/15 px-4 py-3 text-sm text-red-300">
          Impossible de charger tes événements pour le moment.
        </p>
      )}

      {!isLoading && !isError && events && events.length === 0 && (
        <p className="mt-8 text-sm text-ink-300">
          Aucun événement ne t'est affecté pour le moment. Demande à l'organisateur de t'affecter à un
          événement publié.
        </p>
      )}

      {events && events.length > 0 && (
        <ul className="mt-6 flex flex-col gap-3">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                to={`/agent/scan/${event.id}`}
                className="block rounded-2xl bg-white/5 p-4 transition hover:bg-white/10"
              >
                <h2 className="text-base font-extrabold">{event.title}</h2>
                <p className="mt-1 text-sm text-ink-300">
                  {dateFormatter.format(new Date(event.date))}
                </p>
                <p className="text-sm text-ink-300">
                  {event.venue}, {event.city}
                </p>
                <span className="mt-3 inline-block rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold">
                  Scanner les billets
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AgentLayout>
  )
}