import type { Request, Response } from 'express'
import { postsService } from './posts.service.js'
import { createPostSchema, createCommentSchema, listPostsQuerySchema } from './posts.schema.js'
import { ValidationError } from '../../shared/errors.js'

// Les @types/express récents typent les params en string | string[].
function parseId(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value
  const id = Number(raw)
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('Identifiant invalide')
  }
  return id
}

export const postsController = {
  async list(req: Request, res: Response) {
    const { cursor, limit, authorId } = listPostsQuerySchema.parse(req.query)
    const result = await postsService.list(req.user?.userId, limit, cursor, authorId)
    res.json(result)
  },

  async getById(req: Request, res: Response) {
    const post = await postsService.getById(req.user?.userId, parseId(req.params.id))
    res.json({ post })
  },

  async create(req: Request, res: Response) {
    const input = createPostSchema.parse(req.body)
    const post = await postsService.create(req.user!.userId, input)
    res.status(201).json({ post })
  },

  async remove(req: Request, res: Response) {
    await postsService.remove(parseId(req.params.id), req.user!.userId)
    res.status(204).send()
  },

  async like(req: Request, res: Response) {
    const result = await postsService.like(parseId(req.params.id), req.user!.userId)
    res.json(result)
  },

  async unlike(req: Request, res: Response) {
    const result = await postsService.unlike(parseId(req.params.id), req.user!.userId)
    res.json(result)
  },

  async listComments(req: Request, res: Response) {
    const comments = await postsService.listComments(parseId(req.params.id))
    res.json({ comments })
  },

  async addComment(req: Request, res: Response) {
    const input = createCommentSchema.parse(req.body)
    const comment = await postsService.addComment(parseId(req.params.id), req.user!.userId, input.content)
    res.status(201).json({ comment })
  },

  async removeComment(req: Request, res: Response) {
    await postsService.removeComment(
      parseId(req.params.id),
      parseId(req.params.commentId),
      req.user!.userId
    )
    res.status(204).send()
  },
}