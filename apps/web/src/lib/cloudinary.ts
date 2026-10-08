import { api } from './api'

export type UploadFolder = 'events' | 'posts'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

interface UploadSignature {
  cloudName: string
  apiKey: string
  timestamp: number
  folder: string
  allowedFormats: string
  signature: string
}

export class UploadError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UploadError'
  }
}

// Envoie une image directement à Cloudinary et retourne son adresse HTTPS.
// L'API ne fournit qu'une signature : l'image ne passe jamais par notre serveur.
export async function uploadImage(file: File, folder: UploadFolder): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new UploadError('Format non pris en charge. Utilise une image JPG, PNG ou WebP.')
  }
  if (file.size > MAX_BYTES) {
    throw new UploadError('Image trop lourde (5 Mo maximum).')
  }

  const sig = await api.post<UploadSignature>('/uploads/signature', { folder })

  const form = new FormData()
  form.append('file', file)
  form.append('api_key', sig.apiKey)
  form.append('timestamp', String(sig.timestamp))
  form.append('signature', sig.signature)
  form.append('folder', sig.folder)
  form.append('allowed_formats', sig.allowedFormats)

  let res: Response
  try {
    // Requête vers un autre domaine : surtout pas de cookies ni d'en-têtes ajoutés.
    res = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: 'POST',
      body: form,
    })
  } catch {
    throw new UploadError('Envoi impossible. Vérifie ta connexion et réessaie.')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const reason = body?.error?.message as string | undefined
    throw new UploadError(reason ? `Envoi refusé : ${reason}` : 'Envoi refusé. Réessaie dans un instant.')
  }

  const data = (await res.json()) as { secure_url?: string }
  if (!data.secure_url) {
    throw new UploadError("Réponse inattendue de l'hébergeur d'images.")
  }
  return data.secure_url
}

// Demande à Cloudinary une version allégée de l'image (format moderne, qualité
// automatique, largeur donnée). Les autres adresses sont renvoyées telles quelles.
export function optimizeImageUrl(url: string, width: number): string {
  const marker = '/image/upload/'
  if (!url.includes('res.cloudinary.com') || !url.includes(marker)) return url
  return url.replace(marker, `${marker}f_auto,q_auto,w_${width}/`)
}