import { Link } from 'react-router-dom'
import { usePublishedEvents } from '../hooks/useEvents'
import { formatEventDate } from '../lib/format'
import { ThemeToggle } from '../components/ThemeToggle'
import { useAuth } from '../contexts/AuthContext'

export function EventsPage() {
  const { data: events, isLoading, error } = usePublishedEvents()
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-bg">
      <header className="p-4 flex justify-between items-center border-b border-ink/10">
        <Link to="/" className="font-display text-xl font-semibold text-ink">
          Festiv'Guinée 🎟️
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <ThemeToggle />
          {user ? (
            <>
              {user.role === 'ORGANIZER' && (
                <Link to="/dashboard" className="text-muted hover:text-ink">Mon espace</Link>
              )}
              <button onClick={() => logout()} className="text-muted hover:text-ink">
                Déconnexion
              </button>
            </>
          ) : (
            <Link to="/login" className="text-accent font-medium">Se connecter</Link>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-display text-4xl md:text-5xl font-semibold text-ink mb-2">
          Les prochains événements
        </h1>
        <p className="text-muted mb-10">Festivals et concerts partout en Guinée.</p>

        {isLoading && <p className="text-muted">Chargement des événements…</p>}
        {error && <p className="text-accent-2">Impossible de charger les événements.</p>}

        {events && events.length === 0 && (
          <p className="text-muted">Aucun événement publié pour le moment.</p>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events?.map((event) => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className="group block rounded-xl overflow-hidden border border-ink/10 bg-surface
                         hover:border-accent/50 transition-colors"
            >
              <div className="gradient-brand h-32 flex items-end p-4 relative overflow-hidden">
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
                <span className="text-white text-sm font-medium relative">{event.category}</span>
              </div>
              <div className="p-5">
                <h2 className="font-display text-xl font-semibold text-ink group-hover:text-accent transition-colors">
                  {event.title}
                </h2>
                <p className="text-sm text-muted mt-1">{formatEventDate(event.date)}</p>
                <p className="text-sm text-muted">{event.venue}, {event.city}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}