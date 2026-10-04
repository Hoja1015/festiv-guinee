import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { PastHighlightEvent } from '../lib/api'

export interface TicketType {
  id: number
  name: 'STANDARD' | 'VIP' | 'VVIP'
  description: string | null
  priceGNF: number
  totalQuantity: number
  remainingQuantity: number
}

export interface PublishedEvent {
  id: number
  title: string
  description: string
  imageUrl: string | null
  category: string
  venue: string
  city: string
  date: string
  status: string
  ticketTypes: TicketType[]
}

export function usePublishedEvents() {
  return useQuery({
    queryKey: ['events', 'published'],
    queryFn: () => api.get<{ events: PublishedEvent[] }>('/events'),
    select: (data) => data.events,
  })
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', 'detail', id],
    queryFn: () => api.get<{ event: PublishedEvent }>(`/events/${id}`),
    select: (data) => data.event,
    enabled: id !== undefined,
    retry: false,
  })
}

export function usePastHighlights(limit = 6) {
  return useQuery({
    queryKey: ['events', 'highlights', limit],
    queryFn: () =>
      api.get<{ events: PastHighlightEvent[] }>(`/events/highlights?limit=${limit}`),
    select: (data) => data.events,
  })
}