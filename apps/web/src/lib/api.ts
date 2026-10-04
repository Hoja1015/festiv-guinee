const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export class ApiError extends Error {
  status: number
  code?: string
  details?: Record<string, string[] | undefined>

  constructor(message: string, status: number, code?: string, details?: Record<string, string[] | undefined>) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

interface RequestOptions extends RequestInit {
  json?: unknown
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    const message = body?.error?.message ?? `Erreur ${res.status}`
    throw new ApiError(message, res.status, body?.error?.code, body?.error?.details)
  }

  if (res.status === 204) {
    return undefined as T
  }

  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, json?: unknown) => request<T>(path, { method: 'POST', json }),
  patch: <T>(path: string, json?: unknown) => request<T>(path, { method: 'PATCH', json }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  postForm: <T>(path: string, formData: FormData) =>
    request<T>(path, { method: 'POST', body: formData }),
}

// URL directe (pas via `api.get`) car l'endpoint renvoie une image PNG, pas du JSON —
// destinée à un <img src>. Le cookie de session part quand même : même "site"
// (localhost), seul le port change, donc le cookie SameSite=Lax est envoyé.
export function getTicketQrCodeUrl(ticketId: number): string {
  return `${API_URL}/tickets/${ticketId}/qrcode`
}

export interface PastHighlightEvent {
  id: number
  title: string
  imageUrl: string | null
  category: string
  venue: string
  city: string
  date: string
  ticketsSold: number
}