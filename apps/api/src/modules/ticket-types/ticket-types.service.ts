import { ticketTypesRepository } from './ticket-types.repository.js'
import { eventsService } from '../events/events.service.js'
import { NotFoundError, ValidationError } from '../../shared/errors.js'
import type { CreateTicketTypeInput, UpdateTicketTypeInput } from './ticket-types.schema.js'

export const ticketTypesService = {
  listByEvent(eventId: number) {
    return ticketTypesRepository.findByEvent(eventId)
  },

  async create(eventId: number, organizerId: number, input: CreateTicketTypeInput) {
    // Vérifie que l'événement existe ET appartient à cet organisateur —
    // réutilise la logique déjà écrite dans events.service.ts, pas de duplication.
    await eventsService.assertOwnership(eventId, organizerId)

    if (await ticketTypesRepository.findByEventAndName(eventId, input.name)) {
      throw new ValidationError(`Cet événement a déjà un billet ${input.name}`)
    }

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

    if (input.name && input.name !== ticketType.name) {
      if (await ticketTypesRepository.findByEventAndName(eventId, input.name)) {
        throw new ValidationError(`Cet événement a déjà un billet ${input.name}`)
      }
    }

    // Modifier la quantité totale déplace aussi la quantité restante du même
    // écart, de façon atomique : jamais de stock négatif, même si des
    // achats ont lieu pendant la modification.
    if (input.totalQuantity !== undefined) {
      const delta = input.totalQuantity - ticketType.totalQuantity
      const updated = await ticketTypesRepository.updateWithQuantity(
        ticketTypeId,
        { ...input, totalQuantity: input.totalQuantity },
        delta
      )
      if (updated === 0) {
        throw new ValidationError(
          'Impossible de réduire la quantité en dessous du nombre de billets déjà vendus ou réservés'
        )
      }
      return ticketTypesRepository.findById(ticketTypeId)
    }

    return ticketTypesRepository.update(ticketTypeId, input)
  },
}