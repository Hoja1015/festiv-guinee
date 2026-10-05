import { Link } from 'react-router-dom'
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout'
import { useMyAttendance, type ScanResultName } from '../../hooks/useAttendance'

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

const RESULT_LABEL: Record<ScanResultName, string> = {
  VALID: 'Entrée validée',
  ALREADY_USED: 'Déjà utilisé',
  INVALID: 'Billet invalide',
  WRONG_EVENT: 'Autre événement',
  CANCELLED: 'Billet annulé',
}

const RESULT_STYLE: Record<ScanResultName, string> = {
  VALID: 'bg-[#DCFCE7] text-[#139B60]',
  ALREADY_USED: 'bg-[#FEF3C7] text-[#B45309]',
  INVALID: 'bg-red-50 text-red-600',
  WRONG_EVENT: 'bg-red-50 text-red-600',
  CANCELLED: 'bg-red-50 text-red-600',
}

export function AttendancePage() {
  const { data, isLoading, isError } = useMyAttendance()

  return (
    <OrganizerLayout>
      <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Scans et fréquentation</h1>
      <p className="mt-1.5 text-sm text-gray-500">
        Entrées enregistrées par tes agents de contrôle à l'accueil de tes événements.
      </p>

      {isLoading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}

      {isError && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Impossible de charger les scans pour le moment.
        </p>
      )}

      {data && data.events.length === 0 && (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-500">Tu n'as pas encore créé d'événement.</p>
          <Link
            to="/organisateur/evenements/nouveau"
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            Créer un événement
          </Link>
        </div>
      )}

      {data && data.events.length > 0 && (
        <>
          <h2 className="mt-8 text-base font-extrabold text-ink-950">Par événement</h2>
          <div className="mt-3 space-y-4">
            {data.events.map((event) => {
              const percent = event.issued > 0 ? Math.round((event.checkedIn / event.issued) * 100) : 0
              const refused =
                event.scans.alreadyUsed + event.scans.invalid + event.scans.wrongEvent + event.scans.cancelled

              return (
                <div key={event.eventId} className="rounded-2xl border border-gray-100 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="text-[15px] font-extrabold text-ink-950">{event.title}</div>
                      <div className="text-xs text-gray-400">{dateFormatter.format(new Date(event.date))}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-ink-950">
                        {numberFormatter.format(event.checkedIn)} / {numberFormatter.format(event.issued)}
                      </div>
                      <div className="text-xs text-gray-400">entrées / billets émis</div>
                    </div>
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-primary-600" style={{ width: `${percent}%` }} />
                  </div>
                  <div className="mt-1.5 text-xs text-gray-400">
                    {percent} % des billets sont entrés · {numberFormatter.format(event.remaining)} restant
                    {event.remaining > 1 ? 's' : ''}
                    {event.cancelled > 0 && ` · ${numberFormatter.format(event.cancelled)} annulé${event.cancelled > 1 ? 's' : ''}`}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-400">Scans validés</div>
                      <div className="font-extrabold text-[#139B60]">{numberFormatter.format(event.scans.valid)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">Scans refusés</div>
                      <div className="font-extrabold text-red-600">{numberFormatter.format(refused)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <h2 className="mt-8 text-base font-extrabold text-ink-950">Derniers scans</h2>
          {data.recentScans.length === 0 ? (
            <p className="mt-3 text-sm text-gray-500">Aucun scan enregistré pour le moment.</p>
          ) : (
            <div className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
              {data.recentScans.map((scan) => (
                <div key={scan.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-ink-950">
                      Billet #{scan.ticketId} · {scan.eventTitle}
                    </div>
                    <div className="truncate text-xs text-gray-400">
                      {scan.agentName} · {dateTimeFormatter.format(new Date(scan.scannedAt))}
                    </div>
                  </div>
                  <span
                    className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${RESULT_STYLE[scan.result]}`}
                  >
                    {RESULT_LABEL[scan.result]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </OrganizerLayout>
  )
}