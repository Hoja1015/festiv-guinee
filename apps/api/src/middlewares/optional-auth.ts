import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt.js'

// Comme requireAuth, mais ne refuse jamais la requête : si le cookie est
// absent ou invalide, le visiteur est simplement traité comme anonyme
// (req.user reste undefined).
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies.token

  if (token) {
    try {
      req.user = verifyToken(token)
    } catch {
      // Token expiré ou altéré : on continue en anonyme.
    }
  }

  next()
}