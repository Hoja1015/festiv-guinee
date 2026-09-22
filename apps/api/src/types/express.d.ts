import type { JwtPayload } from '../lib/jwt'

// Augmente le type Request d'Express pour lui ajouter `user`,
// rempli par requireAuth. Sans ça, `req.user` serait une erreur TypeScript
// partout où on l'utilise.
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}