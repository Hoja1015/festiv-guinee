import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export type Ticket = {
  id: number
  status: 'VALID' | 'USED' | 'CANCELLED'
  createdAt: string
  event: { id: number; title: string; venue: string; city: string; date: string }
  orderItem: { ticketType: { name: string; priceGNF: number } }
}

export function useMyTickets() {
  return useQuery({
    queryKey: ['tickets', 'mine'],
    queryFn: () => api.get<{ tickets: Ticket[] }>('/tickets/mine'),
    select: (data) => data.tickets,
  })
}