import type { Request, Response } from 'express'
import { uploadsService } from './uploads.service.js'
import { signatureSchema } from './uploads.schema.js'

export const uploadsController = {
  async signature(req: Request, res: Response) {
    const input = signatureSchema.parse(req.body)
    const signature = uploadsService.createSignature(input)

    if (!signature) {
      res.status(503).json({
        error: {
          code: 'UPLOADS_UNAVAILABLE',
          message: "L'envoi d'images n'est pas disponible pour le moment.",
        },
      })
      return
    }

    res.json(signature)
  },
}