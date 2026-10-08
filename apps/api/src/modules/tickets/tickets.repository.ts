import { prisma } from '../../lib/prisma.js'
import type { Prisma } from '@prisma/client'

// Billet + acheteur : tout ce qu'il faut pour la liste des participants.
const participantInclude = {
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
} satisfies Prisma.TicketInclude

// Tri alphabétique sur le nom de l'acheteur, puis sur l'id du billet : sans ce
// second critère, deux billets du même acheteur pourraient passer d'une page à
// l'autre ou apparaître deux fois quand on change de page.
const participantOrder: Prisma.TicketOrderByWithRelationInput[] = [
  { orderItem: { order: { customer: { fullName: 'asc' } } } },
  { id: 'asc' },
]

function participantsWhere(eventId: number, q?: string): Prisma.TicketWhereInput {
  const where: Prisma.TicketWhereInput = { eventId }
  if (q) {
    where.orderItem = {
      order: {
        customer: {
          OR: [{ fullName: { contains: q } }, { email: { contains: q } }],
        },
      },
    }
  }
  return where
}

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

  // Une page de participants d'un événement, avec recherche optionnelle sur le
  // nom ou l'email de l'acheteur, et le total correspondant à la recherche.
  async findParticipantsPage(eventId: number, q: string | undefined, skip: number, take: number) {
    const where = participantsWhere(eventId, q)

    const [tickets, total] = await prisma.$transaction([
      prisma.ticket.findMany({
        where,
        include: participantInclude,
        orderBy: participantOrder,
        skip,
        take,
      }),
      prisma.ticket.count({ where }),
    ])

    return { tickets, total }
  },

  // Tous les billets vendus pour un événement, sans pagination : sert à
  // l'export CSV de secours de l'organisateur (si le scan QR ne marche pas).
  findAllParticipants(eventId: number) {
    return prisma.ticket.findMany({
      where: { eventId },
      include: participantInclude,
      orderBy: participantOrder,
    })
  },
}