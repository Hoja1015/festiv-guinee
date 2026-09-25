import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Évite de re-fetcher automatiquement à chaque fois que l'utilisateur
      // revient sur l'onglet du navigateur — comportement par défaut un peu
      // agressif pour un projet de cette taille, on préfère rester simple.
      refetchOnWindowFocus: false,
    },
  },
})