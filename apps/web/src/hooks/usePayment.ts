import { useMutation } from '@tanstack/react-query'
import { api } from '../lib/api'

type PaymentResult = {
  success: boolean
  orderId: number
  status: 'PAID' | 'CANCELLED'
  tickets?: Record<string, string[]>
  reason?: string
}

export function usePayOrder() {
  return useMutation({
    mutationFn: (orderId: number) =>
      api.post<{ payment: PaymentResult }>(`/orders/${orderId}/pay`, {}),
  })
}