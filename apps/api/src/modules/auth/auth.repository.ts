import { prisma } from '../../lib/prisma.js'
import type { UserRole } from '@prisma/client'

export const authRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } })
  },

  findById(id: number) {
    return prisma.user.findUnique({ where: { id } })
  },

  create(data: {
    email: string
    passwordHash: string
    fullName: string
    phone?: string
    role?: UserRole
  }) {
    return prisma.user.create({ data })
  },
}