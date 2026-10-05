import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { PostCard } from '../components/posts/PostCard'
import { useCurrentUser } from '../hooks/useAuth'
import {
  usePost,
  usePostComments,
  useAddComment,
  useDeleteComment,
  type Post,
  type PostComment,
} from '../hooks/usePosts'
import { ApiError } from '../lib/api'
import { formatRelativeTime } from '../lib/relativeTime'

function CommentItem({
  comment,
  canDelete,
  onDelete,
  deleting,
}: {
  comment: PostComment
  canDelete: boolean
  onDelete: () => void
  deleting: boolean
}) {
  return (
    <li className="flex gap-3 py-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-extrabold text-ink-950">
        {comment.user.fullName.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-bold text-ink-950">{comment.user.fullName}</span>
          <span className="flex-shrink-0 text-xs text-gray-400">{formatRelativeTime(comment.createdAt)}</span>
        </div>
        <p className="mt-0.5 whitespace-pre-line break-words text-sm text-ink-950">{comment.content}</p>
      </div>
      {canDelete && (
        <button
          onClick={onDelete}
          disabled={deleting}
          className="flex-shrink-0 self-start text-xs font-bold text-gray-400 transition hover:text-red-600 disabled:opacity-50"
        >
          Supprimer
        </button>
      )}
    </li>
  )
}

function CommentsSection({ post }: { post: Post }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: user } = useCurrentUser()
  const { data: comments, isLoading, isError } = usePostComments(post.id)
  const addComment = useAddComment(post.id)
  const deleteComment = useDeleteComment(post.id)

  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setError(null)
    addComment.mutate(content, {
      onSuccess: () => setText(''),
      onError: (err) =>
        setError(err instanceof ApiError ? err.message : 'Impossible d\'envoyer le commentaire.'),
    })
  }

  return (
    <section className="mt-6">
      <h2 className="text-base font-extrabold text-ink-950">
        Commentaires {comments ? `(${comments.length})` : ''}
      </h2>

      {user ? (
        <form onSubmit={handleSubmit} className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={1000}
            rows={2}
            placeholder="Écrire un commentaire..."
            className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-ink-950 placeholder:text-gray-400 focus:border-primary-600 focus:outline-none"
          />
          {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={addComment.isPending || text.trim().length === 0}
            className="mt-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {addComment.isPending ? 'Envoi...' : 'Commenter'}
          </button>
        </form>
      ) : (
        <button
          onClick={() => navigate('/login', { state: { from: location } })}
          className="mt-3 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-gray-50"
        >
          Connecte-toi pour commenter
        </button>
      )}

      {isLoading && <p className="mt-4 text-sm text-gray-400">Chargement...</p>}
      {isError && <p className="mt-4 text-sm text-gray-400">Impossible de charger les commentaires.</p>}

      {comments && comments.length === 0 && (
        <p className="mt-4 text-sm text-gray-400">Aucun commentaire pour le moment.</p>
      )}

      {comments && comments.length > 0 && (
        <ul className="mt-2 divide-y divide-gray-100">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              // L'auteur du commentaire ou l'auteur de la publication peut le supprimer.
              canDelete={user?.id === comment.user.id || user?.id === post.author.id}
              deleting={deleteComment.isPending && deleteComment.variables === comment.id}
              onDelete={() => deleteComment.mutate(comment.id)}
            />
          ))}
        </ul>
      )}
    </section>
  )
}

export function PostPage() {
  const { id } = useParams()
  const postId = Number(id)
  const validId = Number.isInteger(postId) && postId > 0
  const { data: post, isLoading, isError } = usePost(validId ? postId : undefined)

  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-5 md:pt-10">
      <Link to="/" className="text-sm font-bold text-gray-500 transition hover:text-ink-950">
        ← Retour à l'accueil
      </Link>

      {isLoading && <div className="mt-5 h-56 animate-shimmer rounded-2xl" />}

      {(isError || !validId) && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          Cette publication n'existe pas ou n'est plus disponible.
        </p>
      )}

      {post && (
        <div className="mt-5">
          <PostCard post={post} detail />
          <CommentsSection post={post} />
        </div>
      )}
    </div>
  )
}