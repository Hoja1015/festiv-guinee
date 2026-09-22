import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

if (!JWT_SECRET) {
  // On échoue tout de suite au démarrage si le secret manque, plutôt que de
  // laisser l'app tourner et signer des tokens avec "undefined" (faille béante).
  throw new Error('JWT_SECRET manquant dans les variables d\'environnement')
}

// Ce qu'on encode dans chaque token : juste de quoi identifier l'utilisateur
// et son rôle — jamais de mot de passe ni de données personnelles sensibles,
// le contenu d'un JWT n'est PAS chiffré, seulement signé (donc lisible par
// n'importe qui, mais impossible à falsifier sans connaître JWT_SECRET).
export type JwtPayload = {
  userId: number
  role: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions)
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}