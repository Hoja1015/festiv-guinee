import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useCurrentUser } from '../../hooks/useAuth'
import { useToggleLike, useDeletePost, useUpdatePost, type Post } from '../../hooks/usePosts'
import { formatRelativeTime } from '../../lib/relativeTime'
import { HeartIcon, CommentIcon, ShareIcon } from '../FeedIcons'
import { ConfirmDialog } from '../ConfirmDialog'

interface PostCardProps {
  post: Post
  // Page de détail : le bouton commentaire ne renvoie pas vers elle-même.
  detail?: boolean
  // Bouton « Supprimer » (back-office organisateur, sur ses propres publications).
  canDelete?: boolean
  // Bouton « Modifier » : par défaut visible dès que la suppression l'est.
  canEdit?: boolean
}

const MAX_CONTENT_LENGTH = 2000

export function PostCard({ post, detail = false, canDelete = false, canEdit = canDelete }: PostCardProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { data: user } = useCurrentUser()
  const toggleLike = useToggleLike()
  const deletePost = useDeletePost()
  const updatePost = useUpdatePost()
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(post.content)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // À l'ouverture de l'édition, le curseur se place à la fin du texte.
  useEffect(() => {
    if (!editing) return
    const el = textareaRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(el.value.length, el.value.length)
  }, [editing])

  function startEdit() {
    updatePost.reset()
    setDraft(post.content)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setDraft(post.content)
  }

  function saveEdit() {
    const content = draft.trim()
    if (content === '' || content === post.content) return
    updatePost.mutate({ postId: post.id, payload: { content } }, { onSuccess: () => setEditing(false) })
  }

  const trimmedDraft = draft.trim()
  const canSave = trimmedDraft !== '' && trimmedDraft !== post.content && !updatePost.isPending

  const postUrl = `${window.location.origin}/publications/${post.id}`

  function requireLogin(): boolean {
    if (user) return true
    // Même mécanisme que RequireAuth : après la connexion, retour ici.
    navigate('/login', { state: { from: location } })
    return false
  }

  function handleLike() {
    if (!requireLogin()) return
    toggleLike.mutate({ postId: post.id, currentlyLiked: post.likedByMe })
  }

  async function handleShare() {
    const shareData = { title: `Festiv'Guinée — ${post.author.fullName}`, text: post.content.slice(0, 120), url: postUrl }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch {
        // L'utilisateur a fermé la feuille de partage : rien à faire.
      }
      return
    }

    try {
      await navigator.clipboard.writeText(postUrl)
      setShareFeedback('Lien copié')
    } catch {
      setShareFeedback('Copie impossible')
    }
    setTimeout(() => setShareFeedback(null), 2000)
  }

  function handleDelete() {
    deletePost.mutate(post.id, { onSettled: () => setConfirmDelete(false) })
  }

  const actionClass =
    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-ink-950'

  return (
    <article className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <div className="flex items-center gap-3 p-4 pb-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-extrabold text-white">
          {post.author.fullName.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-bold text-ink-950">{post.author.fullName}</div>
          <div className="text-xs text-gray-400">{formatRelativeTime(post.createdAt)}</div>
        </div>
        {canEdit && !editing && (
          <button
            type="button"
            onClick={startEdit}
            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-400 transition hover:bg-primary-600/10 hover:text-primary-600"
          >
            Modifier
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={deletePost.isPending}
            className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-gray-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            Supprimer
          </button>
        )}
      </div>

      {editing ? (
        <div className="px-4">
          <label htmlFor={`post-edit-${post.id}`} className="sr-only">
            Texte de la publication
          </label>
          <textarea
            id={`post-edit-${post.id}`}
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancelEdit()
            }}
            maxLength={MAX_CONTENT_LENGTH}
            rows={5}
            disabled={updatePost.isPending}
            className="w-full resize-y rounded-xl border border-gray-200 px-3.5 py-3 text-[15px] leading-relaxed text-ink-950 outline-none transition focus:border-primary-600 disabled:opacity-60"
          />
          <div className="mt-1 text-right text-xs text-gray-400">
            {draft.length} / {MAX_CONTENT_LENGTH}
          </div>

          {updatePost.isError && (
            <p className="mt-2 rounded-xl bg-red-50 px-3.5 py-2 text-sm text-red-600">
              {updatePost.error instanceof Error ? updatePost.error.message : 'Impossible de modifier la publication.'}
            </p>
          )}

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={updatePost.isPending}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-bold text-ink-950 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={!canSave}
              className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
            >
              {updatePost.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </div>
      ) : (
        <p className="whitespace-pre-line break-words px-4 text-[15px] leading-relaxed text-ink-950">{post.content}</p>
      )}

      {post.event && (
        <Link
          to={`/events/${post.event.id}`}
          className="mx-4 mt-3 inline-flex max-w-full items-center gap-1.5 rounded-full bg-primary-600/10 px-3 py-1 text-xs font-bold text-primary-600 transition hover:bg-primary-600/20"
        >
          <span className="truncate">{post.event.title}</span>
          <span aria-hidden>→</span>
        </Link>
      )}

      {post.imageUrl && (
        <img src={post.imageUrl} alt="" loading="lazy" className="mt-3 max-h-[480px] w-full object-cover" />
      )}

      <div className="mt-1 flex items-center gap-1 border-t border-gray-100 px-2 py-1.5">
        <button
          onClick={handleLike}
          disabled={toggleLike.isPending}
          aria-pressed={post.likedByMe}
          className={`${actionClass} ${post.likedByMe ? 'text-red-500 hover:text-red-500' : ''}`}
        >
          <HeartIcon className="h-5 w-5" filled={post.likedByMe} />
          {post.likesCount}
        </button>

        {detail ? (
          <span className={`${actionClass} cursor-default hover:bg-transparent`}>
            <CommentIcon className="h-5 w-5" />
            {post.commentsCount}
          </span>
        ) : (
          <Link to={`/publications/${post.id}`} className={actionClass}>
            <CommentIcon className="h-5 w-5" />
            {post.commentsCount}
          </Link>
        )}

        <button onClick={handleShare} className={`${actionClass} ml-auto`}>
          <ShareIcon className="h-5 w-5" />
          {shareFeedback ?? 'Partager'}
        </button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        variant="danger"
        title="Supprimer cette publication ?"
        message="Ses likes et ses commentaires seront supprimés aussi. Cette action est définitive."
        confirmLabel="Supprimer"
        loading={deletePost.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </article>
  )
}