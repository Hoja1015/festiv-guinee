import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { api, ApiError } from '../lib/api'

export interface AuthUser {
  id: number
  email: string
  fullName: string
  phone: string | null
  role: 'CUSTOMER' | 'ORGANIZER' | 'STAFF' | 'ADMIN'
}

export interface RegisterInput {
  email: string
  password: string
  fullName: string
  phone?: string
}

export interface LoginInput {
  email: string
  password: string
}

const AUTH_QUERY_KEY = ['auth', 'me']

export function useCurrentUser() {
  return useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      try {
        const data = await api.get<{ user: AuthUser }>('/auth/me')
        return data.user
      } catch (err) {
        // Non connecté = état normal, pas une erreur à afficher.
        if (err instanceof ApiError && err.status === 401) {
          return null
        }
        throw err
      }
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}

// Efface tout le cache sauf la session ('auth') : celle-ci est réécrite juste
// après avec setQueryData, ce qui garde les écrans ouverts bien synchronisés.
function clearPrivateData(queryClient: QueryClient) {
  queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth' })
}

// Le cache de React Query est partagé par tout le navigateur : sans le vider,
// la personne qui se connecte juste après une autre verrait un instant les
// billets, commandes ou ventes de la précédente. On repart donc de zéro.
export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: LoginInput) => api.post<{ user: AuthUser }>('/auth/login', input),
    onSuccess: (data) => {
      clearPrivateData(queryClient)
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterInput) => api.post<{ user: AuthUser }>('/auth/register', input),
    onSuccess: (data) => {
      clearPrivateData(queryClient)
      queryClient.setQueryData(AUTH_QUERY_KEY, data.user)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      clearPrivateData(queryClient)
      queryClient.setQueryData(AUTH_QUERY_KEY, null)
    },
  })
}