import { prisma } from '../../lib/prisma.js'
import { ticketsRepository } from '../tickets/tickets.repository.js'
import { generateTicketToken, hashToken, encryptToken, decryptToken } from '../../lib/tokens.js'
import { NotFoundError, ForbiddenError } from '../../shared/errors.js'

export const ticketsService = {
  // Appelée uniquement depuis payments.service.ts, juste après qu'une
  // commande soit passée PAID. Génère autant de Ticket que d'unités achetées.
  // On récupère nous-mêmes les orderItems + leur ticketType (pour l'eventId),
  // plutôt que de faire confiance à des données passées en paramètre.
  async generateForOrder(orderId: number) {
    const orderItems = await prisma.orderItem.findMany({
      where: { orderId },
      include: { ticketType: true },
    })

    const ticketsToCreate: {
      orderItemId: number
      eventId: number
      tokenHash: string
      tokenEncrypted: string
    }[] = []

    // On garde les tokens en clair en mémoire (jamais en base) pour pouvoir
    // les renvoyer une seule fois au client, juste après la génération.
    const plainTokensByOrderItem = new Map<number, string[]>()

    for (const item of orderItems) {
      const tokensForThisItem: string[] = []

      for (let i = 0; i < item.quantity; i++) {
        const token = generateTicketToken()
        tokensForThisItem.push(token)

        ticketsToCreate.push({
          orderItemId: item.id,
          eventId: item.ticketType.eventId,
          tokenHash: hashToken(token),
          tokenEncrypted: encryptToken(token),
        })
      }

      plainTokensByOrderItem.set(item.id, tokensForThisItem)
    }

    await ticketsRepository.createMany(ticketsToCreate)

    return plainTokensByOrderItem
  },

  async listMine(customerId: number) {
    return ticketsRepository.findMineByCustomer(customerId)
  },

  // Retourne le token en clair (déchiffré) d'un billet précis, pour
  // régénérer son QR code à la demande — après vérification de propriété.
  async getPlainToken(ticketId: number, customerId: number) {
    const ticket = await ticketsRepository.findById(ticketId)

    if (!ticket) {
      throw new NotFoundError('Billet')
    }

    if (ticket.orderItem.order.customerId !== customerId) {
      throw new ForbiddenError('Vous n\'êtes pas propriétaire de ce billet')
    }

    return decryptToken(ticket.tokenEncrypted)
  },

  // Liste des acheteurs d'un événement, triée par nom — filet de sécurité
  // papier/CSV si le scan QR est indisponible. L'appelant (events.service)
  // est responsable de vérifier que l'organisateur possède bien l'événement.
  async listForEvent(eventId: number) {
    const tickets = await ticketsRepository.findByEvent(eventId)

    return tickets.map((t) => ({
      ticketId: t.id,
      status: t.status,
      customerName: t.orderItem.order.customer.fullName,
      customerEmail: t.orderItem.order.customer.email,
      ticketType: t.orderItem.ticketType.name,
    }))
  },
}