import { prisma } from '../../lib/prisma.js'

export const teamRepository = {
  // Événements de l'organisateur avec leurs agents affectés.
  findEventsWithStaff(organizerId: number) {
    return prisma.event.findMany({
      where: { organizerId },
      orderBy: { date: 'desc' },
      select: {
        id: true,
        title: true,
        date: true,
        status: true,
        staff: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            user: { select: { id: true, fullName: true, email: true } },
          },
        },
      },
    })
  },

  findEventOwner(eventId: number) {
    return prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, organizerId: true },
    })
  },

  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, fullName: true, email: true, role: true },
    })
  },

  findAssignment(userId: number, eventId: number) {
    return prisma.eventStaff.findUnique({
      where: { userId_eventId: { userId, eventId } },
      select: { id: true },
    })
  },

  findAssignmentById(id: number) {
    return prisma.eventStaff.findUnique({
      where: { id },
      select: { id: true, userId: true, event: { select: { organizerId: true } } },
    })
  },

  // Affectation + passage au rôle STAFF dans la même transaction : jamais
  // d'agent affecté sans le bon rôle (ni l'inverse).
  assign(userId: number, eventId: number, promote: boolean) {
    return prisma.$transaction(async (tx) => {
      if (promote) {
        await tx.user.update({ where: { id: userId }, data: { role: 'STAFF' } })
      }
      return tx.eventStaff.create({
        data: { userId, eventId },
        select: { id: true },
      })
    })
  },

  // Retire l'affectation ; si l'agent n'a plus aucun événement, il redevient
  // simple client (pas de privilège qui traîne).
  unassign(assignmentId: number, userId: number) {
    return prisma.$transaction(async (tx) => {
      await tx.eventStaff.delete({ where: { id: assignmentId } })
      const remaining = await tx.eventStaff.count({ where: { userId } })
      if (remaining === 0) {
        await tx.user.updateMany({
          where: { id: userId, role: 'STAFF' },
          data: { role: 'CUSTOMER' },
        })
      }
    })
  },
}