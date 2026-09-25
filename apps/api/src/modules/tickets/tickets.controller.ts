import type { Request, Response } from 'express'
import QRCode from 'qrcode'
import { ticketsService } from './tickets.service.js'

export const ticketsController = {
  async listMine(req: Request, res: Response) {
    const tickets = await ticketsService.listMine(req.user!.userId)
    res.json({ tickets })
  },

  async getQrCode(req: Request, res: Response) {
    const plainToken = await ticketsService.getPlainToken(
      Number(req.params.id),
      req.user!.userId
    )

    const qrPngBuffer = await QRCode.toBuffer(plainToken, {
      errorCorrectionLevel: 'M',
      width: 400,
    })

    // Autorise le chargement de cette image depuis une autre origine
    // (notre frontend sur :5173) — Helmet bloque ça par défaut (CORP:
    // same-origin), ce qui est une bonne protection générale, mais empêche
    // ici notre propre <img src="..."> légitime de fonctionner.
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
    res.setHeader('Content-Type', 'image/png')
    res.send(qrPngBuffer)
  },
}