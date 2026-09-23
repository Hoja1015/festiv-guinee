import { prisma } from '../../lib/prisma.js'
import type { PaymentStatus } from '@prisma/client'

export const paymentsRepository = {
  create(orderId: number, amountGNF: number) {
    return prisma.payment.create({
      data: {
        orderId,
        provider: 'MOCK',
        status: 'PENDING',
        amountGNF,
      },
    })
  },

  updateStatus(paymentId: number, status: PaymentStatus, providerReference?: string) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: { status, providerReference },
    })
  },

  // Marque la commande PAID et le paiement SUCCESS ensemble, atomiquement.
  async markOrderPaid(orderId: number, paymentId: number, providerReference: string) {
    return prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'SUCCESS', providerReference },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'PAID' },
      }),
    ])
  },

  // En cas d'échec : le paiement passe FAILED, la commande passe CANCELLED,
  // et on restitue le stock réservé à la création de la commande — sinon
  // ces places resteraient bloquées indéfiniment alors que personne ne les a payées.
  async markOrderFailed(orderId: number, paymentId: number, failureReason: string) {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { orderItems: true },
    })

    return prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'FAILED', providerReference: failureReason },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'CANCELLED' },
      }),
      ...order.orderItems.map((item) =>
        prisma.ticketType.update({
          where: { id: item.ticketTypeId },
          data: { remainingQuantity: { increment: item.quantity } },
        })
      ),
    ])
  },
}