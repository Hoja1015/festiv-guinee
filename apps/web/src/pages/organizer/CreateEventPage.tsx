import { useState, type ReactNode } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { OrganizerLayout } from '../../components/organizer/OrganizerLayout'
import {
  useCreateEvent,
  useUpdateEvent,
  usePublishEvent,
  type CreateEventPayload,
} from '../../hooks/useEventMutations'
import { useMyEvents, type OrganizerEvent } from '../../hooks/useOrganizerEvents'
import { ApiError } from '../../lib/api'
import { ImageUploadField } from '../../components/ImageUploadField'
import { ticketTypeLabel } from '../../lib/ticketType'

const TYPE_NAMES = ['STANDARD', 'VIP', 'VVIP'] as const
type TypeName = (typeof TYPE_NAMES)[number]

interface InfoForm {
  title: string
  category: string
  description: string
  venue: string
  city: string
  date: string // valeur brute d'un <input type="datetime-local">
  imageUrl: string
}

interface TypeForm {
  enabled: boolean
  price: string
  quantity: string
  description: string
}

const STEPS = ['Informations', 'Billets', 'Récapitulatif']

const numberFormatter = new Intl.NumberFormat('fr-FR')
const dateFormatter = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-ink-950 placeholder:text-gray-400 focus:border-primary-600 focus:outline-none'

function validateInfo(f: InfoForm): Record<string, string> {
  const errors: Record<string, string> = {}
  if (f.title.trim().length < 3) errors.title = 'Le titre doit contenir au moins 3 caractères'
  if (f.category.trim().length < 2) errors.category = 'La catégorie est requise'
  if (f.description.trim().length < 10) errors.description = 'La description doit contenir au moins 10 caractères'
  if (f.venue.trim().length < 2) errors.venue = 'Le lieu est requis'
  if (f.city.trim().length < 2) errors.city = 'La ville est requise'

  if (!f.date) {
    errors.date = 'La date est requise'
  } else if (new Date(f.date) <= new Date()) {
    errors.date = 'La date doit être dans le futur'
  }

  if (f.imageUrl.trim()) {
    try {
      new URL(f.imageUrl.trim())
    } catch {
      errors.imageUrl = 'URL d\'image invalide'
    }
  }
  return errors
}

function validateTypes(types: Record<TypeName, TypeForm>): Record<string, string> {
  const errors: Record<string, string> = {}
  const enabled = TYPE_NAMES.filter((n) => types[n].enabled)

  if (enabled.length === 0) errors.global = 'Sélectionne au moins un type de billet'

  for (const name of enabled) {
    const price = Number(types[name].price)
    const quantity = Number(types[name].quantity)
    if (!Number.isInteger(price) || price <= 0) errors[`price-${name}`] = 'Prix entier supérieur à 0'
    if (!Number.isInteger(quantity) || quantity <= 0) errors[`quantity-${name}`] = 'Quantité entière supérieure à 0'
    if (types[name].description.length > 191) errors[`description-${name}`] = '191 caractères maximum'
  }
  return errors
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink-950">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  )
}

