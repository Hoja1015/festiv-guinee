import { ticketTypesRepository } from './ticket-types.repository.js'
import { eventsService } from '../events/events.service.js'
import { NotFoundError, ValidationError } from '../../shared/errors.js'
import type { CreateTicketTypeInput, UpdateTicketTypeInput } from './ticket-types.schema.ts'

export const ticketTypesService = {
  listByEvent(eventId: number) {
    return ticketTypesRepository.findByEvent(eventId)
  },

  async create(eventId: number, organizerId: number, input: CreateTicketTypeInput) {
    // Vérifie que l'événement existe ET appartient à cet organisateur —
    // réutilise la logique déjà écrite dans events.service.ts, pas de duplication.
    await eventsService.assertOwnership(eventId, organizerId)

    return ticketTypesRepository.create(eventId, input)
  },

  async update(
    ticketTypeId: number,
    eventId: number,
    organizerId: number,
    input: UpdateTicketTypeInput
  ) {
    await eventsService.assertOwnership(eventId, organizerId)

    const ticketType = await ticketTypesRepository.findById(ticketTypeId)
    if (!ticketType || ticketType.eventId !== eventId) {
      throw new NotFoundError('Type de billet')
    }

    // Si on modifie totalQuantity, il faut ajuster remainingQuantity en
    // conséquence, sinon on casse la cohérence du stock si des billets ont
    // déjà été vendus (remainingQuantity ne doit jamais dépasser totalQuantity).
    if (input.totalQuantity !== undefined) {
      const alreadySold = ticketType.totalQuantity - ticketType.remainingQuantity
      if (input.totalQuantity < alreadySold) {
        throw new ValidationError(
          `Impossible de réduire la quantité en dessous de ${alreadySold} (déjà vendus)`
        )
      }
      const newRemaining = input.totalQuantity - alreadySold
      return ticketTypesRepository.update(ticketTypeId, {
        ...input,
        remainingQuantity: newRemaining,
      } as UpdateTicketTypeInput & { remainingQuantity: number })
    }

    return ticketTypesRepository.update(ticketTypeId, input)
  },
}