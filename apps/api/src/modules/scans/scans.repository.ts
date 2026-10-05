import { prisma } from '../../lib/prisma.js'
import type { ScanResult } from '@prisma/client'

export const scansRepository = {
  // Vérifie qu'un agent est bien affecté à cet événement (table EventStaff).
  findStaffAssignment(userId: number, eventId: number) {
    return prisma.eventStaff.findUnique({
      where: { userId_eventId: { userId, eventId } },
    })
  },

  // Inclut le type de billet et le nom de l'acheteur : l'agent les affiche à
  // l'écran après le scan (pas besoin d'un second appel).
  findTicketByTokenHash(tokenHash: string) {
    return prisma.ticket.findUnique({
      where: { token: tokenHash },
      include: {
        orderItem: {
          include: {
            ticketType: true,
            order: { include: { customer: { select: { fullName: true } } } },
          },
        },
      },
    })
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

  // Premier scan réussi d'un billet : sert à afficher "scanné à HH:mm" quand
  // quelqu'un le présente une seconde fois.
  findFirstValidScan(ticketId: number) {
    return prisma.scan.findFirst({
      where: { ticketId, result: 'VALID' },
      orderBy: { scannedAt: 'asc' },
    })
  },

  // Événements auxquels l'agent est affecté et pour lesquels un scan a du
  // sens (publiés ou en cours — pas de brouillon, d'événement terminé ni
  // annulé).
  listAssignedEvents(userId: number) {
    return prisma.eventStaff.findMany({
      where: { userId, event: { status: { in: ['PUBLISHED', 'ONGOING'] } } },
      include: { event: true },
      orderBy: { event: { date: 'asc' } },
    })
  },
}