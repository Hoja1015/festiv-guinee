import { eventsRepository, type PublishedFilters } from './events.repository.js'
import { ticketsService } from '../tickets/tickets.service.js'
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors.js'
import { buildPageMeta, type PageParams } from '../../shared/pagination.js'
import { prisma } from '../../lib/prisma.js'
import type { CreateEventInput, UpdateEventInput } from './events.schema.js'

export const eventsService = {
  async listPublished(filters: PublishedFilters, page: PageParams) {
    const { events, total, categories } = await eventsRepository.findPublishedPage(
      filters,
      page.skip,
      page.take,
    )
    return { events, categories, pagination: buildPageMeta(total, page) }
  },

  async listPastHighlights(limit: number) {
    const events = await eventsRepository.findPastHighlights(limit)
    return events.map((event) => ({
      id: event.id,
      title: event.title,
      imageUrl: event.imageUrl,
      category: event.category,
      venue: event.venue,
      city: event.city,
      date: event.date,
      ticketsSold: event._count.tickets,
    }))
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
    const event = await this.assertOwnership(eventId, organizerId)

    // Les types de billets ne se remplacent que sur un brouillon : une fois
    // publié, des commandes peuvent y être rattachées.
    if (input.ticketTypes && event.status !== 'DRAFT') {
      throw new ValidationError('Les billets ne sont modifiables que sur un brouillon')
    }

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

  // Acheteurs d'un événement, paginés — réservé à son organisateur.
  async listParticipants(eventId: number, organizerId: number, q: string | undefined, page: PageParams) {
    await this.assertOwnership(eventId, organizerId)
    return ticketsService.listForEvent(eventId, q, page)
  },

  // Liste complète pour l'export CSV de secours (si le scan QR ne marche pas).
  async exportParticipants(eventId: number, organizerId: number) {
    await this.assertOwnership(eventId, organizerId)
    return ticketsService.listAllForEvent(eventId)
  },
}