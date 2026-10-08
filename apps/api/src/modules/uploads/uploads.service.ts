import { createHash } from 'node:crypto'
import type { SignatureInput } from './uploads.schema.js'

// Formats acceptés par Cloudinary pour ces envois (contrôlé de leur côté).
const ALLOWED_FORMATS = 'jpg,jpeg,png,webp'

export const uploadsService = {
  // Prépare un envoi direct navigateur → Cloudinary. L'image ne transite jamais
  // par ce serveur, et le secret d'API ne quitte jamais l'API : le navigateur ne
  // reçoit qu'une signature valable une heure, pour ce dossier et ces options.
  // Retourne null si Cloudinary n'est pas configuré.
  createSignature({ folder }: SignatureInput) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET
    if (!cloudName || !apiKey || !apiSecret) return null

    const timestamp = Math.floor(Date.now() / 1000)
    const params: Record<string, string | number> = {
      allowed_formats: ALLOWED_FORMATS,
      folder: `festiv-guinee/${folder}`,
      timestamp,
    }

    // Règle de signature Cloudinary : paramètres triés par nom, "nom=valeur"
    // séparés par "&", puis le secret ajouté, le tout haché en SHA-1.
    const toSign = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join('&')
    const signature = createHash('sha1').update(toSign + apiSecret).digest('hex')

    return {
      cloudName,
      apiKey,
      timestamp,
      folder: params.folder as string,
      allowedFormats: ALLOWED_FORMATS,
      signature,
    }
  },
}