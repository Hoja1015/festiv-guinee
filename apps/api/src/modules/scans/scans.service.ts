import { scansRepository } from '../scans/scans.repository.js'
import { hashToken } from '../../lib/tokens.js'
import { ForbiddenError } from '../../shared/errors.js'
import type { ScanResult } from '@prisma/client'

export const scansService = {
  async scan(agentId: number, eventId: number, token: string) {
    // 1. Sécurité d'abord : l'agent doit être affecté à CET événement précis.
    // Si ce n'est pas le cas, on refuse avant même de chercher le billet —
    // rien à logger, on ne connaît même pas encore de ticketId valide.
    const assignment = await scansRepository.findStaffAssignment(agentId, eventId)
    if (!assignment) {
      throw new ForbiddenError('Vous n\'êtes pas affecté à cet événement')
    }

    // 2. On hash le token reçu pour le comparer au hash stocké —
    // jamais de comparaison sur le token en clair.
    const tokenHash = hashToken(token)
    const ticket = await scansRepository.findTicketByTokenHash(tokenHash)

    // 3. Token inconnu : aucun billet ne correspond. Décision validée :
    // pas de ligne Scan créée (aucun ticketId valide à rattacher).
    if (!ticket) {
      return { result: 'INVALID' as ScanResult }
    }

    // 4. Le billet existe mais appartient à un AUTRE événement.
    if (ticket.eventId !== eventId) {
      await scansRepository.createScan({
        ticketId: ticket.id,
        eventId,
        agentId,
        result: 'WRONG_EVENT',
      })
      return { result: 'WRONG_EVENT' as ScanResult }
    }

    // 5. Le billet a été annulé (ex: remboursement, événement annulé).
    if (ticket.status === 'CANCELLED') {
      await scansRepository.createScan({
        ticketId: ticket.id,
        eventId,
        agentId,
        result: 'CANCELLED',
      })
      return { result: 'CANCELLED' as ScanResult }
    }

    // 6. Déjà scanné (sans passer par l'étape atomique, on sait déjà
    // que ça va échouer — on évite un aller-retour DB inutile).
    if (ticket.status === 'USED') {
      await scansRepository.createScan({
        ticketId: ticket.id,
        eventId,
        agentId,
        result: 'ALREADY_USED',
      })
      return { result: 'ALREADY_USED' as ScanResult }
    }

    // 7. Le billet est VALID : tentative de validation ATOMIQUE.
    // Si un autre agent vient de scanner ce même billet une milliseconde
    // avant nous, markUsedIfValid renverra false — c'est notre protection
    // contre le double scan simultané.
    const success = await scansRepository.markUsedIfValid(ticket.id)
    const result: ScanResult = success ? 'VALID' : 'ALREADY_USED'

    await scansRepository.createScan({
      ticketId: ticket.id,
      eventId,
      agentId,
      result,
    })

    return { result }
  },
}