import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface CreateOrderItemInput {
  ticketTypeId: number
  quantity: number
}

export interface OrderItem {
  id: number
  orderId: number
  ticketTypeId: number
  quantity: number
  unitPriceGNF: number
}

export interface Order {
  id: number
  customerId: number
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  totalAmountGNF: number
  orderItems: OrderItem[]
}

export interface PaymentResult {
  success: boolean
  orderId: number
  status: 'PAID' | 'CANCELLED'
  tickets?: Record<string, string[]>
  reason?: string
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (items: CreateOrderItemInput[]) =>
      api.post<{ order: Order }>('/orders', { items }),
  })
}

export function usePayOrder() {
  return useMutation({
    mutationFn: ({ orderId, forceFail }: { orderId: number; forceFail?: boolean }) =>
      api.post<{ payment: PaymentResult }>(`/orders/${orderId}/pay`, { forceFail }),
  })
}