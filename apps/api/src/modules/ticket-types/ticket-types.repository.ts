import { prisma } from '../../lib/prisma.js'
import type { CreateTicketTypeInput, UpdateTicketTypeInput } from './ticket-types.schema.js'

export const ticketTypesRepository = {
  findByEvent(eventId: number) {
    return prisma.ticketType.findMany({
      where: { eventId },
      orderBy: { priceGNF: 'asc' },
    })
  },

  findById(id: number) {
    return prisma.ticketType.findUnique({ where: { id } })
  },

  // Sert à refuser deux types de même nom (STANDARD, VIP...) sur un événement.
  findByEventAndName(eventId: number, name: CreateTicketTypeInput['name']) {
    return prisma.ticketType.findFirst({ where: { eventId, name } })
  },

  create(eventId: number, data: CreateTicketTypeInput) {
    return prisma.ticketType.create({
      data: {
        ...data,
        eventId,
        // À la création, la quantité restante = la quantité totale.
        // Elle ne diminuera qu'au moment des achats.
        remainingQuantity: data.totalQuantity,
      },
    })
  },

  update(id: number, data: UpdateTicketTypeInput) {
    return prisma.ticketType.update({
      where: { id },
      data,
    })
  },

  // Change la quantité totale de façon atomique : `remainingQuantity` bouge du
  // même écart (delta) et la condition `gte: -delta` garantit qu'il ne
  // descend jamais sous zéro, même si des achats arrivent en même temps.
  // Retourne le nombre de lignes modifiées (0 = réduction refusée).
  async updateWithQuantity(
    id: number,
    data: UpdateTicketTypeInput & { totalQuantity: number },
    delta: number
  ) {
    const result = await prisma.ticketType.updateMany({
      where: { id, remainingQuantity: { gte: -delta } },
      data: { ...data, remainingQuantity: { increment: delta } },
    })
    return result.count
  },
}