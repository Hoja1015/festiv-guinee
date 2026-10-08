import { useState } from 'react'
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout'
import { useMyEvents } from '../../hooks/useOrganizerEvents'
import {
  useEventParticipants,
  fetchAllParticipants,
  type Participant,
} from '../../hooks/Useeventparticipants'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import { ticketTypeLabel } from '../../lib/ticketType'

const PAGE_SIZE = 25

const STATUS_LABEL: Record<Participant['status'], { label: string; color: string }> = {
  VALID: { label: 'Valide', color: '#139B60' },
  USED: { label: 'Utilisé', color: '#6B7280' },
  CANCELLED: { label: 'Annulé', color: '#DC2626' },
}

function escapeCsvField(value: string): string {
  // Un nom commençant par = + - @ serait interprété comme une formule par
  // Excel : on le neutralise avec une apostrophe devant.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value
  if (safe.includes(',') || safe.includes('"') || safe.includes('\n')) {
    return `"${safe.replace(/"/g, '""')}"`
  }
  return safe
}

function downloadParticipantsCsv(eventTitle: string, participants: Participant[]) {
  const header = ['Nom', 'Email', 'Type de billet', 'Statut', 'N° billet']
  const rows = participants.map((p) => [
    p.customerName,
    p.customerEmail,
    ticketTypeLabel(p.ticketType),
    STATUS_LABEL[p.status].label,
    `#${p.ticketId}`,
  ])

  const csvContent = [header, ...rows].map((row) => row.map(escapeCsvField).join(',')).join('\n')

  // BOM pour qu'Excel affiche correctement les accents (é, à...).
  const blob = new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `participants-${eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function ParticipantsPage() {
  const { data: events, isLoading: eventsLoading } = useMyEvents()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState(false)

  const debouncedSearch = useDebouncedValue(search.trim())

  const selectedEvent = events?.find((e) => e.id === selectedId) ?? events?.[0]
  const {
    data,
    isLoading: participantsLoading,
    isError,
    isPlaceholderData,
  } = useEventParticipants(selectedEvent?.id, {
    page,
    pageSize: PAGE_SIZE,
    q: debouncedSearch || undefined,
  })

  const participants = data?.participants
  const pagination = data?.pagination
  const total = pagination?.total ?? 0

  function changeEvent(id: number) {
    setSelectedId(id)
    setPage(1)
  }

  function changeSearch(value: string) {
    setSearch(value)
    setPage(1)
  }

  async function handleExport() {
    if (!selectedEvent) return
    setExporting(true)
    setExportError(false)
    try {
      // Le CSV contient tous les acheteurs, pas seulement la page affichée.
      const all = await fetchAllParticipants(selectedEvent.id)
      downloadParticipantsCsv(selectedEvent.title, all)
    } catch {
      setExportError(true)
    } finally {
      setExporting(false)
    }
  }

  return (
    <OrganizerLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Participants</h1>

          {selectedEvent && events && (
            <select
              value={selectedEvent.id}
              onChange={(e) => changeEvent(Number(e.target.value))}
              aria-label="Choisir un événement"
              className="mt-3 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-ink-950 focus:border-primary-600 focus:outline-none"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedEvent && pagination && (total > 0 || debouncedSearch !== '') && (
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            {exporting ? 'Préparation...' : 'Télécharger tout (CSV)'}
          </button>
        )}
      </div>

      {exportError && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Impossible de préparer le fichier. Réessaie dans un instant.
        </p>
      )}

      {eventsLoading && <p className="mt-6 text-sm text-gray-600">Chargement...</p>}

      {!eventsLoading && (!events || events.length === 0) && (
        <p className="mt-6 text-sm text-gray-600">Tu n'as pas encore créé d'événement.</p>
      )}

      {selectedEvent && (
        <>
          <div className="mt-5">
            <input
              type="search"
              value={search}
              onChange={(e) => changeSearch(e.target.value)}
              placeholder="Rechercher par nom ou email..."
              aria-label="Rechercher un participant par nom ou email"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-ink-950 placeholder:text-gray-500 focus:border-primary-600 focus:outline-none md:max-w-sm"
            />
          </div>

          {participantsLoading && (
            <p className="mt-6 text-sm text-gray-600">Chargement des participants...</p>
          )}

          {isError && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              Impossible de charger la liste des participants.
            </p>
          )}

          {!participantsLoading && !isError && participants && pagination && (
            <>
              <p className="mt-4 text-sm text-gray-600">
                {debouncedSearch
                  ? `${total} résultat${total > 1 ? 's' : ''} pour « ${debouncedSearch} »`
                  : `${total} billet${total > 1 ? 's' : ''} vendu${total > 1 ? 's' : ''}`}{' '}
                — trié{total > 1 ? 's' : ''} par ordre alphabétique. Le fichier CSV contient la liste
                complète : à garder sous la main si le scan QR est indisponible.
              </p>

              {participants.length === 0 ? (
                <p className="mt-6 text-sm text-gray-600">
                  {debouncedSearch
                    ? 'Aucun participant ne correspond à ta recherche.'
                    : 'Aucun billet vendu pour cet événement pour le moment.'}
                </p>
              ) : (
                <div
                  className={`mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white transition-opacity ${
                    isPlaceholderData ? 'opacity-60' : ''
                  }`}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-[11px] font-bold uppercase tracking-wide text-gray-600">
                        <th className="px-4 py-3">Nom</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Type de billet</th>
                        <th className="px-4 py-3">Statut</th>
                        <th className="px-4 py-3">N° billet</th>
                      </tr>
                    </thead>
                    <tbody>
                      {participants.map((p) => (
                        <tr key={p.ticketId} className="border-b border-gray-50 last:border-0">
                          <td className="px-4 py-3 font-bold text-ink-950">{p.customerName}</td>
                          <td className="px-4 py-3 text-gray-600">{p.customerEmail}</td>
                          <td className="px-4 py-3 font-semibold text-ink-950">{ticketTypeLabel(p.ticketType)}</td>
                          <td className="px-4 py-3">
                            <span
                              className="font-semibold"
                              style={{ color: STATUS_LABEL[p.status].color }}
                            >
                              ● {STATUS_LABEL[p.status].label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">#{p.ticketId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {pagination.totalPages > 1 && (
                <nav
                  aria-label="Pagination des participants"
                  className="mt-6 flex items-center justify-center gap-4"
                >
                  <button
                    type="button"
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="rounded-full bg-gray-100 px-5 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Précédent
                  </button>
                  <span className="text-sm font-semibold text-gray-600">
                    Page {pagination.page} sur {pagination.totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Suivant
                  </button>
                </nav>
              )}
            </>
          )}
        </>
      )}
    </OrganizerLayout>
  )
}