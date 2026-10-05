import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export type TicketTypeName = 'STANDARD' | 'VIP' | 'VVIP'

export interface EventSales {
  eventId: number
  title: string
  date: string
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  revenueGNF: number
  ticketsSold: number
  ordersCount: number
  byType: { name: TicketTypeName; sold: number; revenueGNF: number }[]
}

export interface RecentOrder {
  orderId: number
  createdAt: string
  customerName: string
  eventTitle: string
  totalGNF: number
  tickets: number
}

export interface SalesData {
  totals: { revenueGNF: number; ticketsSold: number; ordersCount: number }
  events: EventSales[]
  recentOrders: RecentOrder[]
}

export function useMySales() {
  return useQuery({
    queryKey: ['sales', 'mine'],
    queryFn: () => api.get<SalesData>('/sales/mine'),
  })
}