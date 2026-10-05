import { useEffect, useRef } from 'react'
import { useInfinitePosts } from '../../hooks/usePosts'
import { PostCard } from './PostCard'

// Fil d'actualité de l'accueil : défilement infini. Un élément invisible en
// bas de liste (« sentinelle ») déclenche le chargement de la page suivante
// dès qu'il approche de l'écran.
export function Feed() {
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useInfinitePosts()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetchingNextPage) fetchNextPage()
      },
      { rootMargin: '300px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const posts = data?.pages.flatMap((page) => page.posts) ?? []

  // Aucune publication et pas d'erreur : on n'affiche pas de section vide.
  if (!isLoading && !isError && posts.length === 0) return null

  return (
    <section className="mx-auto max-w-2xl px-6 pb-16 pt-2 md:px-10">
      <h2 className="text-lg font-extrabold text-ink-950 md:text-2xl">Actualités</h2>
      <p className="mt-1.5 text-sm text-gray-500 md:text-base">
        Les annonces des organisateurs, directement sur Festiv'Guinée.
      </p>

      {isError && (
        <p className="mt-4 text-sm text-gray-400">Impossible de charger les actualités pour le moment.</p>
      )}

      {isLoading && (
        <div className="mt-5 space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="h-48 animate-shimmer rounded-2xl" />
          ))}
        </div>
      )}

      <div className="mt-5 space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasNextPage && <div ref={sentinelRef} className="h-10" />}

      {isFetchingNextPage && <p className="py-4 text-center text-sm text-gray-400">Chargement...</p>}

      {!hasNextPage && posts.length > 0 && (
        <p className="py-6 text-center text-sm text-gray-400">Tu as tout vu pour le moment.</p>
      )}
    </section>
  )
}