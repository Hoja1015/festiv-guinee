import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'

export type ScanResultName = 'VALID' | 'ALREADY_USED' | 'INVALID' | 'WRONG_EVENT' | 'CANCELLED'

export interface EventAttendance {
  eventId: number
  title: string
  date: string
  status: 'DRAFT' | 'PUBLISHED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  issued: number
  checkedIn: number
  remaining: number
  cancelled: number
  scans: {
    valid: number
    alreadyUsed: number
    invalid: number
    wrongEvent: number
    cancelled: number
  }
}

export interface RecentScan {
  id: number
  ticketId: number
  result: ScanResultName
  scannedAt: string
  eventTitle: string
  agentName: string
}

export interface AttendanceData {
  events: EventAttendance[]
  recentScans: RecentScan[]
}

export function useMyAttendance() {
  return useQuery({
    queryKey: ['attendance', 'mine'],
    queryFn: () => api.get<AttendanceData>('/attendance/mine'),
  })
}