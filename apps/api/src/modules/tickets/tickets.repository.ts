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

  // Tous les billets vendus pour un événement, avec l'acheteur — pour la
  // liste de secours de l'organisateur (si le scan QR ne marche pas).
  // Tri alphabétique fait directement en base, sur le nom de l'acheteur.
  findByEvent(eventId: number) {
    return prisma.ticket.findMany({
      where: { eventId },
      include: {
        orderItem: {
          include: {
            ticketType: true,
            order: {
              include: {
                customer: { select: { id: true, fullName: true, email: true } },
              },
            },
          },
        },
      },
      orderBy: {
        orderItem: { order: { customer: { fullName: 'asc' } } },
      },
    })
  },
}