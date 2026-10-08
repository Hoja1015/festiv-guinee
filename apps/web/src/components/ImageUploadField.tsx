import { useId, useRef, useState } from 'react'
import { optimizeImageUrl, uploadImage, type UploadFolder } from '../lib/cloudinary'

interface Props {
  label: string
  folder: UploadFolder
  value: string
  onChange: (url: string) => void
  onUploadingChange?: (uploading: boolean) => void
  error?: string
}

// Champ d'image : envoi d'un fichier (hébergé sur Cloudinary) ou, à défaut,
// adresse web collée à la main. `value` contient toujours l'adresse finale.
export function ImageUploadField({ label, folder, value, onChange, onUploadingChange, error }: Props) {
  const uid = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  async function handleFile(file: File | undefined) {
    if (!file) return
    setUploadError(null)
    setUploading(true)
    onUploadingChange?.(true)
    try {
      onChange(await uploadImage(file, folder))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Impossible d'envoyer l'image.")
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
      // Permet de choisir à nouveau le même fichier après une erreur.
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const trimmed = value.trim()

  return (
    <div>
      <span id={`${uid}-label`} className="mb-1.5 block text-xs font-bold text-ink-950">
        {label}
      </span>

      {trimmed && (
        <img
          src={optimizeImageUrl(trimmed, 400)}
          alt="Aperçu de l'image choisie"
          className="mb-3 h-32 w-full rounded-xl object-cover md:w-64"
        />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          aria-labelledby={`${uid}-label`}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-ink-950 transition hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? 'Envoi en cours...' : trimmed ? "Changer l'image" : 'Choisir une image'}
        </button>
        {trimmed && !uploading && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-sm font-bold text-gray-600 transition hover:text-ink-950"
          >
            Retirer
          </button>
        )}
        <span className="text-xs text-gray-600">JPG, PNG ou WebP, 5 Mo maximum</span>
      </div>

      {(uploadError || error) && (
        <p role="alert" className="mt-1.5 text-xs text-red-600">
          {uploadError ?? error}
        </p>
      )}

      <details className="mt-3">
        <summary className="cursor-pointer text-xs font-bold text-gray-600">
          Ou coller l'adresse d'une image
        </summary>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          aria-label="Adresse web de l'image"
          className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-ink-950 placeholder:text-gray-500 focus:border-primary-600 focus:outline-none"
        />
      </details>
    </div>
  )
}