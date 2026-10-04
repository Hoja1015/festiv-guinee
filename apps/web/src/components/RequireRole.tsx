import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useCurrentUser, type AuthUser } from '../hooks/useAuth'

interface RequireRoleProps {
  roles: AuthUser['role'][]
  children: ReactNode
}

// Comme RequireAuth, mais vérifie aussi le rôle. Un visiteur non connecté part
// sur /login ; un connecté avec le mauvais rôle (ex. un client qui tape
// /organisateur à la main) repart à l'accueil plutôt que de voir une page
// d'organisateur qui ne le concerne pas.
export function RequireRole({ roles, children }: RequireRoleProps) {
  const { data: user, isLoading } = useCurrentUser()
  const location = useLocation()

  if (isLoading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}