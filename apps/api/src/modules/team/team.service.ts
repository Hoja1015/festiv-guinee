import { teamRepository } from './team.repository.js'
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors.js'
import type { AssignStaffInput } from './team.schema.js'

export const teamService = {
  async getMine(organizerId: number) {
    const events = await teamRepository.findEventsWithStaff(organizerId)
    return {
      events: events.map((event) => ({
        id: event.id,
        title: event.title,
        date: event.date,
        status: event.status,
        staff: event.staff.map((s) => ({
          assignmentId: s.id,
          userId: s.user.id,
          fullName: s.user.fullName,
          email: s.user.email,
        })),
      })),
    }
  },

  async assign(organizerId: number, input: AssignStaffInput) {
    const event = await teamRepository.findEventOwner(input.eventId)
    if (!event) throw new NotFoundError('Événement')
    if (event.organizerId !== organizerId) {
      throw new ForbiddenError('Cet événement ne vous appartient pas')
    }

    const user = await teamRepository.findUserByEmail(input.email)
    if (!user) {
      throw new ValidationError('Aucun compte avec cet email : l\'agent doit d\'abord s\'inscrire sur le site')
    }

    // Seuls un client ou un agent peuvent être affectés : jamais un
    // organisateur ni un admin (on ne rétrograde personne par ce biais).
    if (user.role !== 'CUSTOMER' && user.role !== 'STAFF') {
      throw new ValidationError('Ce compte ne peut pas être affecté comme agent')
    }

    if (await teamRepository.findAssignment(user.id, event.id)) {
      throw new ValidationError('Cet agent est déjà affecté à cet événement')
    }

    await teamRepository.assign(user.id, event.id, user.role === 'CUSTOMER')
    return { userId: user.id, fullName: user.fullName, email: user.email }
  },

  async unassign(organizerId: number, assignmentId: number) {
    const assignment = await teamRepository.findAssignmentById(assignmentId)
    if (!assignment) throw new NotFoundError('Affectation')
    if (assignment.event.organizerId !== organizerId) {
      throw new ForbiddenError('Cet événement ne vous appartient pas')
    }
    await teamRepository.unassign(assignment.id, assignment.userId)
  },
}