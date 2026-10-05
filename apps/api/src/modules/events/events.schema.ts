import { z } from 'zod'

// Champs propres à l'événement. Séparés du schéma de création pour que la
// modification (.partial()) ne hérite pas de `ticketTypes` : Prisma refuserait
// ce champ dans un `event.update`.
const eventFieldsSchema = z.object({
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

// Un type de billet à la création. `remainingQuantity` n'est pas fourni par le
// client : il est initialisé à `totalQuantity` côté repository.
export const ticketTypeInputSchema = z.object({
  name: z.enum(['STANDARD', 'VIP', 'VVIP']),
  // VARCHAR(191) par défaut avec Prisma + MySQL
  description: z.string().max(191, 'La description du billet est trop longue').optional(),
  priceGNF: z.number().int('Le prix doit être un nombre entier').positive('Le prix doit être supérieur à 0'),
  totalQuantity: z
    .number()
    .int('La quantité doit être un nombre entier')
    .positive('La quantité doit être supérieure à 0'),
})

const ticketTypesSchema = z
  .array(ticketTypeInputSchema)
  .min(1, 'Au moins un type de billet est requis')
  .refine((types) => new Set(types.map((t) => t.name)).size === types.length, {
    message: 'Un type de billet ne peut apparaître qu\'une seule fois',
  })

export const createEventSchema = eventFieldsSchema.extend({
  ticketTypes: ticketTypesSchema,
})

// Pour la modification, tous les champs deviennent optionnels (on peut
// ne modifier qu'un seul champ à la fois), mais on garde les mêmes règles
// de validation sur chaque champ individuellement grâce à .partial().
// `ticketTypes`, s'il est fourni, REMPLACE la liste existante (brouillon
// uniquement, voir events.service.ts).
export const updateEventSchema = eventFieldsSchema.partial().extend({
  ticketTypes: ticketTypesSchema.optional(),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>