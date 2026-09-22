import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../shared/errors.js'

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Erreur de validation Zod (ex: .parse() a échoué) → 400, avec le détail
  // de chaque champ invalide pour aider le frontend à afficher le bon message.
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Données invalides',
        details: err.flatten().fieldErrors,
      },
    })
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    })
  }

  console.error(err)
  return res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Une erreur interne est survenue' },
  })
}