import { useState, type FormEvent } from 'react'
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout'
import { PostCard } from '../../components/posts/PostCard'
import { useCurrentUser } from '../../hooks/useAuth'
import { useMyEvents } from '../../hooks/useOrganizerEvents'
import { useCreatePost, useInfinitePosts, type CreatePostPayload } from '../../hooks/usePosts'
import { ApiError } from '../../lib/api'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-ink-950 placeholder:text-gray-400 focus:border-primary-600 focus:outline-none'

function validImageUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function PublicationsPage() {
  const { data: user } = useCurrentUser()
  const { data: events } = useMyEvents()
  const createPost = useCreatePost()
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfinitePosts(user?.id)

  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [eventId, setEventId] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Seuls les événements publiés peuvent être liés (règle appliquée aussi côté serveur).
  const publishedEvents = events?.filter((e) => e.status === 'PUBLISHED') ?? []
  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const trimmed = content.trim()
    if (!trimmed) {
      setError('Écris le texte de ta publication.')
      return
    }
    if (imageUrl.trim() && !validImageUrl(imageUrl.trim())) {
      setError('URL d\'image invalide.')
      return
    }

    const payload: CreatePostPayload = {
      content: trimmed,
      ...(imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
      ...(eventId ? { eventId: Number(eventId) } : {}),
    }

    createPost.mutate(payload, {
      onSuccess: () => {
        setContent('')
        setImageUrl('')
        setEventId('')
      },
      onError: (err) => setError(err instanceof ApiError ? err.message : 'Publication impossible.'),
    })
  }

  return (
    <OrganizerLayout>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">Publications</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Tes annonces apparaissent dans le fil d'actualité de l'accueil. Chaque publication a son propre lien à partager.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5">
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink-950">Nouvelle publication</span>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Annonce, nouveauté, line-up..."
              className={`${inputClass} resize-y`}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink-950">URL de l'image (optionnel)</span>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold text-ink-950">Événement lié (optionnel)</span>
            <select value={eventId} onChange={(e) => setEventId(e.target.value)} className={inputClass}>
              <option value="">Aucun</option>
              {publishedEvents.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={createPost.isPending}
            className="self-start rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {createPost.isPending ? 'Publication...' : 'Publier'}
          </button>
        </form>

        <h2 className="mt-8 text-base font-extrabold text-ink-950">Mes publications</h2>

        {isLoading && <p className="mt-4 text-sm text-gray-500">Chargement...</p>}
        {isError && (
          <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            Impossible de charger tes publications.
          </p>
        )}
        {!isLoading && !isError && posts.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">Tu n'as encore rien publié.</p>
        )}

        <div className="mt-4 space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} canDelete />
          ))}
        </div>

        {hasNextPage && (
          <button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="mt-4 rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-gray-50 disabled:opacity-50"
          >
            {isFetchingNextPage ? 'Chargement...' : 'Voir plus'}
          </button>
        )}
      </div>
    </OrganizerLayout>
  )
}