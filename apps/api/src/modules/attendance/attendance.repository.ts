import { prisma } from '../../lib/prisma.js'

export const attendanceRepository = {
  findEvents(organizerId: number) {
    return prisma.event.findMany({
      where: { organizerId },
      select: { id: true, title: true, date: true, status: true },
      orderBy: { date: 'desc' },
    })
  },

  // Nombre de billets par événement et par statut (VALID / USED / CANCELLED).
  countTicketsByStatus(organizerId: number) {
    return prisma.ticket.groupBy({
      by: ['eventId', 'status'],
      where: { event: { organizerId } },
      _count: { _all: true },
    })
  },

  // Nombre de scans par événement et par résultat.
  countScansByResult(organizerId: number) {
    return prisma.scan.groupBy({
      by: ['eventId', 'result'],
      where: { event: { organizerId } },
      _count: { _all: true },
    })
  },

  findRecentScans(organizerId: number, take: number) {
    return prisma.scan.findMany({
      where: { event: { organizerId } },
      orderBy: { scannedAt: 'desc' },
      take,
      select: {
        id: true,
        ticketId: true,
        result: true,
        scannedAt: true,
        event: { select: { title: true } },
        agent: { select: { fullName: true } },
      },
    })
  },
}