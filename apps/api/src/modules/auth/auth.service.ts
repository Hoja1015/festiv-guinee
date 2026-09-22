import bcrypt from 'bcrypt'
import { authRepository } from './auth.repository.js'
import { signToken } from '../../lib/jwt.js'
import { ConflictError, UnauthorizedError } from '../../shared/errors.js'
import type { RegisterInput, LoginInput } from './auth.schema.js'

// Facteur de coût du hash bcrypt : plus il est élevé, plus le hash est lent
// à calculer (donc plus résistant au bruteforce), mais plus ça ralentit
// l'inscription/connexion. 10-12 est le standard recommandé aujourd'hui.
const BCRYPT_ROUNDS = 12

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findByEmail(input.email)
    if (existing) {
      throw new ConflictError('Un compte existe déjà avec cet email')
    }

    // On ne stocke JAMAIS le mot de passe en clair, uniquement son hash.
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS)

    const user = await authRepository.create({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      phone: input.phone,
    })

    const token = signToken({ userId: user.id, role: user.role })

    return { user, token }
  },

  async login(input: LoginInput) {
    const user = await authRepository.findByEmail(input.email)

    // Message volontairement identique que l'email n'existe pas OU que le
    // mot de passe soit faux — ne jamais révéler si un email est inscrit,
    // ça faciliterait l'énumération de comptes par un attaquant.
    if (!user) {
      throw new UnauthorizedError('Email ou mot de passe incorrect')
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash)
    if (!isValid) {
      throw new UnauthorizedError('Email ou mot de passe incorrect')
    }

    const token = signToken({ userId: user.id, role: user.role })

    return { user, token }
  },
}