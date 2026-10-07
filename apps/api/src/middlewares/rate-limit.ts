import { rateLimit } from 'express-rate-limit'

// Réponse au même format que les autres erreurs de l'API.
function limiter(options: { windowMs: number; limit: number; message: string; skipSuccessfulRequests?: boolean }) {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? false,
    // Les tests automatisés enchaînent les requêtes : pas de limite en test.
    skip: () => process.env.NODE_ENV === 'test',
    handler: (_req, res) => {
      res.status(429).json({ error: { code: 'RATE_LIMITED', message: options.message } })
    },
  })
}

// Plafond large pour tout le trafic. Beaucoup d'utilisateurs mobiles partagent
// la même adresse IP chez l'opérateur : on reste généreux ici et on ne
// serre la vis que sur les routes sensibles ci-dessous.
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  // /scans exclu : plusieurs agents scannent en rafale depuis le même Wi-Fi.
  skip: (req) => process.env.NODE_ENV === 'test' || req.path.startsWith('/scans') || req.path === '/health',
  handler: (_req, res) => {
    res.status(429).json({ error: { code: 'RATE_LIMITED', message: 'Trop de requêtes, réessayez dans quelques minutes.' } })
  },
})

// Anti force brute : seules les tentatives ÉCHOUÉES comptent.
export const loginLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.',
})

export const registerLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: 'Trop de créations de compte depuis cette connexion. Réessayez plus tard.',
})

// Likes, commentaires, publications : écritures uniquement (voir app.ts).
export const postsWriteLimiter = limiter({
  windowMs: 10 * 60 * 1000,
  limit: 60,
  message: 'Vous allez trop vite. Patientez quelques minutes.',
})