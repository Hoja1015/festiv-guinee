import { z } from 'zod'

// Dossiers Cloudinary autorisés : le client ne choisit jamais un chemin libre.
export const signatureSchema = z.object({
  folder: z.enum(['events', 'posts']),
})

export type SignatureInput = z.infer<typeof signatureSchema>