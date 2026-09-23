import type { Request, Response } from 'express'
import QRCode from 'qrcode'
import { ticketsService } from '../tickets/tickets.service.js'

export const ticketsController = {
  async listMine(req: Request, res: Response) {
    const tickets = await ticketsService.listMine(req.user!.userId)
    res.json({ tickets })
  },

  // Génère et renvoie directement l'image PNG du QR code pour un billet.
  // Le token en clair n'est JAMAIS exposé dans du JSON classique — seulement
  // encodé visuellement dans l'image, comme un vrai billet.
  async getQrCode(req: Request, res: Response) {
    const plainToken = await ticketsService.getPlainToken(
      Number(req.params.id),
      req.user!.userId
    )

    const qrPngBuffer = await QRCode.toBuffer(plainToken, {
      errorCorrectionLevel: 'M',
      width: 400,
    })

    res.setHeader('Content-Type', 'image/png')
    res.send(qrPngBuffer)
  },
}


