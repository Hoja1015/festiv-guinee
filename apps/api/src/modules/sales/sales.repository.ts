import { prisma } from '../../lib/prisma.js'
import type { Prisma } from '@prisma/client'

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

  // Une page de commandes payées contenant au moins un billet de cet
  // organisateur, de la plus récente à la plus ancienne. Seules les lignes de
  // SES événements sont chargées : une commande peut aussi contenir les
  // billets d'un autre organisateur, qui ne doivent ni apparaître ni compter.
  async findPaidOrdersPage(organizerId: number, skip: number, take: number) {
    const ownItems: Prisma.OrderItemWhereInput = { ticketType: { event: { organizerId } } }
    const where: Prisma.OrderWhereInput = {
      status: 'PAID',
      orderItems: { some: ownItems },
    }

    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        // L'id en second critère garde un ordre stable entre deux pages.
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take,
        select: {
          id: true,
          createdAt: true,
          customer: { select: { fullName: true } },
          orderItems: {
            where: ownItems,
            select: {
              quantity: true,
              unitPriceGNF: true,
              ticketType: { select: { event: { select: { title: true } } } },
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ])

    return { orders, total }
  },
}