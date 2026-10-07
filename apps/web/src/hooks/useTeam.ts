import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

export interface StaffMember {
  assignmentId: number
  userId: number
  fullName: string
  email: string
}

export interface TeamEvent {
  id: number
  title: string
  date: string
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  staff: StaffMember[]
}

export function useMyTeam() {
  return useQuery({
    queryKey: ['team', 'mine'],
    queryFn: () => api.get<{ events: TeamEvent[] }>('/team/mine').then((r) => r.events),
  })
}

export function useAssignStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: { eventId: number; email: string }) =>
      api.post<{ staff: { userId: number; fullName: string; email: string } }>('/team', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', 'mine'] }),
  })
}

export function useRemoveStaff() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (assignmentId: number) => api.delete<void>(`/team/${assignmentId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team', 'mine'] }),
  })
}