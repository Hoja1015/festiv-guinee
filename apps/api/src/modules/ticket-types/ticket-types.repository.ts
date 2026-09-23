import { prisma } from '../../lib/prisma.js'
import type { CreateTicketTypeInput, UpdateTicketTypeInput } from './ticket-types.schema.ts'

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

  create(eventId: number, data: CreateTicketTypeInput) {
    return prisma.ticketType.create({
      data: {
        ...data,
        eventId,
        // À la création, la quantité restante = la quantité totale.
        // Elle ne diminuera qu'au moment des achats (Phase 6).
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
}