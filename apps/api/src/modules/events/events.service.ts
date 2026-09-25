import { eventsRepository } from './events.repository.js'
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors.js'
import { prisma } from '../../lib/prisma.js'
import type { CreateEventInput, UpdateEventInput } from './events.schema.js'

export const eventsService = {
  listPublished() {
    return eventsRepository.findPublished()
  },

  listMine(organizerId: number) {
    return eventsRepository.findByOrganizer(organizerId)
  },

  async getById(id: number) {
    const event = await eventsRepository.findById(id)
    if (!event) {
      throw new NotFoundError('Événement')
    }
    return event
  },

  create(organizerId: number, input: CreateEventInput) {
    return eventsRepository.create(organizerId, input)
  },

  async assertOwnership(eventId: number, organizerId: number) {
    const event = await eventsRepository.findById(eventId)

    if (!event) {
      throw new NotFoundError('Événement')
    }

    if (event.organizerId !== organizerId) {
      throw new ForbiddenError('Vous n\'êtes pas propriétaire de cet événement')
    }

    return event
  },

  async update(eventId: number, organizerId: number, input: UpdateEventInput) {
    await this.assertOwnership(eventId, organizerId)
    return eventsRepository.update(eventId, input)
  },

  async publish(eventId: number, organizerId: number) {
    const event = await this.assertOwnership(eventId, organizerId)

    if (event.status !== 'DRAFT') {
      throw new ValidationError('Seul un événement en brouillon peut être publié')
    }

    return eventsRepository.updateStatus(eventId, 'PUBLISHED')
  },

  async cancel(eventId: number, organizerId: number) {
    await this.assertOwnership(eventId, organizerId)
    return eventsRepository.updateStatus(eventId, 'CANCELLED')
  },

  async assignStaff(eventId: number, organizerId: number, staffUserId: number) {
    await this.assertOwnership(eventId, organizerId)

    // Vérifie que l'utilisateur qu'on affecte a bien le rôle STAFF —
    // évite d'affecter par erreur un CUSTOMER ou un autre ORGANIZER.
    const user = await prisma.user.findUnique({ where: { id: staffUserId } })
    if (!user) {
      throw new NotFoundError('Utilisateur')
    }
    if (user.role !== 'STAFF') {
      throw new ValidationError('Cet utilisateur n\'a pas le rôle STAFF')
    }

    return eventsRepository.assignStaff(eventId, staffUserId)
  },

  listStaff(eventId: number) {
    return eventsRepository.listStaff(eventId)
  },
}