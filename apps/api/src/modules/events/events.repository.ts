import { prisma } from '../../lib/prisma.js'
import type { EventStatus } from '@prisma/client'
import type { CreateEventInput, UpdateEventInput } from './events.schema.js'

export const eventsRepository = {
  // Liste publique : uniquement les événements publiés, triés par date croissante
  // (les prochains événements en premier).
  findPublished() {
    return prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { date: 'asc' },
      include: { ticketTypes: true },
    })
  },

  // Liste privée : tous les événements d'un organisateur, tous statuts confondus.
  findByOrganizer(organizerId: number) {
    return prisma.event.findMany({
      where: { organizerId },
      orderBy: { createdAt: 'desc' },
      include: { ticketTypes: true },
    })
  },

  findById(id: number) {
    return prisma.event.findUnique({
      where: { id },
      include: { ticketTypes: true },
    })
  },

  create(organizerId: number, data: CreateEventInput) {
    return prisma.event.create({
      data: { ...data, organizerId },
    })
  },

  update(id: number, data: UpdateEventInput) {
    return prisma.event.update({
      where: { id },
      data,
    })
  },

  updateStatus(id: number, status: EventStatus) {
    return prisma.event.update({
      where: { id },
      data: { status },
    })
  },
}