// <input type="datetime-local"> attend "YYYY-MM-DDTHH:mm" en heure locale,
// pas l'ISO UTC renvoyé par l'API.
function toDatetimeLocal(iso: string): string {
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function emptyTypes(): Record<TypeName, TypeForm> {
  return {
    STANDARD: { enabled: true, price: '', quantity: '', description: '' },
    VIP: { enabled: false, price: '', quantity: '', description: '' },
    VVIP: { enabled: false, price: '', quantity: '', description: '' },
  }
}

function typesFromEvent(event: OrganizerEvent): Record<TypeName, TypeForm> {
  const result = emptyTypes()
  for (const name of TYPE_NAMES) result[name].enabled = false
  for (const tt of event.ticketTypes) {
    result[tt.name] = {
      enabled: true,
      price: String(tt.priceGNF),
      quantity: String(tt.totalQuantity),
      description: tt.description ?? '',
    }
  }
  return result
}

// Même formulaire pour créer et pour modifier un brouillon : `initial` fourni
// = mode modification (champs préremplis, PATCH au lieu de POST).
function EventWizard({ initial }: { initial?: OrganizerEvent }) {
  const navigate = useNavigate()
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent()
  const publishEvent = usePublishEvent()
  const isEdit = initial !== undefined

  const [step, setStep] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  // Si la création réussit mais que la publication échoue, on garde l'id pour
  // ne réessayer que la publication (sinon on créerait un doublon).
  const [createdId, setCreatedId] = useState<number | null>(null)
  // Bloque la navigation pendant l'envoi d'une image, pour ne pas la perdre.
  const [imageUploading, setImageUploading] = useState(false)

  const [info, setInfo] = useState<InfoForm>(
    initial
      ? {
          title: initial.title,
          category: initial.category,
          description: initial.description,
          venue: initial.venue,
          city: initial.city,
          date: toDatetimeLocal(initial.date),
          imageUrl: initial.imageUrl ?? '',
        }
      : { title: '', category: '', description: '', venue: '', city: '', date: '', imageUrl: '' }
  )

  const [types, setTypes] = useState<Record<TypeName, TypeForm>>(
    initial ? typesFromEvent(initial) : emptyTypes()
  )

  const infoErrors = showErrors ? validateInfo(info) : {}
  const typeErrors = showErrors ? validateTypes(types) : {}
  const isSubmitting = createEvent.isPending || updateEvent.isPending || publishEvent.isPending
  const enabledTypes = TYPE_NAMES.filter((n) => types[n].enabled)

  function updateInfo<K extends keyof InfoForm>(key: K, value: InfoForm[K]) {
    setInfo((prev) => ({ ...prev, [key]: value }))
  }

  function updateType(name: TypeName, patch: Partial<TypeForm>) {
    setTypes((prev) => ({ ...prev, [name]: { ...prev[name], ...patch } }))
  }

  function goNext() {
    const errors = step === 0 ? validateInfo(info) : validateTypes(types)
    if (Object.keys(errors).length > 0) {
      setShowErrors(true)
      return
    }
    setShowErrors(false)
    setStep((s) => s + 1)
  }

  function goBack() {
    setShowErrors(false)
    setSubmitError(null)
    setStep((s) => s - 1)
  }

  function buildPayload(): CreateEventPayload {
    return {
      title: info.title.trim(),
      description: info.description.trim(),
      category: info.category.trim(),
      venue: info.venue.trim(),
      city: info.city.trim(),
      date: new Date(info.date).toISOString(),
      ...(info.imageUrl.trim() ? { imageUrl: info.imageUrl.trim() } : {}),
      ticketTypes: enabledTypes.map((name) => ({
        name,
        priceGNF: Number(types[name].price),
        totalQuantity: Number(types[name].quantity),
        ...(types[name].description.trim() ? { description: types[name].description.trim() } : {}),
      })),
    }
  }

  async function submit(publish: boolean) {
    setSubmitError(null)
    // Variables locales : le state serait périmé dans le catch.
    let eventId = initial?.id ?? createdId
    let saved = false
    try {
      if (initial) {
        await updateEvent.mutateAsync({ id: initial.id, payload: buildPayload() })
        saved = true
      } else if (eventId === null) {
        const event = await createEvent.mutateAsync(buildPayload())
        eventId = event.id
        setCreatedId(eventId)
        saved = true
      } else {
        saved = true // déjà créé lors d'une tentative précédente
      }

      if (publish) {
        await publishEvent.mutateAsync(eventId!)
      }
      navigate('/organisateur/evenements')
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Une erreur est survenue. Réessaie dans un instant.'
      setSubmitError(
        saved
          ? `Les modifications sont enregistrées en brouillon, mais la publication a échoué : ${message}`
          : message
      )
    }
  }

  const totalCapacity = enabledTypes.reduce((sum, n) => sum + Number(types[n].quantity), 0)

  return (
    <OrganizerLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-xl font-extrabold text-ink-950 md:text-2xl">
          {isEdit ? 'Modifier le brouillon' : 'Nouvel événement'}
        </h1>

        {/* Indicateur d'étapes */}
        <ol className="mt-5 flex items-center gap-2">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center gap-2">
              <span
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                  i <= step ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`hidden text-sm font-bold sm:inline ${i === step ? 'text-ink-950' : 'text-gray-400'}`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px flex-1 bg-gray-200" />}
            </li>
          ))}
        </ol>
        <p className="mt-2 text-xs font-bold text-gray-500 sm:hidden">
          Étape {step + 1} sur {STEPS.length} — {STEPS[step]}
        </p>

        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-5 md:p-7">
          {/* Étape 1 — Informations */}
          {step === 0 && (
            <div className="flex flex-col gap-4">
              <Field label="Titre" error={infoErrors.title}>
                <input
                  className={inputClass}
                  value={info.title}
                  onChange={(e) => updateInfo('title', e.target.value)}
                  placeholder="Nom de l'événement"
                />
              </Field>

              <Field label="Catégorie" error={infoErrors.category}>
                <input
                  className={inputClass}
                  value={info.category}
                  onChange={(e) => updateInfo('category', e.target.value)}
                  placeholder="ex : Concert"
                />
              </Field>

              <Field label="Description" error={infoErrors.description}>
                <textarea
                  className={`${inputClass} min-h-[110px] resize-y`}
                  value={info.description}
                  onChange={(e) => updateInfo('description', e.target.value)}
                  placeholder="Présente l'événement en quelques lignes"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Lieu" error={infoErrors.venue}>
                  <input
                    className={inputClass}
                    value={info.venue}
                    onChange={(e) => updateInfo('venue', e.target.value)}
                    placeholder="Salle, stade, site..."
                  />
                </Field>
                <Field label="Ville" error={infoErrors.city}>
                  <input
                    className={inputClass}
                    value={info.city}
                    onChange={(e) => updateInfo('city', e.target.value)}
                  />
                </Field>
              </div>

              <Field label="Date et heure" error={infoErrors.date}>
                <input
                  type="datetime-local"
                  className={inputClass}
                  value={info.date}
                  onChange={(e) => updateInfo('date', e.target.value)}
                />
              </Field>

              <ImageUploadField
                label="Image de l'événement (optionnel)"
                folder="events"
                value={info.imageUrl}
                onChange={(url) => updateInfo('imageUrl', url)}
                onUploadingChange={setImageUploading}
                error={infoErrors.imageUrl}
              />
            </div>
          )}

          {/* Étape 2 — Billets */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-gray-500">
                Active les types de billets que tu veux vendre. Le stock de départ est entièrement disponible.
              </p>

              {typeErrors.global && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{typeErrors.global}</p>
              )}

              {TYPE_NAMES.map((name) => {
                const t = types[name]
                return (
                  <div
                    key={name}
                    className={`rounded-xl border p-4 transition ${
                      t.enabled ? 'border-primary-600 bg-primary-600/[0.03]' : 'border-gray-200'
                    }`}
                  >
                    <label className="flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={t.enabled}
                        onChange={(e) => updateType(name, { enabled: e.target.checked })}
                        className="h-4 w-4 accent-primary-600"
                      />
                      <span className="text-sm font-extrabold text-ink-950">{ticketTypeLabel(name)}</span>
                    </label>

                    {t.enabled && (
                      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                        <Field label="Prix (GNF)" error={typeErrors[`price-${name}`]}>
                          <input
                            type="number"
                            min={1}
                            step={1}
                            inputMode="numeric"
                            className={inputClass}
                            value={t.price}
                            onChange={(e) => updateType(name, { price: e.target.value })}
                          />
                        </Field>
                        <Field label="Quantité disponible" error={typeErrors[`quantity-${name}`]}>
                          <input
                            type="number"
                            min={1}
                            step={1}
                            inputMode="numeric"
                            className={inputClass}
                            value={t.quantity}
                            onChange={(e) => updateType(name, { quantity: e.target.value })}
                          />
                        </Field>
                        <div className="md:col-span-2">
                          <Field label="Description (optionnel)" error={typeErrors[`description-${name}`]}>
                            <input
                              className={inputClass}
                              value={t.description}
                              onChange={(e) => updateType(name, { description: e.target.value })}
                              placeholder="ex : accès zone avant-scène"
                            />
                          </Field>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Étape 3 — Récapitulatif */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-extrabold text-ink-950">{info.title.trim()}</h2>
                <p className="mt-1 text-sm text-gray-500">{info.category.trim()}</p>
              </div>

              <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold text-gray-500">Date</dt>
                  <dd className="font-bold text-ink-950">{dateFormatter.format(new Date(info.date))}</dd>
                </div>
                <div>
                  <dt className="text-xs font-bold text-gray-500">Lieu</dt>
                  <dd className="font-bold text-ink-950">
                    {info.venue.trim()}, {info.city.trim()}
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-xs font-bold text-gray-500">Description</dt>
                  <dd className="whitespace-pre-line text-ink-950">{info.description.trim()}</dd>
                </div>
                {info.imageUrl.trim() && (
                  <div className="md:col-span-2">
                    <dt className="text-xs font-bold text-gray-500">Image</dt>
                    <dd>
                      <img
                        src={info.imageUrl.trim()}
                        alt=""
                        className="mt-1 h-32 w-full rounded-xl object-cover md:w-64"
                      />
                    </dd>
                  </div>
                )}
              </dl>

              <div>
                <h3 className="text-xs font-bold text-gray-500">Billets</h3>
                <ul className="mt-2 divide-y divide-gray-100 rounded-xl border border-gray-100">
                  {enabledTypes.map((name) => (
                    <li key={name} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                      <span className="font-extrabold text-ink-950">{ticketTypeLabel(name)}</span>
                      <span className="text-right text-gray-500">
                        {numberFormatter.format(Number(types[name].quantity))} places ·{' '}
                        <span className="font-bold text-ink-950">
                          {numberFormatter.format(Number(types[name].price))} GNF
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-gray-500">
                  Capacité totale : {numberFormatter.format(totalCapacity)} places
                </p>
              </div>

              <p className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
                En brouillon, l'événement reste invisible du public. Tu pourras le publier plus tard depuis la
                liste de tes événements.
              </p>
            </div>
          )}

          {submitError && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{submitError}</p>
          )}

          {/* Navigation */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {step === 0 && (
                <Link
                  to="/organisateur/evenements"
                  className="inline-block rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 transition hover:text-ink-950"
                >
                  Annuler
                </Link>
              )}
              {step > 0 && createdId === null && (
                <button
                  onClick={goBack}
                  disabled={isSubmitting}
                  className="rounded-xl px-4 py-2.5 text-sm font-bold text-gray-500 transition hover:text-ink-950 disabled:opacity-50"
                >
                  Retour
                </button>
              )}
            </div>

            {step < 2 ? (
              <button
                onClick={goNext}
                disabled={imageUploading}
                className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
              >
                {imageUploading ? "Envoi de l'image..." : 'Suivant'}
              </button>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => submit(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-ink-950 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  {isSubmitting && !publishEvent.isPending
                    ? 'Enregistrement...'
                    : isEdit
                      ? 'Enregistrer le brouillon'
                      : 'Enregistrer en brouillon'}
                </button>
                <button
                  onClick={() => submit(true)}
                  disabled={isSubmitting}
                  className="rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Publication...' : 'Publier l\'événement'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </OrganizerLayout>
  )
}

export function CreateEventPage() {
  return <EventWizard />
}

// Modification d'un brouillon. Seuls les brouillons sont modifiables : une fois
// publié, les billets ont pu être vendus et ne doivent plus bouger.
export function EditEventPage() {
  const { id } = useParams()
  const { data: events, isLoading, isError } = useMyEvents()
  const event = events?.find((e) => e.id === Number(id))

  if (isLoading) {
    return (
      <OrganizerLayout>
        <p className="text-sm text-gray-500">Chargement...</p>
      </OrganizerLayout>
    )
  }

  if (isError || !event || event.status !== 'DRAFT') {
    return (
      <OrganizerLayout>
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {isError
            ? 'Impossible de charger cet événement.'
            : !event
              ? 'Événement introuvable.'
              : 'Seul un brouillon peut être modifié.'}
        </p>
        <Link
          to="/organisateur/evenements"
          className="mt-4 inline-block text-sm font-bold text-primary-600 hover:underline"
        >
          Retour à mes événements
        </Link>
      </OrganizerLayout>
    )
  }

  // `key` : si on change d'événement, le formulaire repart des bonnes valeurs.
  return <EventWizard key={event.id} initial={event} />
}