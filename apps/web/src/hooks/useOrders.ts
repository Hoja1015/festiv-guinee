import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'

type OrderItemInput = { ticketTypeId: number; quantity: number }

type Order = {
  id: number
  customerId: number
  status: string
  totalAmountGNF: number
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (items: OrderItemInput[]) =>
      api.post<{ order: Order }>('/orders', { items }),
  })
}