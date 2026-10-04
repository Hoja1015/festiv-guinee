import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface MyTicket {
  id: number
  status: 'VALID' | 'USED' | 'CANCELLED'
  createdAt: string
  orderItem: {
    id: number
    ticketType: {
      id: number
      name: 'STANDARD' | 'VIP' | 'VVIP'
      priceGNF: number
    }
  }
  event: {
    id: number
    title: string
    description: string
    imageUrl: string | null
    category: string
    venue: string
    city: string
    date: string
  }
}

export function useMyTickets() {
  return useQuery({
    queryKey: ['tickets', 'mine'],
    queryFn: () => api.get<{ tickets: MyTicket[] }>('/tickets/mine').then((r) => r.tickets),
  })
}