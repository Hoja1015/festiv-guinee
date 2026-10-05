import { prisma } from '../../lib/prisma.js'
import type { EventStatus } from '@prisma/client'
import { ValidationError } from '../../shared/errors.js'
import type { CreateEventInput, UpdateEventInput } from './events.schema.js'

export const eventsRepository = {
  findPublished() {
    return prisma.event.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { date: 'asc' },
      include: { ticketTypes: true },
    })
  },

  // Événements passés ayant réellement vendu des billets, du plus vendu
  // au moins vendu — sert de "preuve sociale" sur l'accueil. `tickets: { some: {} }`
  // exclut les événements passés sans aucune vente (pas de carte à 0 billet).
  findPastHighlights(limit: number) {
    return prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        date: { lt: new Date() },
        tickets: { some: {} },
      },
      orderBy: { tickets: { _count: 'desc' } },
      take: limit,
      include: {
        _count: { select: { tickets: true } },
      },
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

  // Création imbriquée : l'événement et ses types de billets sont écrits dans
  // la même requête (atomique) — impossible de se retrouver avec un événement
  // sans billets si l'un d'eux est invalide. Au départ, tout le stock est
  // disponible : remainingQuantity = totalQuantity.
  create(organizerId: number, input: CreateEventInput) {
    const { ticketTypes, ...eventData } = input

    return prisma.event.create({
      data: {
        ...eventData,
        organizerId,
        ticketTypes: {
          create: ticketTypes.map((tt) => ({
            ...tt,
            remainingQuantity: tt.totalQuantity,
          })),
        },
      },
      include: { ticketTypes: true },
    })
  },

  // Sans `ticketTypes` : simple mise à jour des champs de l'événement.
  // Avec `ticketTypes` : la liste est remplacée dans une transaction. On
  // refuse si un billet a déjà été commandé (sinon la suppression casserait
  // les commandes existantes).
  update(id: number, data: UpdateEventInput) {
    const { ticketTypes, ...eventData } = data

    if (!ticketTypes) {
      return prisma.event.update({
        where: { id },
        data: eventData,
        include: { ticketTypes: true },
      })
    }

    return prisma.$transaction(async (tx) => {
      const ordered = await tx.orderItem.count({ where: { ticketType: { eventId: id } } })
      if (ordered > 0) {
        throw new ValidationError('Des billets ont déjà été commandés : impossible de les modifier')
      }

      await tx.ticketType.deleteMany({ where: { eventId: id } })

      return tx.event.update({
        where: { id },
        data: {
          ...eventData,
          ticketTypes: {
            create: ticketTypes.map((tt) => ({ ...tt, remainingQuantity: tt.totalQuantity })),
          },
        },
        include: { ticketTypes: true },
      })
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