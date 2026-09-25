import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { Event } from '../types/event'

export function usePublishedEvents() {
  return useQuery({
    queryKey: ['events', 'published'],
    queryFn: () => api.get<{ events: Event[] }>('/events'),
    select: (data) => data.events,
  })
}

export function useEvent(id: number) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => api.get<{ event: Event }>(`/events/${id}`),
    select: (data) => data.event,
  })
}