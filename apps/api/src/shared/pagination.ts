// Utilitaires de pagination partagés par les listes de l'API.

export interface PageParams {
  page: number
  pageSize: number
  skip: number
  take: number
}

export interface PageMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

interface PageOptions {
  defaultPageSize?: number
  maxPageSize?: number
}

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

// Lit ?page= et ?pageSize= . Une valeur absente ou invalide retombe sur la
// valeur par défaut au lieu de renvoyer une erreur, et la taille de page est
// plafonnée pour qu'un visiteur ne puisse pas demander des milliers de lignes.
export function parsePagination(query: Record<string, unknown>, options: PageOptions = {}): PageParams {
  const defaultPageSize = options.defaultPageSize ?? 12
  const maxPageSize = options.maxPageSize ?? 50

  const rawPage = Number(firstString(query.page))
  const rawSize = Number(firstString(query.pageSize))

  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1
  const pageSize =
    Number.isInteger(rawSize) && rawSize >= 1 ? Math.min(rawSize, maxPageSize) : defaultPageSize

  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize }
}

export function buildPageMeta(total: number, params: PageParams): PageMeta {
  return {
    page: params.page,
    pageSize: params.pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / params.pageSize)),
  }
}

// Lit un filtre texte optionnel (?q=, ?city=...) : vide ou absent => undefined.
export function readTextFilter(value: unknown, maxLength = 100): string | undefined {
  const text = firstString(value)?.trim()
  if (!text) return undefined
  return text.slice(0, maxLength)
}