import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query'
import { api } from '../lib/api'

export interface Post {
  id: number
  content: string
  imageUrl: string | null
  createdAt: string
  author: { id: number; fullName: string }
  event: { id: number; title: string } | null
  likesCount: number
  commentsCount: number
  likedByMe: boolean
}

export interface PostComment {
  id: number
  content: string
  createdAt: string
  user: { id: number; fullName: string }
}

interface PostsPage {
  posts: Post[]
  nextCursor: number | null
}

const PAGE_SIZE = 10

// Fil d'actualité paginé par curseur. `authorId` : uniquement les
// publications d'un organisateur (page « Publications » du back-office).
export function useInfinitePosts(authorId?: number) {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed', authorId ?? 'all'],
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE) })
      if (pageParam !== undefined) params.set('cursor', String(pageParam))
      if (authorId !== undefined) params.set('authorId', String(authorId))
      return api.get<PostsPage>(`/posts?${params.toString()}`)
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}

export function usePost(postId: number | undefined) {
  return useQuery({
    queryKey: ['posts', 'detail', postId],
    queryFn: () => api.get<{ post: Post }>(`/posts/${postId}`).then((r) => r.post),
    enabled: postId !== undefined,
  })
}

// Met à jour une publication dans tous les caches où elle apparaît (fil et
// page de détail), sans refaire de requête : le like/commentaire se voit
// immédiatement.
function updatePostInCaches(queryClient: QueryClient, postId: number, updater: (post: Post) => Post) {
  queryClient.setQueriesData<InfiniteData<PostsPage>>({ queryKey: ['posts', 'feed'] }, (old) =>
    old && {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        posts: page.posts.map((p) => (p.id === postId ? updater(p) : p)),
      })),
    }
  )
  queryClient.setQueryData<Post>(['posts', 'detail', postId], (old) => (old ? updater(old) : old))
}

export function useToggleLike() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ postId, currentlyLiked }: { postId: number; currentlyLiked: boolean }) =>
      currentlyLiked
        ? api.delete<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`)
        : api.post<{ liked: boolean; likesCount: number }>(`/posts/${postId}/like`),
    onSuccess: (result, { postId }) => {
      updatePostInCaches(queryClient, postId, (p) => ({
        ...p,
        likedByMe: result.liked,
        likesCount: result.likesCount,
      }))
    },
  })
}

export interface CreatePostPayload {
  content: string
  imageUrl?: string
  eventId?: number
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePostPayload) =>
      api.post<{ post: Post }>('/posts', payload).then((r) => r.post),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts', 'feed'] }),
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (postId: number) => api.delete(`/posts/${postId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })
}

export function usePostComments(postId: number | undefined) {
  return useQuery({
    queryKey: ['posts', 'comments', postId],
    queryFn: () =>
      api.get<{ comments: PostComment[] }>(`/posts/${postId}/comments`).then((r) => r.comments),
    enabled: postId !== undefined,
  })
}

export function useAddComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (content: string) =>
      api.post<{ comment: PostComment }>(`/posts/${postId}/comments`, { content }).then((r) => r.comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'comments', postId] })
      updatePostInCaches(queryClient, postId, (p) => ({ ...p, commentsCount: p.commentsCount + 1 }))
    },
  })
}

export function useDeleteComment(postId: number) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (commentId: number) => api.delete(`/posts/${postId}/comments/${commentId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts', 'comments', postId] })
      updatePostInCaches(queryClient, postId, (p) => ({
        ...p,
        commentsCount: Math.max(0, p.commentsCount - 1),
      }))
    },
  })
}