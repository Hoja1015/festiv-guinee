import { ordersRepository } from '../orders/orders.repository.js'
import { NotFoundError, ForbiddenError } from '../shared/errors.js'
import type { CreateOrderInput } from '../orders/orders.schema.js'

export const ordersService = {
  create(customerId: number, input: CreateOrderInput) {
    // Toute la logique délicate (transaction, anti-survente) vit dans le
    // repository — le service reste simple, il orchestre juste l'appel.
    return ordersRepository.createWithItems(customerId, input.items)
  },

  listMine(customerId: number) {
    return ordersRepository.findByCustomer(customerId)
  },

  async getById(orderId: number, customerId: number) {
    const order = await ordersRepository.findById(orderId)

    if (!order) {
      throw new NotFoundError('Commande')
    }

    // Un client ne peut consulter que ses propres commandes — même logique
    // de propriété que assertOwnership() pour les événements.
    if (order.customerId !== customerId) {
      throw new ForbiddenError('Vous n\'êtes pas propriétaire de cette commande')
    }

    return order
  },
}