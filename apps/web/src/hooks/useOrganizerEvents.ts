import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { EventSales } from './useSales'

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

// Sans `sales`, les chiffres viennent du stock (total - restant), qui compte
// aussi les réservations non payées. Avec `sales` (données de /sales/mine,
// commandes PAYÉES uniquement), les ventes et revenus sont ceux de la page
// Ventes : c'est la source de vérité à privilégier. La capacité vient
// toujours des types de billets.
export function computeEventStats(event: OrganizerEvent, sales?: EventSales): EventStats {
  const totalCapacity = event.ticketTypes.reduce((sum, tt) => sum + tt.totalQuantity, 0)

  let sold = 0
  let revenueGNF = 0
  let raw: { name: OrganizerTicketType['name']; sold: number }[]

  if (sales) {
    sold = sales.ticketsSold
    revenueGNF = sales.revenueGNF
    raw = sales.byType.map((t) => ({ name: t.name, sold: t.sold }))
  } else {
    raw = event.ticketTypes.map((tt) => {
      const ttSold = tt.totalQuantity - tt.remainingQuantity
      sold += ttSold
      revenueGNF += ttSold * tt.priceGNF
      return { name: tt.name, sold: ttSold }
    })
  }

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