import type { Request, Response } from 'express'
import { authService } from './auth.service.js'
import { authRepository } from './auth.repository.js'
import { registerSchema, loginSchema } from './auth.schema.js'

// Durée du cookie en millisecondes (doit correspondre à JWT_EXPIRES_IN = '7d').
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000

function setAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  })
}

// Ne jamais renvoyer passwordHash au client, même hashé.
function toPublicUser(user: { passwordHash: string; [key: string]: unknown }) {
  const { passwordHash, ...publicUser } = user
  return publicUser
}

export const authController = {
  async register(req: Request, res: Response) {
    const input = registerSchema.parse(req.body)
    const { user, token } = await authService.register(input)

    setAuthCookie(res, token)
    res.status(201).json({ user: toPublicUser(user) })
  },

  async login(req: Request, res: Response) {
    const input = loginSchema.parse(req.body)
    const { user, token } = await authService.login(input)

    setAuthCookie(res, token)
    res.json({ user: toPublicUser(user) })
  },

  logout(_req: Request, res: Response) {
    res.clearCookie('token')
    res.json({ message: 'Déconnecté' })
  },

  async me(req: Request, res: Response) {
    // req.user est garanti présent ici : requireAuth s'exécute toujours avant
    const user = await authRepository.findById(req.user!.userId)

    if (!user) {
      // Cas rare mais possible : le token est valide mais l'utilisateur a été
      // supprimé de la base entretemps.
      res.clearCookie('token')
      res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Utilisateur introuvable' } })
      return
    }

    res.json({ user: toPublicUser(user) })
  },
}