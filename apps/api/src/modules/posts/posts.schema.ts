import { z } from 'zod'

export const createPostSchema = z.object({
  content: z.string().trim().min(1, 'Le texte de la publication est requis').max(2000, '2000 caractères maximum'),
  imageUrl: z.string().url('URL d\'image invalide').optional(),
  // Événement auquel la publication renvoie (doit appartenir à l'organisateur).
  eventId: z.number().int().positive().optional(),
})

export const createCommentSchema = z.object({
  content: z.string().trim().min(1, 'Le commentaire est vide').max(1000, '1000 caractères maximum'),
})

// Pagination par curseur : `cursor` = id de la dernière publication reçue.
// Les query params arrivent en string, d'où z.coerce.
export const listPostsQuerySchema = z.object({
  cursor: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().min(1).max(30).default(10),
  authorId: z.coerce.number().int().positive().optional(),
})

export type CreatePostInput = z.infer<typeof createPostSchema>