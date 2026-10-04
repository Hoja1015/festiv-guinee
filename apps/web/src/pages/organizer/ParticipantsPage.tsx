import { useState } from 'react'
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout'
import { useMyEvents } from '../../hooks/useOrganizerEvents'
import { useEventParticipants, type Participant } from '../../hooks/Useeventparticipants'
import { ticketTypeLabel } from '../../lib/ticketType'

const STATUS_LABEL: Record<Participant['status'], { label: string; color: string }> = {
  VALID: { label: 'Valide', color: '#139B60' },
  USED: { label: 'Utilisé', color: '#9CA3AF' },
  CANCELLED: { label: 'Annulé', color: '#DC2626' },
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
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

  const selectedEvent = events?.find((e) => e.id === selectedId) ?? events?.[0]
  const { data: participants, isLoading: participantsLoading, isError } = useEventParticipants(
    selectedEvent?.id
  )

  return (
    <OrganizerLayout>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Participants</h1>

          {selectedEvent && events && (
            <select
              value={selectedEvent.id}
              onChange={(e) => setSelectedId(Number(e.target.value))}
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

        {selectedEvent && participants && participants.length > 0 && (
          <button
            onClick={() => downloadParticipantsCsv(selectedEvent.title, participants)}
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-primary-700"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
            </svg>
            Télécharger (CSV)
          </button>
        )}
      </div>

      {eventsLoading && <p className="mt-6 text-sm text-gray-500">Chargement...</p>}

      {!eventsLoading && (!events || events.length === 0) && (
        <p className="mt-6 text-sm text-gray-500">Tu n'as pas encore créé d'événement.</p>
      )}

      {selectedEvent && (
        <>
          {participantsLoading && <p className="mt-6 text-sm text-gray-500">Chargement des participants...</p>}

          {isError && (
            <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              Impossible de charger la liste des participants.
            </p>
          )}

          {!participantsLoading && !isError && participants && (
            <>
              <p className="mt-5 text-sm text-gray-500">
                {participants.length} acheteur{participants.length > 1 ? 's' : ''} — trié{participants.length > 1 ? 's' : ''} par ordre alphabétique. À garder sous la main si le scan QR est indisponible.
              </p>

              {participants.length === 0 ? (
                <p className="mt-6 text-sm text-gray-500">Aucun billet vendu pour cet événement pour le moment.</p>
              ) : (
                <div className="mt-4 overflow-x-auto rounded-2xl border border-gray-100 bg-white">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-[11px] font-bold uppercase tracking-wide text-gray-500">
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
                          <td className="px-4 py-3 text-gray-500">{p.customerEmail}</td>
                          <td className="px-4 py-3 font-semibold text-ink-950">{ticketTypeLabel(p.ticketType)}</td>
                          <td className="px-4 py-3">
                            <span
                              className="font-semibold"
                              style={{ color: STATUS_LABEL[p.status].color }}
                            >
                              ● {STATUS_LABEL[p.status].label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-400">#{p.ticketId}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </>
      )}
    </OrganizerLayout>
  )
}