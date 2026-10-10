import { postsRepository, type PostRow } from './posts.repository.js'
import { eventsService } from '../events/events.service.js'
import { NotFoundError, ForbiddenError, ValidationError } from '../../shared/errors.js'
import type { CreatePostInput, UpdatePostInput } from './posts.schema.js'

const MAX_COMMENTS = 100

// Forme exposée au frontend. `likedByMe` dépend du visiteur : toujours false
// pour un anonyme.
function toDto(post: PostRow, likedByMe: boolean) {
  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    author: post.author,
    event: post.event,
    likesCount: post._count.likes,
    commentsCount: post._count.comments,
    likedByMe,
  }
}

async function likedIdsFor(userId: number | undefined, postIds: number[]) {
  if (userId === undefined || postIds.length === 0) return new Set<number>()
  const likes = await postsRepository.findLikedPostIds(userId, postIds)
  return new Set(likes.map((l) => l.postId))
}

async function getExistingPost(id: number) {
  const post = await postsRepository.findById(id)
  if (!post) throw new NotFoundError('Publication')
  return post
}

export const postsService = {
  async list(userId: number | undefined, limit: number, cursor?: number, authorId?: number) {
    const rows = await postsRepository.findPage(limit + 1, cursor, authorId)
    const hasMore = rows.length > limit
    const page = hasMore ? rows.slice(0, limit) : rows
    const liked = await likedIdsFor(userId, page.map((p) => p.id))

    return {
      posts: page.map((p) => toDto(p, liked.has(p.id))),
      nextCursor: hasMore ? page[page.length - 1].id : null,
    }
  },

  async getById(userId: number | undefined, id: number) {
    const post = await getExistingPost(id)
    const liked = await likedIdsFor(userId, [id])
    return toDto(post, liked.has(id))
  },

  async create(authorId: number, input: CreatePostInput) {
    if (input.eventId !== undefined) {
      // Réutilise la vérification de propriété déjà écrite pour les événements.
      const event = await eventsService.assertOwnership(input.eventId, authorId)
      if (event.status !== 'PUBLISHED') {
        throw new ValidationError('Une publication ne peut renvoyer qu\'à un événement publié')
      }
    }
    const post = await postsRepository.create(authorId, input)
    return toDto(post, false)
  },

  async update(postId: number, userId: number, input: UpdatePostInput) {
    const post = await getExistingPost(postId)
    if (post.authorId !== userId) {
      throw new ForbiddenError('Vous ne pouvez modifier que vos propres publications')
    }
    // Un nouveau lien vers un événement obéit aux mêmes règles qu'à la création.
    if (input.eventId !== undefined && input.eventId !== null) {
      const event = await eventsService.assertOwnership(input.eventId, userId)
      if (event.status !== 'PUBLISHED') {
        throw new ValidationError('Une publication ne peut renvoyer qu\'à un événement publié')
      }
    }
    const updated = await postsRepository.update(postId, input)
    const liked = await likedIdsFor(userId, [postId])
    return toDto(updated, liked.has(postId))
  },

  async remove(postId: number, userId: number) {
    const post = await getExistingPost(postId)
    if (post.authorId !== userId) {
      throw new ForbiddenError('Vous ne pouvez supprimer que vos propres publications')
    }
    await postsRepository.delete(postId)
  },

  async like(postId: number, userId: number) {
    await getExistingPost(postId)
    await postsRepository.addLike(postId, userId)
    return { liked: true, likesCount: await postsRepository.countLikes(postId) }
  },

  async unlike(postId: number, userId: number) {
    await getExistingPost(postId)
    await postsRepository.removeLike(postId, userId)
    return { liked: false, likesCount: await postsRepository.countLikes(postId) }
  },

  async listComments(postId: number) {
    await getExistingPost(postId)
    const comments = await postsRepository.listComments(postId, MAX_COMMENTS)
    return comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      user: c.user,
    }))
  },

  async addComment(postId: number, userId: number, content: string) {
    await getExistingPost(postId)
    const comment = await postsRepository.createComment(postId, userId, content)
    return { id: comment.id, content: comment.content, createdAt: comment.createdAt, user: comment.user }
  },

  // Un commentaire peut être supprimé par son auteur, ou par l'auteur de la
  // publication (modération de ses propres annonces).
  async removeComment(postId: number, commentId: number, userId: number) {
    const post = await getExistingPost(postId)
    const comment = await postsRepository.findComment(commentId)
    if (!comment || comment.postId !== postId) throw new NotFoundError('Commentaire')

    if (comment.userId !== userId && post.authorId !== userId) {
      throw new ForbiddenError('Vous ne pouvez pas supprimer ce commentaire')
    }
    await postsRepository.deleteComment(commentId)
  },
}