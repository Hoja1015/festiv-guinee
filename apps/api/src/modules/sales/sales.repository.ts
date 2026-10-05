import { prisma } from '../../lib/prisma.js'

export const salesRepository = {
  // Tous les événements de l'organisateur (y compris ceux sans vente).
  findEvents(organizerId: number) {
    return prisma.event.findMany({
      where: { organizerId },
      select: { id: true, title: true, date: true, status: true },
      orderBy: { date: 'desc' },
    })
  },

  // Lignes de commandes PAYÉES uniquement : les commandes en attente ou
  // annulées ne sont pas des ventes.
  findPaidItems(organizerId: number) {
    return prisma.orderItem.findMany({
      where: {
        order: { status: 'PAID' },
        ticketType: { event: { organizerId } },
      },
      select: {
        quantity: true,
        unitPriceGNF: true,
        order: {
          select: { id: true, createdAt: true, customer: { select: { fullName: true } } },
        },
        ticketType: { select: { name: true, eventId: true } },
      },
    })
  },
}