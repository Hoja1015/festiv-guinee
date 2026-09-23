import { randomBytes, createHash, createCipheriv, createDecipheriv } from 'crypto'

const ENCRYPTION_KEY = Buffer.from(process.env.TICKET_ENCRYPTION_KEY as string, 'hex')

if (ENCRYPTION_KEY.length !== 32) {
  throw new Error('TICKET_ENCRYPTION_KEY doit faire 32 octets (64 caractères hexadécimaux)')
}

// Génère un token aléatoire imprévisible, au format lisible pour un QR code.
// Exemple : "TKT-8F92KD73XP91A4B2"
export function generateTicketToken(): string {
  const random = randomBytes(9).toString('hex').toUpperCase()
  return `TKT-${random}`
}

// Hash déterministe (même entrée = même sortie) : utilisé pour retrouver
// rapidement un billet en base au moment du scan (WHERE token = ...).
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// Chiffrement RÉVERSIBLE (AES-256-GCM) : permet de retrouver le token en
// clair plus tard pour régénérer le QR code, sans jamais le stocker en clair.
export function encryptToken(token: string): string {
  // IV (vecteur d'initialisation) aléatoire à CHAQUE appel — c'est ce qui
  // garantit que chiffrer deux fois le même token donne un résultat différent.
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)

  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  // On concatène iv + authTag + données chiffrées, encodés en base64,
  // pour tout stocker dans un seul champ texte.
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export function decryptToken(encryptedValue: string): string {
  const buffer = Buffer.from(encryptedValue, 'base64')

  const iv = buffer.subarray(0, 12)
  const authTag = buffer.subarray(12, 28)
  const encrypted = buffer.subarray(28)

  const decipher = createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}