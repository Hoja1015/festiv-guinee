import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { PageMeta } from './useEvents'

export interface Participant {
  ticketId: number
  status: 'VALID' | 'USED' | 'CANCELLED'
  customerName: string
  customerEmail: string
  ticketType: 'STANDARD' | 'VIP' | 'VVIP'
}

export interface ParticipantsFilters {
  page?: number
  pageSize?: number
  q?: string
}

interface ParticipantsResponse {
  participants: Participant[]
  pagination: PageMeta
}

// Une page de participants, déjà triée par ordre alphabétique côté base.
// La recherche (nom ou email) et le découpage en pages se font côté API.
export function useEventParticipants(eventId: number | undefined, filters: ParticipantsFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize))
  if (filters.q) params.set('q', filters.q)
  const query = params.toString()

  return useQuery({
    queryKey: ['events', eventId, 'participants', filters],
    queryFn: () =>
      api.get<ParticipantsResponse>(`/events/${eventId}/participants${query ? `?${query}` : ''}`),
    enabled: eventId !== undefined,
    // Garde la page précédente affichée pendant le chargement de la suivante.
    placeholderData: keepPreviousData,
  })
}

// Liste complète, sans pagination : réservée au téléchargement CSV de secours.
export function fetchAllParticipants(eventId: number): Promise<Participant[]> {
  return api
    .get<{ participants: Participant[] }>(`/events/${eventId}/participants/export`)
    .then((r) => r.participants)
}