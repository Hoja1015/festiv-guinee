import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface OrganizerTicketType {
  id: number
  eventId: number
  name: 'STANDARD' | 'VIP' | 'VVIP'
  description: string | null
  priceGNF: number
  totalQuantity: number
  remainingQuantity: number
}

export interface OrganizerEvent {
  id: number
  organizerId: number
  title: string
  description: string
  imageUrl: string | null
  category: string
  venue: string
  city: string
  date: string
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  createdAt: string
  updatedAt: string
  ticketTypes: OrganizerTicketType[]
}

export function useMyEvents() {
  return useQuery({
    queryKey: ['events', 'mine'],
    queryFn: () => api.get<{ events: OrganizerEvent[] }>('/events/mine').then((r) => r.events),
  })
}

export interface EventStats {
  sold: number
  totalCapacity: number
  revenueGNF: number
  fillRate: number
  byType: { name: OrganizerTicketType['name']; sold: number; percent: number }[]
}

// Tout est calculé à partir de totalQuantity/remainingQuantity réels —
// aucun chiffre n'est stocké ou inventé côté frontend.
export function computeEventStats(event: OrganizerEvent): EventStats {
  let sold = 0
  let totalCapacity = 0
  let revenueGNF = 0

  const raw = event.ticketTypes.map((tt) => {
    const ttSold = tt.totalQuantity - tt.remainingQuantity
    sold += ttSold
    totalCapacity += tt.totalQuantity
    revenueGNF += ttSold * tt.priceGNF
    return { name: tt.name, sold: ttSold }
  })

  const byType = raw.map((t) => ({
    ...t,
    percent: sold > 0 ? Math.round((t.sold / sold) * 100) : 0,
  }))

  return {
    sold,
    totalCapacity,
    revenueGNF,
    fillRate: totalCapacity > 0 ? Math.round((sold / totalCapacity) * 100) : 0,
    byType,
  }
}