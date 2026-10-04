import { Link } from 'react-router-dom'
import { CalendarIcon, PinIcon } from './icons'
import type { PublishedEvent } from '../hooks/useEvents'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

export function EventCard({ event, delay = 0 }: { event: PublishedEvent; delay?: number }) {
  return (
    <div
      className="group animate-fade-in-up overflow-hidden rounded-2xl border border-gray-100 shadow-sm shadow-ink-950/5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-ink-950/10"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="overflow-hidden">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="h-36 w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-36 items-center justify-center bg-gradient-to-br from-primary-600 via-primary-400 to-accent-400 px-4 text-center text-sm font-semibold text-white/85 transition-transform duration-300 group-hover:scale-105">
            {event.title}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-[17px] font-extrabold text-ink-950">{event.title}</h3>
        <p className="mt-0.5 text-[13px] text-gray-400">{event.category}</p>

        <div className="mt-3 flex flex-wrap gap-3.5 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <CalendarIcon className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
            {dateFormatter.format(new Date(event.date))}
          </span>
          <span className="flex items-center gap-1.5">
            <PinIcon className="h-3.5 w-3.5 text-gray-400" strokeWidth={2} />
            {event.venue}
          </span>
        </div>

        <Link
          to={`/events/${event.id}`}
          className="mt-4 block rounded-xl bg-primary-600 py-3 text-center text-sm font-bold text-white transition-all duration-200 hover:bg-primary-700 active:scale-[0.98]"
        >
          Voir les détails
        </Link>
      </div>
    </div>
  )
}