import { createContext, useContext, type ReactNode } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { api, ApiError } from '../lib/api'
import type { User } from '../types/user'

type AuthContextValue = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: { email: string; password: string; fullName: string }) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  // On appelle /auth/me au chargement. Si on n'est pas connecté (401),
  // on ne traite PAS ça comme une vraie erreur applicative — c'est un état
  // normal ("personne n'est connecté"), donc retry: false pour ne pas
  // réessayer inutilement, et on transforme le 401 en `null` plutôt qu'en erreur.
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const result = await api.get<{ user: User }>('/auth/me')
        return result.user
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          return null
        }
        throw err
      }
    },
    retry: false,
  })

  const loginMutation = useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api.post<{ user: User }>('/auth/login', input),
    onSuccess: (result) => {
      // On met à jour directement le cache plutôt que de refaire un appel
      // /auth/me juste après — on a déjà la donnée dans la réponse du login.
      queryClient.setQueryData(['auth', 'me'], result.user)
    },
  })

  const registerMutation = useMutation({
    mutationFn: (input: { email: string; password: string; fullName: string }) =>
      api.post<{ user: User }>('/auth/register', input),
    onSuccess: (result) => {
      queryClient.setQueryData(['auth', 'me'], result.user)
    },
  })

  const logoutMutation = useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null)
      // On vide aussi tout le reste du cache (commandes, billets...) —
      // ces données appartenaient à l'utilisateur précédent, on ne veut
      // pas qu'elles restent visibles après déconnexion.
      queryClient.clear()
    },
  })

  const value: AuthContextValue = {
    user: user ?? null,
    isLoading,
    login: async (email, password) => {
      await loginMutation.mutateAsync({ email, password })
    },
    register: async (data) => {
      await registerMutation.mutateAsync(data)
    },
    logout: async () => {
      await logoutMutation.mutateAsync()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur de AuthProvider')
  }
  return context
}