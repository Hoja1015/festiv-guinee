import { z } from 'zod'

export const createEventSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  imageUrl: z.string().url('URL d\'image invalide').optional(),
  category: z.string().min(2, 'La catégorie est requise'),
  venue: z.string().min(2, 'Le lieu est requis'),
  city: z.string().min(2, 'La ville est requise'),
  // On reçoit une date en string (format ISO depuis le frontend, ex: "2026-12-31T20:00:00Z")
  // et on la transforme en objet Date pour Prisma.
  date: z.coerce.date().refine((d) => d > new Date(), {
    message: 'La date de l\'événement doit être dans le futur',
  }),
})

// Pour la modification, tous les champs deviennent optionnels (on peut
// ne modifier qu'un seul champ à la fois), mais on garde les mêmes règles
// de validation sur chaque champ individuellement grâce à .partial()
export const updateEventSchema = createEventSchema.partial()

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>