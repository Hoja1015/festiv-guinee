export type UserRole = 'CUSTOMER' | 'ORGANIZER' | 'STAFF' | 'ADMIN'

export type User = {
  id: number
  email: string
  fullName: string
  phone: string | null
  role: UserRole
  createdAt: string
  updatedAt: string
}