import { prisma } from '../../lib/prisma.js'

export const ticketsRepository = {
  createMany(
    tickets: {
      orderItemId: number
      eventId: number
      tokenHash: string
      tokenEncrypted: string
    }[]
  ) {
    return prisma.ticket.createMany({
      data: tickets.map((t) => ({
        orderItemId: t.orderItemId,
        eventId: t.eventId,
        token: t.tokenHash, // rappel : ce champ contient le HASH, pas le token en clair
        tokenEncrypted: t.tokenEncrypted,
      })),
    })
  },

  // Tous les billets appartenant à un client, via la chaîne
  // Ticket → OrderItem → Order → customerId.
  findMineByCustomer(customerId: number) {
    return prisma.ticket.findMany({
      where: { orderItem: { order: { customerId } } },
      include: {
        orderItem: { include: { ticketType: true } },
        event: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  findById(id: number) {
    return prisma.ticket.findUnique({
      where: { id },
      include: {
        orderItem: { include: { order: true, ticketType: true } },
        event: true,
      },
    })
  },

  findByTokenHash(tokenHash: string) {
    return prisma.ticket.findUnique({ where: { token: tokenHash } })
  },
}