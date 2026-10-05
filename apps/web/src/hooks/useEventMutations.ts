import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { OrganizerEvent } from './useOrganizerEvents'

export interface CreateEventPayload {
  title: string
  description: string
  imageUrl?: string
  category: string
  venue: string
  city: string
  // ISO 8601 (ex: "2026-12-31T20:00:00.000Z")
  date: string
  ticketTypes: {
    name: 'STANDARD' | 'VIP' | 'VVIP'
    description?: string
    priceGNF: number
    totalQuantity: number
  }[]
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateEventPayload) =>
      api.post<{ event: OrganizerEvent }>('/events', payload).then((r) => r.event),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', 'mine'] }),
  })
}

// Modification d'un brouillon : champs de l'événement + liste complète des
// types de billets (remplacée côté serveur).
export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateEventPayload }) =>
      api.patch<{ event: OrganizerEvent }>(`/events/${id}`, payload).then((r) => r.event),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events', 'mine'] }),
  })
}

export function usePublishEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (eventId: number) =>
      api.post<{ event: OrganizerEvent }>(`/events/${eventId}/publish`).then((r) => r.event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events', 'mine'] })
      // La liste publique (accueil / événements) doit aussi voir l'événement publié.
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}