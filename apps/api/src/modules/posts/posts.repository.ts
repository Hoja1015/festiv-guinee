import { prisma } from '../../lib/prisma.js'
import type { Prisma } from '@prisma/client'
import type { CreatePostInput, UpdatePostInput } from './posts.schema.js'

const postInclude = {
  author: { select: { id: true, fullName: true } },
  event: { select: { id: true, title: true } },
  _count: { select: { likes: true, comments: true } },
} satisfies Prisma.PostInclude

export type PostRow = Prisma.PostGetPayload<{ include: typeof postInclude }>

export const postsRepository = {
  // `take` = limit + 1 côté service : la ligne en trop sert à savoir s'il
  // reste une page suivante. L'id est croissant avec la date de création,
  // donc trier par id desc = du plus récent au plus ancien, et l'id suffit
  // comme curseur.
  findPage(take: number, cursor?: number, authorId?: number) {
    return prisma.post.findMany({
      where: authorId ? { authorId } : undefined,
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { id: 'desc' },
      include: postInclude,
    })
  },

  findById(id: number) {
    return prisma.post.findUnique({ where: { id }, include: postInclude })
  },

  create(authorId: number, data: CreatePostInput) {
    return prisma.post.create({ data: { ...data, authorId }, include: postInclude })
  },

  update(id: number, data: UpdatePostInput) {
    return prisma.post.update({ where: { id }, data, include: postInclude })
  },

  delete(id: number) {
    return prisma.post.delete({ where: { id } })
  },

  findLikedPostIds(userId: number, postIds: number[]) {
    return prisma.postLike.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    })
  },

  // upsert : liker deux fois de suite (double clic, deux onglets) ne plante pas.
  addLike(postId: number, userId: number) {
    return prisma.postLike.upsert({
      where: { postId_userId: { postId, userId } },
      create: { postId, userId },
      update: {},
    })
  },

  removeLike(postId: number, userId: number) {
    return prisma.postLike.deleteMany({ where: { postId, userId } })
  },

  countLikes(postId: number) {
    return prisma.postLike.count({ where: { postId } })
  },

  listComments(postId: number, take: number) {
    return prisma.postComment.findMany({
      where: { postId },
      orderBy: { createdAt: 'asc' },
      take,
      include: { user: { select: { id: true, fullName: true } } },
    })
  },

  createComment(postId: number, userId: number, content: string) {
    return prisma.postComment.create({
      data: { postId, userId, content },
      include: { user: { select: { id: true, fullName: true } } },
    })
  },

  findComment(id: number) {
    return prisma.postComment.findUnique({ where: { id } })
  },

  deleteComment(id: number) {
    return prisma.postComment.delete({ where: { id } })
  },
}