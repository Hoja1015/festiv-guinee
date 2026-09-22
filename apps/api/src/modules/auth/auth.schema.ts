import { z } from 'zod'

// Règles du mot de passe : au moins 8 caractères, une majuscule, un chiffre.
// On ne va pas plus loin (symbole obligatoire, etc.) pour ne pas frustrer
// les utilisateurs guinéens moins habitués aux exigences complexes.
const passwordSchema = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')

export const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: passwordSchema,
  fullName: z.string().min(2, 'Le nom complet est requis'),
  phone: z.string().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

// Types TypeScript dérivés automatiquement du schéma Zod —
// on ne les écrit jamais à la main, ils suivent le schéma s'il change.
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>