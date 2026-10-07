import { useState } from 'react'
import { Link } from 'react-router-dom'
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout'
import { useMyEvents, computeEventStats } from '../../hooks/useOrganizerEvents'
import { useMySales } from '../../hooks/useSales'
import { ticketTypeLabel } from '../../lib/ticketType'

const numberFormatter = new Intl.NumberFormat('fr-FR')

const DONUT_COLOR: Record<'STANDARD' | 'VIP' | 'VVIP', string> = {
  STANDARD: '#94A3C4',
  VIP: '#FBBF24',
  VVIP: '#4F3DE8',
}

export function OrganizerDashboardPage() {
  const eventsQuery = useMyEvents()
  const salesQuery = useMySales()
  const events = eventsQuery.data
  const isLoading = eventsQuery.isLoading || salesQuery.isLoading
  const isError = eventsQuery.isError || salesQuery.isError
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const selectedEvent = events?.find((e) => e.id === selectedId) ?? events?.[0]
  // Ventes et revenus : commandes payées uniquement, comme la page Ventes.
  const selectedSales = salesQuery.data?.events.find((e) => e.eventId === selectedEvent?.id)
  const stats = selectedEvent ? computeEventStats(selectedEvent, selectedSales) : null

  // Construit le dégradé conique du donut à partir des vraies parts par type —
  // rien n'est codé en dur, l'ordre et les pourcentages viennent de `stats`.
  let cumulative = 0
  const gradientStops = stats
    ? stats.byType
        .filter((t) => t.sold > 0)
        .map((t) => {
          const start = cumulative
          cumulative += t.percent
          return `${DONUT_COLOR[t.name]} ${start}% ${cumulative}%`
        })
    : []
  const donutBackground = gradientStops.length > 0 ? `conic-gradient(${gradientStops.join(', ')})` : '#E5E7EB'

  return (
    <OrganizerLayout>
      <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Tableau de bord</h1>

      {isLoading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}

      {isError && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Impossible de charger tes événements pour le moment.
        </p>
      )}

      {!isLoading && !isError && (!events || events.length === 0) && (
        <div className="mt-10 flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-gray-500">Tu n'as pas encore créé d'événement.</p>
          <Link
            to="/organisateur/evenements"
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            Créer un événement
          </Link>
        </div>
      )}

      {selectedEvent && stats && events && (
        <>
          <div className="mt-5">
            <select
              value={selectedEvent.id}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="rounded-xl border border-gray-200 bg-white py-2.5 px-4 text-sm font-bold text-ink-950 focus:border-primary-600 focus:outline-none"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#EDE9FE]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4F3DE8" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.5a1.5 1.5 0 0 0 0 3V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.5a1.5 1.5 0 0 0 0-3V9Z" />
                </svg>
              </div>
              <div className="mt-3.5 text-[13px] font-semibold text-gray-500">Billets vendus</div>
              <div className="mt-1 text-2xl font-extrabold text-ink-950">{numberFormatter.format(stats.sold)}</div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#FEF3C7]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#B45309" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v10M9 9.5a2.5 2.5 0 0 1 2.5-1.5h1a2 2 0 1 1 0 4h-1a2 2 0 1 0 0 4h1a2.5 2.5 0 0 0 2.5-1.5" />
                </svg>
              </div>
              <div className="mt-3.5 text-[13px] font-semibold text-gray-500">Revenus</div>
              <div className="mt-1 text-2xl font-extrabold text-ink-950">
                {numberFormatter.format(stats.revenueGNF)} GNF
              </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#DCFCE7]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#139B60" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18" />
                  <rect x="7" y="12" width="3" height="6" />
                  <rect x="12" y="8" width="3" height="10" />
                  <rect x="17" y="5" width="3" height="13" />
                </svg>
              </div>
              <div className="mt-3.5 text-[13px] font-semibold text-gray-500">Taux de remplissage</div>
              <div className="mt-1 text-2xl font-extrabold text-ink-950">{stats.fillRate} %</div>
            </div>
          </div>

          <div className="mt-6 max-w-md rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="text-[15px] font-extrabold text-ink-950">Répartition des billets</h2>
            {stats.sold === 0 ? (
              <p className="mt-3 text-sm text-gray-500">Aucun billet vendu pour le moment.</p>
            ) : (
              <div className="mt-4 flex items-center gap-6">
                <div className="relative h-28 w-28 flex-shrink-0 rounded-full" style={{ background: donutBackground }}>
                  <div className="absolute inset-3.5 flex flex-col items-center justify-center rounded-full bg-white">
                    <div className="text-lg font-extrabold text-ink-950">{numberFormatter.format(stats.sold)}</div>
                    <div className="text-[10px] text-gray-400">vendus</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 text-[13px]">
                  {stats.byType
                    .filter((t) => t.sold > 0)
                    .map((t) => (
                      <div key={t.name} className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: DONUT_COLOR[t.name] }} />
                        {ticketTypeLabel(t.name)}
                        <span className="ml-auto text-gray-400">{t.percent} %</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </OrganizerLayout>
  )
}