import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../shared/errors.js'

// Express reconnaît ce middleware comme "gestionnaire d'erreurs" uniquement
// grâce à sa signature à 4 paramètres (err, req, res, next).
// Il doit être déclaré en DERNIER dans app.ts.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Erreur métier connue (ex: NotFoundError) → on connaît le code HTTP à renvoyer
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }

  // Erreur inattendue (bug, crash Prisma, etc.) → on ne renvoie jamais le détail
  // technique au client (fuite d'info), mais on le log côté serveur pour debug
  console.error(err)
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue' },
  })
}