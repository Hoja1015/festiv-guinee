import { prisma } from '../../lib/prisma.js'
import type { EventStatus } from '@prisma/client'
import type { CreateEventInput, UpdateEventInput } from './events.schema.js'

export const eventsRepository = {
  findPublished() {
    return prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { date: 'asc' },
      include: { ticketTypes: true },
    })
  },

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

  // Affecte un agent (STAFF) à cet événement. upsert évite une erreur si
  // l'organisateur clique deux fois sur "affecter" par erreur — la
  // contrainte @@unique([userId, eventId]) fait le reste.
  assignStaff(eventId: number, userId: number) {
    return prisma.eventStaff.upsert({
      where: { userId_eventId: { userId, eventId } },
      create: { userId, eventId },
      update: {},
    })
  },

  listStaff(eventId: number) {
    return prisma.eventStaff.findMany({
      where: { eventId },
      include: { user: { select: { id: true, fullName: true, email: true } } },
    })
  },
}