import { paymentsRepository } from '../payments/payments.repository.js'
import { ordersRepository } from '../../orders/orders.repository.js'
import { ticketsService } from '../tickets/tickets.service.js'
import { MockPaymentProvider } from '../payments/providers/mock-payment-provider.js'
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors.js'

export const paymentsService = {
  async pay(orderId: number, customerId: number, forceFail = false) {
    const order = await ordersRepository.findById(orderId)

    if (!order) {
      throw new NotFoundError('Commande')
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenError('Vous n\'êtes pas propriétaire de cette commande')
    }

    if (order.status !== 'PENDING') {
      throw new ValidationError(`Cette commande ne peut pas être payée (statut actuel : ${order.status})`)
    }

    const payment = await paymentsRepository.create(orderId, order.totalAmountGNF)

    const provider = new MockPaymentProvider(forceFail)
    const result = await provider.charge({ amountGNF: order.totalAmountGNF, orderId })

    if (result.success) {
      await paymentsRepository.markOrderPaid(orderId, payment.id, result.providerReference)

      // Génération des billets UNIQUEMENT après confirmation du paiement —
      // jamais avant, pour ne jamais émettre de billet non payé.
      const tokensByOrderItem = await ticketsService.generateForOrder(orderId)

      // On transforme la Map en objet simple pour la réponse JSON
      // (JSON ne sait pas sérialiser une Map nativement).
      const tickets = Object.fromEntries(tokensByOrderItem)

      return { success: true, orderId, status: 'PAID' as const, tickets }
    }

    await paymentsRepository.markOrderFailed(orderId, payment.id, result.failureReason ?? 'Échec du paiement')
    return { success: false, orderId, status: 'CANCELLED' as const, reason: result.failureReason }
  },
}