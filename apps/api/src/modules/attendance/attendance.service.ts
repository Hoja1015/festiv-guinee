import { attendanceRepository } from './attendance.repository.js'

const RECENT_SCANS_LIMIT = 30

export const attendanceService = {
  async getMine(organizerId: number) {
    const [events, ticketCounts, scanCounts, recent] = await Promise.all([
      attendanceRepository.findEvents(organizerId),
      attendanceRepository.countTicketsByStatus(organizerId),
      attendanceRepository.countScansByResult(organizerId),
      attendanceRepository.findRecentScans(organizerId, RECENT_SCANS_LIMIT),
    ])

    const eventsDto = events.map((event) => {
      const tickets = ticketCounts.filter((c) => c.eventId === event.id)
      const valid = tickets.find((c) => c.status === 'VALID')?._count._all ?? 0
      const used = tickets.find((c) => c.status === 'USED')?._count._all ?? 0
      const cancelled = tickets.find((c) => c.status === 'CANCELLED')?._count._all ?? 0

      // Billets exploitables = tous sauf les annulés.
      const issued = valid + used
      const scans = scanCounts.filter((c) => c.eventId === event.id)
      const countOf = (result: string) => scans.find((c) => c.result === result)?._count._all ?? 0

      return {
        eventId: event.id,
        title: event.title,
        date: event.date,
        status: event.status,
        issued,
        checkedIn: used,
        remaining: valid,
        cancelled,
        scans: {
          valid: countOf('VALID'),
          alreadyUsed: countOf('ALREADY_USED'),
          invalid: countOf('INVALID'),
          wrongEvent: countOf('WRONG_EVENT'),
          cancelled: countOf('CANCELLED'),
        },
      }
    })

    return {
      events: eventsDto,
      recentScans: recent.map((s) => ({
        id: s.id,
        ticketId: s.ticketId,
        result: s.result,
        scannedAt: s.scannedAt,
        eventTitle: s.event.title,
        agentName: s.agent.fullName,
      })),
    }
  },
}