import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../lib/jwt.js'
import { UnauthorizedError, ForbiddenError } from '../shared/errors.js'

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies.token

  if (!token) {
    return next(new UnauthorizedError('Vous devez être connecté'))
  }

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    // Token expiré, altéré, ou signé avec un autre secret → toujours 401,
    // pas besoin de détailler la raison exacte au client.
    next(new UnauthorizedError('Session invalide ou expirée'))
  }
}

// Middleware "factory" : on lui passe les rôles autorisés, il retourne
// le vrai middleware. Permet d'écrire requireRole('ORGANIZER', 'ADMIN')
// directement dans la définition d'une route.
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError())
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Rôle insuffisant pour cette action'))
    }

    next()
  }
}