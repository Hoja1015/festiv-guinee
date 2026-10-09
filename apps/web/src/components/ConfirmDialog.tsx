import { useEffect, useId, useRef } from 'react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  // "danger" colore le bouton de confirmation en rouge (suppression, etc.)
  variant?: 'default' | 'danger'
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId()
  const messageId = useId()
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)
  onCancelRef.current = onCancel

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    // Le focus démarre sur "Annuler" : un appui sur Entrée ne confirme rien par erreur.
    cancelRef.current?.focus()
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Phase de capture : Échap ferme uniquement cette fenêtre, pas un menu ouvert derrière.
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.stopPropagation()
        onCancelRef.current()
        return
      }
      if (event.key === 'Tab') {
        const first = cancelRef.current
        const last = confirmRef.current
        if (!first || !last) return
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', onKeyDown, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.body.style.overflow = previousOverflow
      previouslyFocused?.focus()
    }
  }, [open])

  if (!open) return null

  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:outline-red-600'
      : 'bg-primary-600 text-white hover:bg-primary-700 focus-visible:outline-primary-600'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div
        className="absolute inset-0 animate-fade-in-up bg-ink-950/60 backdrop-blur-sm"
        onClick={loading ? undefined : onCancel}
        aria-hidden="true"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={message ? messageId : undefined}
        className="relative w-full max-w-sm animate-fade-in-up rounded-3xl bg-white p-6 shadow-2xl shadow-ink-950/30"
      >
        <h2 id={titleId} className="text-lg font-extrabold text-ink-950">
          {title}
        </h2>
        {message && (
          <p id={messageId} className="mt-2 text-sm leading-relaxed text-gray-500">
            {message}
          </p>
        )}

        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60 ${confirmClass}`}
          >
            {loading ? 'Veuillez patienter…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}