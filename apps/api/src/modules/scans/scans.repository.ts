import { prisma } from '../../lib/prisma.js'
import type { ScanResult } from '@prisma/client'

export const scansRepository = {
  // Vérifie qu'un agent est bien affecté à cet événement (table EventStaff).
  findStaffAssignment(userId: number, eventId: number) {
    return prisma.eventStaff.findUnique({
      where: { userId_eventId: { userId, eventId } },
    })
  },

  findTicketByTokenHash(tokenHash: string) {
    return prisma.ticket.findUnique({ where: { token: tokenHash } })
  },

  // Décrémentation atomique du statut, EXACTEMENT le même principe que pour
  // le stock en Phase 6 : la condition status = 'VALID' est vérifiée par
  // MySQL au moment même de l'UPDATE, pas par notre code avant — impossible
  // que deux scans simultanés valident tous les deux le même billet.
  async markUsedIfValid(ticketId: number) {
    const result = await prisma.ticket.updateMany({
      where: { id: ticketId, status: 'VALID' },
      data: { status: 'USED' },
    })
    return result.count > 0
  },

  createScan(data: { ticketId: number; eventId: number; agentId: number; result: ScanResult }) {
    return prisma.scan.create({ data })
  },
}