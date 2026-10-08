import { keepPreviousData, useQuery } from '@tanstack/react-query'
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

export interface PageMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface PublishedEventsFilters {
  page?: number
  pageSize?: number
  q?: string
  category?: string
  city?: string
}

interface PublishedEventsResponse {
  events: PublishedEvent[]
  categories: string[]
  pagination: PageMeta
}

// Liste publique paginée : le filtrage et le découpage en pages se font côté API.
export function usePublishedEvents(filters: PublishedEventsFilters = {}) {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  if (filters.pageSize) params.set('pageSize', String(filters.pageSize))
  if (filters.q) params.set('q', filters.q)
  if (filters.category) params.set('category', filters.category)
  if (filters.city) params.set('city', filters.city)
  const query = params.toString()

  return useQuery({
    queryKey: ['events', 'published', filters],
    queryFn: () => api.get<PublishedEventsResponse>(`/events${query ? `?${query}` : ''}`),
    // Garde la page précédente affichée pendant le chargement de la suivante.
    placeholderData: keepPreviousData,
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