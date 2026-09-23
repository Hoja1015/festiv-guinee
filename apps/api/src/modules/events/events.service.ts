import { eventsRepository } from './events.repository.js'
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors.js'
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

  // Vérifie que l'événement existe ET appartient bien à cet organisateur.
  // Réutilisée par update() et publish() ci-dessous — on ne veut pas
  // dupliquer cette vérification de sécurité à chaque méthode.
  async assertOwnership(eventId: number, organizerId: number) {
    const event = await eventsRepository.findById(eventId)

    if (!event) {
      throw new NotFoundError('Événement')
    }

    if (event.organizerId !== organizerId) {
      // On renvoie la même erreur générique que "n'existe pas" serait trop
      // (ici un vrai 403 est acceptable, contrairement au login) : ça confirme
      // au moins que l'événement existe, ce qui est un moindre risque que
      // pour des identifiants de connexion.
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
}