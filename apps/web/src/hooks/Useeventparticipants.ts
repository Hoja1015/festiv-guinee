import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface Participant {
  ticketId: number
  status: 'VALID' | 'USED' | 'CANCELLED'
  customerName: string
  customerEmail: string
  ticketType: 'STANDARD' | 'VIP' | 'VVIP'
}

// Déjà triée par ordre alphabétique côté base (voir tickets.repository.ts
// findByEvent) — pas besoin de re-trier ici.
export function useEventParticipants(eventId: number | undefined) {
  return useQuery({
    queryKey: ['events', eventId, 'participants'],
    queryFn: () =>
      api.get<{ participants: Participant[] }>(`/events/${eventId}/participants`).then((r) => r.participants),
    enabled: eventId !== undefined,
  })
}