import { prisma } from '../lib/prisma.js'
import { ConflictError, NotFoundError } from '../shared/errors.js'
import type { CreateOrderInput } from './orders.schema.ts'

export const ordersRepository = {
  findById(id: number) {
    return prisma.order.findUnique({
      where: { id },
      include: { orderItems: true, payments: true },
    })
  },

  findByCustomer(customerId: number) {
    return prisma.order.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: { orderItems: true, payments: true },
    })
  },

  // Crée la commande ET décrémente le stock, le tout dans UNE SEULE transaction
  // atomique : soit tout réussit, soit tout est annulé automatiquement
  // (aucune vente partielle, aucun stock décrémenté "pour rien" si un item échoue).
  async createWithItems(customerId: number, items: CreateOrderInput['items']) {
    return prisma.$transaction(async (tx) => {
      let totalAmountGNF = 0
      const orderItemsData: {
        ticketTypeId: number
        quantity: number
        unitPriceGNF: number
      }[] = []

      for (const item of items) {
        // On lit le prix ACTUEL du type de billet À L'INTÉRIEUR de la
        // transaction, pour figer le bon prix au moment précis de l'achat.
        const ticketType = await tx.ticketType.findUnique({
          where: { id: item.ticketTypeId },
        })

        if (!ticketType) {
          throw new NotFoundError(`Type de billet #${item.ticketTypeId}`)
        }

        // Décrémentation ATOMIQUE : la condition remainingQuantity >= quantity
        // est vérifiée par MySQL lui-même au moment de l'UPDATE, pas par notre
        // code JS avant — c'est ce qui empêche la survente en cas de concurrence.
        const result = await tx.ticketType.updateMany({
          where: {
            id: item.ticketTypeId,
            remainingQuantity: { gte: item.quantity },
          },
          data: {
            remainingQuantity: { decrement: item.quantity },
          },
        })

        if (result.count === 0) {
          // Soit plus assez de stock au départ, soit un autre achat concurrent
          // vient de prendre les dernières places entre notre lecture et cet UPDATE.
          throw new ConflictError(
            `Stock insuffisant pour le type de billet "${ticketType.name}"`
          )
        }

        orderItemsData.push({
          ticketTypeId: item.ticketTypeId,
          quantity: item.quantity,
          unitPriceGNF: ticketType.priceGNF,
        })
        totalAmountGNF += ticketType.priceGNF * item.quantity
      }

      return tx.order.create({
        data: {
          customerId,
          totalAmountGNF,
          status: 'PENDING',
          orderItems: { create: orderItemsData },
        },
        include: { orderItems: true },
      })
    })
  },
}