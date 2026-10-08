import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import type { PageMeta } from './useEvents'

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

interface PaidOrdersResponse {
  orders: RecentOrder[]
  pagination: PageMeta
}

// Historique complet des commandes payées, une page à la fois.
export function useMyPaidOrders(page: number, pageSize = 20) {
  return useQuery({
    queryKey: ['sales', 'orders', { page, pageSize }],
    queryFn: () => api.get<PaidOrdersResponse>(`/sales/orders?page=${page}&pageSize=${pageSize}`),
    // Garde la page précédente affichée pendant le chargement de la suivante.
    placeholderData: keepPreviousData,
  })
}