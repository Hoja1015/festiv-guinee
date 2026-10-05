import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export type ScanResultCode = 'VALID' | 'ALREADY_USED' | 'INVALID' | 'WRONG_EVENT' | 'CANCELLED'

export interface ScanResponse {
  result: ScanResultCode
  // Absent pour INVALID et WRONG_EVENT (rien à montrer à l'agent).
  ticket?: {
    id: number
    ticketType: 'STANDARD' | 'VIP' | 'VVIP'
    holderName: string
  }
  // Heure du premier scan réussi, pour ALREADY_USED (peut manquer en cas de
  // double scan simultané).
  usedAt?: string
}

export interface AgentEvent {
  id: number
  title: string
  imageUrl: string | null
  venue: string
  city: string
  date: string
  status: 'PUBLISHED' | 'ONGOING'
}

export function useAgentEvents() {
  return useQuery({
    queryKey: ['scans', 'my-events'],
    queryFn: () => api.get<{ events: AgentEvent[] }>('/scans/my-events').then((r) => r.events),
  })
}

export function useScanTicket() {
  return useMutation({
    mutationFn: (input: { eventId: number; token: string }) => api.post<ScanResponse>('/scans', input),
  })
}